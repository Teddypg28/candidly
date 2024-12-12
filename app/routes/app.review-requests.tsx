import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Badge, Card, ChoiceList, EmptyState, IndexFilters, IndexFiltersProps, IndexTable, IndexTableProps, Link, Page, useSetIndexFiltersMode } from "@shopify/polaris";

import db from '../db.server'

import { authenticate } from "~/shopify.server";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { initialReviewRequestTableState, ReviewRequestData, ReviewRequestTableState } from "~/types/types";
import { createEachProductReviewRequest } from "~/helpers/createEachProductReviewRequest";

export async function loader({ request } : LoaderFunctionArgs) {

    const { session, admin } = await authenticate.admin(request)

    const visitedBefore = await db.currentOrdersStatus.findFirst({where: {store: {equals: session.shop}}})
    if (!visitedBefore) {
        await db.currentOrdersStatus.create({data: {store: session.shop}})
    }

    const currentOrdersStatus = await db.currentOrdersStatus.findFirst({where: {store: {equals: session.shop}}})
    const appSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}})

    // Retrieve all current orders if current orders aren't handled and store settings are set
    if (!currentOrdersStatus?.handled && appSettings) {
        const reviewRequestObjects: any = []
        const query = `{
            orders(first: 100) {
              nodes {
                displayFulfillmentStatus
                id
                name
                createdAt
                cancelledAt
                customer {
                    firstName,
                    lastName
                }
                email
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }`

        const retrieveCurrentOrders = async (query: string) => {

            const queryResult = await admin.graphql(query)
            const queryResultData = await queryResult.json()

            queryResultData.data.orders.nodes.forEach((node: any) => {
    
                if (node.cancelledAt === null) {

                    const numOfDaysSince = Math.round((new Date().valueOf() - new Date(node.createdAt).valueOf()) / (1000 * 60 * 60 * 24))
                    let requestDate
        
                    if (node.displayFulfillmentStatus.toLowerCase() === 'fulfilled') {
                        if (numOfDaysSince >= appSettings.firstReviewRequest) {                            
                            requestDate = new Date()
                            requestDate.setDate(requestDate.getDate() + 1) 
                        } else {
                            requestDate = new Date(node.createdAt)
                            requestDate.setDate(requestDate.getDate() + appSettings.firstReviewRequest)
                        }

                    }      

                    reviewRequestObjects.push({
                        store: session.shop,
                        orderName: node.name,
                        date: node.createdAt,
                        orderId: node.id.split('Order/')[1],
                        requestDate,
                        fulfillmentStatus: node.displayFulfillmentStatus.toLowerCase() === 'fulfilled' ? 'fulfilled' : 'pending'
                    })

                }
            })

            if (queryResultData.data.orders.pageInfo.hasNextPage) {

                const nextQuery = `
                {
                    orders(first: 100, after: ${queryResultData.data.orders.pageInfo.endCursor}) {
                      nodes {
                        displayFulfillmentStatus
                        id
                        name
                        createdAt
                        cancelledAt
                      }
                      pageInfo {
                        hasNextPage
                        endCursor
                      }
                    }
                  }    
                `

                retrieveCurrentOrders(nextQuery)

            } else {

                return reviewRequestObjects

            }

        } 

        const currentOrderObjects = await retrieveCurrentOrders(query)
        
        await Promise.all(currentOrderObjects.map(async (orderObject: any) => {

            return db.reviewRequest.create({data: orderObject})

        }))

        await db.currentOrdersStatus.updateMany({where: {store: {equals: session.shop}}, data: {handled: true}})

    }

    // Retrieve review request data

    const reviewRequestData = await db.reviewRequest.findMany({where: {store: {equals: session.shop}}})

    const results = await Promise.all(reviewRequestData.map(async (request) => {

        return createEachProductReviewRequest(request, admin)

    }))

    const reviewRequests: ReviewRequestData[] = []

    results.forEach(result => {
        result.forEach((requestObject: any) => {
            reviewRequests.push(requestObject)
        })
    })

    // Retrieve saved table view data

    const savedTableViews = await db.savedReviewRequestTableView.findMany({where: {store: {equals: session.shop}}, omit: {id: true, store: true}, orderBy: {id: "asc"}})

    // Serve both

    return json({savedTableViews, reviewRequests})

}

export async function action({ request } : ActionFunctionArgs) {

    const { session } = await authenticate.admin(request)

    const data = await request.json()
    const { state, action, nameToUpdate } = data
    
    if (state) {
        delete state['selectedTab']
    }

    if (action === 'create') {

        await db.savedReviewRequestTableView.create({ data: { ...state, store: session.shop } })

    } else if (action === 'update') {

        if (nameToUpdate) {

            await db.savedReviewRequestTableView.updateMany({ where: {store: {equals: session.shop}, AND: {name: {equals: nameToUpdate}}}, data : { ...state, store: session.shop } })

        } else {

            await db.savedReviewRequestTableView.updateMany({ where: {store: {equals: session.shop}, AND: {name: {equals: state.name}}}, data : { ...state, store: session.shop } })

        }

    } else {

        await db.savedReviewRequestTableView.deleteMany({ where: {store: {equals: session.shop}, AND: {name: {equals: data.viewNameToDelete}}}})

    }

    return true

}

const joinFilters = (filters: string[]) => filters.join(', ')

export default function ReviewRequests() {

    const data = useLoaderData<typeof loader>()
    const { reviewRequests, savedTableViews } = data

    // STATE HANDLING

    const [indexTableState, setIndexTableState]= useState<ReviewRequestTableState>(initialReviewRequestTableState)
    const [pageNumber, setPageNumber] = useState(1)

    // Filter reviews based on selected filters
    let filteredReviewRequests = reviewRequests.filter(request => {
        return request.orderName.includes(indexTableState.queryValue.trim()) || 
               new Date(request.date).toLocaleDateString().includes(indexTableState.queryValue.trim())
    }).filter(request => {
        if (indexTableState.selectedProductFilters.length > 0) {
            return indexTableState.selectedProductFilters.includes(request.product)
        }
        return request
    }).filter(request => {
        if (indexTableState.selectedFulfillmentFilters.length > 0) {
            return indexTableState.selectedFulfillmentFilters.includes(request.fulfillmentStatus || 'pending')
        }
        return request
    }).filter(request => {
        if (indexTableState.selectedReviewStatusFilters.length > 0) {
            return indexTableState.selectedReviewStatusFilters.includes(request.reviewStatus)
        }
        return request
    }).sort((a, b) => {
        if (indexTableState.sortSelected) {
            const sortValue = indexTableState.sortSelected[0]
            switch(sortValue) {
                case 'date asc':
                    return new Date(a.date).getTime() - new Date(b.date).getTime()
                case 'date desc':
                    return new Date(b.date).getTime() - new Date(a.date).getTime()
                case 'numEmails asc':
                    return a.emailsSent - b.emailsSent
                case 'numEmails desc':
                    return b.emailsSent - a.emailsSent
            }
        }
        return 0
    })

    const numReviewsToShow = 15
    const numOfReviewPages = Math.ceil(filteredReviewRequests.length / numReviewsToShow)
    filteredReviewRequests = filteredReviewRequests.slice((pageNumber - 1) * numReviewsToShow, pageNumber * numReviewsToShow)

    const pagination: IndexTableProps['pagination'] = {
        hasNext: pageNumber < numOfReviewPages, 
        hasPrevious: pageNumber > 1, 
        onNext: () => setPageNumber(pageNumber + 1),
        onPrevious: () => setPageNumber(pageNumber - 1)
    }

    const IndexTableMarkup = filteredReviewRequests.map((reviewRequest, index) => {

        const storeName = reviewRequest.store.split('.myshopify')[0]
        const orderUrl = `https://admin.shopify.com/store/${storeName}/orders/${reviewRequest.orderId}`

        return (

            <IndexTable.Row key={index} position={index} id={index.toString()}>
                <IndexTable.Cell>{reviewRequest.product}</IndexTable.Cell>
                <IndexTable.Cell>{new Date(reviewRequest.date).toLocaleDateString()}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Link target="_blank" url={orderUrl}>{reviewRequest.orderName}</Link>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge tone={reviewRequest.fulfillmentStatus === "fulfilled" ? "success" : "attention" }>
                        {reviewRequest.fulfillmentStatus === null ? "pending" : reviewRequest.fulfillmentStatus}
                    </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge tone={reviewRequest.reviewStatus === "waiting" ? "enabled" : "success" }>
                        {reviewRequest.reviewStatus}
                    </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>{reviewRequest.emailsSent}</IndexTable.Cell>
            </IndexTable.Row>

        )

    })

    const {mode, setMode} = useSetIndexFiltersMode();
    const submit = useSubmit()

    const productNames = reviewRequests.map(request => request.product)
    const filteredProductNames = productNames.filter((name, index) => productNames.indexOf(name) === index).map(
        name => { return  {label: name, value: name} }
    )
    const filters: IndexFiltersProps['filters'] = [
        {
            key: 'product',
            label: 'Product',
            filter: (
                <ChoiceList 
                title=''
                titleHidden
                allowMultiple
                choices={filteredProductNames}
                onChange={(selected, name) => setIndexTableState({...indexTableState, selectedProductFilters: selected})}
                selected={indexTableState.selectedProductFilters}
                />
            ),
            
        },
        {
            key: 'fulfillmentStatus',
            label: 'Fulfillment Status',
            filter: (
                <ChoiceList
                title=''
                titleHidden
                allowMultiple
                choices={[{label: 'Pending', value: 'pending'}, {label: 'Fulfilled', value: 'fulfilled'}]}
                onChange={(selected, name) => setIndexTableState({...indexTableState, selectedFulfillmentFilters: selected})}
                selected={indexTableState.selectedFulfillmentFilters}
                />
            )
        },
        {
            key: 'reviewStatus',
            label: 'Review Status',
            filter: (
                <ChoiceList
                title=''
                titleHidden
                allowMultiple
                choices={[{label: 'Waiting', value: 'waiting'}, {label: 'Submitted', value: 'submitted'}]}
                onChange={(selected, name) => setIndexTableState({...indexTableState, selectedReviewStatusFilters: selected})}
                selected={indexTableState.selectedReviewStatusFilters}
                />
            )
        }
    ]

    // Applied Filters
    const appliedFilters: IndexFiltersProps['appliedFilters'] = []
    if (indexTableState.selectedProductFilters.length > 0) {
        appliedFilters.push({
            key: 'product',
            label: joinFilters(indexTableState.selectedProductFilters),
            onRemove: () => setIndexTableState({...indexTableState, selectedProductFilters: []})
        })
    }
    if (indexTableState.selectedFulfillmentFilters.length > 0) {
        appliedFilters.push({
            key: 'fulfillmentStatus',
            label: joinFilters(indexTableState.selectedFulfillmentFilters),
            onRemove: () => setIndexTableState({...indexTableState, selectedFulfillmentFilters: []})
        })
    }
    if (indexTableState.selectedReviewStatusFilters.length > 0) {
        appliedFilters.push({
            key: 'reviewStatus',
            label: joinFilters(indexTableState.selectedReviewStatusFilters),
            onRemove: () => setIndexTableState({...indexTableState, selectedReviewStatusFilters: []})
        })
    }

    const createNewView = async (name: string) => {
        submit(JSON.stringify({state: { ...indexTableState, name }, action: 'create'}), {method: 'POST', encType: 'application/json'})
        setIndexTableState({...indexTableState, selectedTab: savedTableViews.length + 1})                    
        return true
    }

    const saveView = async () => {
        submit(JSON.stringify({state: { ...indexTableState }, action: 'update'}), {method: 'POST', encType: 'application/json'})
        return true
    }

    const renameView = (newName: string, currentName: string) => {
        submit(JSON.stringify({state: { ...indexTableState, name: newName }, action: 'update', nameToUpdate: currentName}), {method: 'POST', encType: 'application/json'})
    }

    const deleteView = (viewNameToDelete: string) => {
        submit(JSON.stringify({nameToDelete: viewNameToDelete, action: 'delete'}), {method: 'POST', encType: 'application/json'})
        setTimeout(() => {
            setIndexTableState(initialReviewRequestTableState)
        }, 500);
    }
    
    const tabs: IndexFiltersProps['tabs'] = ['All Review Requests', ...savedTableViews.map(view => view.name)].map((tabName, index) => {
        return {
            content: tabName, 
            id: `${tabName}-${index}`,
            actions: index === 0 ? [] :
            [
                {type: 'rename', onPrimaryAction: (newName: string) => renameView(newName, tabName)},
                {type: 'duplicate', onPrimaryAction: createNewView},
                {type: 'delete', onPrimaryAction: deleteView}
            ]
        }
    })

    const changeTabs = (index: number) => {
        if (index > 0) {
            setIndexTableState({...savedTableViews[index-1], selectedTab: index})
        } else {
            setIndexTableState({...initialReviewRequestTableState})
        }
    }

    const sortOptions: IndexFiltersProps['sortOptions'] = [
        {label: 'Number of Emails Sent', value: 'numEmails asc', directionLabel: 'Least to Most'},
        {label: 'Number of Emails Sent', value: 'numEmails desc', directionLabel: 'Most to Least'},
        {label: 'Order Date', value: 'date asc', directionLabel: 'Oldest to Newest'},
        {label: 'Order Date', value: 'date desc', directionLabel: 'Newest to Oldest'}
    ]

    const primaryAction: IndexFiltersProps['primaryAction'] = {
        type: indexTableState.selectedTab === 0 ? "save-as" : "save",
        onAction: indexTableState.selectedTab === 0 ? createNewView : saveView
    }

    const cancelFilterChanges = () => {
        if (indexTableState.selectedTab > 0) {
            setIndexTableState({...savedTableViews[indexTableState.selectedTab - 1], selectedTab: indexTableState.selectedTab})
        } else {
            setIndexTableState(initialReviewRequestTableState)
        }
    }

    const clearAllFilters = () => {
        setIndexTableState({...indexTableState, selectedFulfillmentFilters: [], selectedProductFilters: [], selectedReviewStatusFilters: []})
    }

    return (

        <Page
        title="Review Requests"
        subtitle="These are all of the review requests that will be or have been sent to customers"
        >
            {reviewRequests.length === 0 ?
            
            <Card>
                <EmptyState 
                heading="You Don't Have Any Review Requests Yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                />
            </Card>

            :

            <Card>
                <IndexFilters
                sortOptions={sortOptions}
                sortSelected={indexTableState.sortSelected}
                onSort={(value) => setIndexTableState({...indexTableState, sortSelected: value})}
                tabs={tabs}
                mode={mode}
                setMode={setMode}
                filters={filters}
                appliedFilters={appliedFilters}
                onClearAll={clearAllFilters}
                primaryAction={primaryAction}
                queryValue={indexTableState.queryValue}
                onQueryChange={(value) => setIndexTableState({...indexTableState, queryValue: value})}
                onQueryClear={() => setIndexTableState({...indexTableState, queryValue: ''})}
                cancelAction={{onAction: cancelFilterChanges}}
                onCreateNewView={createNewView}
                queryPlaceholder="Search by email, date, or order number"
                onSelect={changeTabs}
                selected={indexTableState.selectedTab}
                />
                <IndexTable 
                pagination={pagination}
                selectable={false}
                headings={[{title: 'Customer Name'}, {title: 'Customer Email'}, {title: 'Order Number'}, {title: 'Products(s) Purchased'}, {title: 'Fulfillment Status'}, {title: 'Review Status'}, {title: 'Emails Sent'}]}
                itemCount={filteredReviewRequests.length}
                >
                    {IndexTableMarkup}
                </IndexTable>
            </Card>
        
        }
        </Page>

    )

}