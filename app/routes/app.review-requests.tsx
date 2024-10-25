import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Badge, Card, ChoiceList, EmptyState, IndexFilters, IndexFiltersProps, IndexTable, Link, Page, useSetIndexFiltersMode } from "@shopify/polaris";

import db from '../db.server'

import { authenticate } from "~/shopify.server";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { ReviewRequestData, ReviewRequestIndexTableState } from "~/types/types";
import { createEachProductReviewRequest } from "~/helpers/createEachProductReviewRequest";

export async function loader({ request } : LoaderFunctionArgs) {

    const { session, admin } = await authenticate.admin(request)

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

    const savedTableViews = await db.savedReviewRequestTableView.findMany({where: {store: {equals: session.shop}}, omit: {id: true, store: true}})

    // Serve both

    return json({savedTableViews, reviewRequests})

}

export async function action({ request } : ActionFunctionArgs) {

    const { session } = await authenticate.admin(request)

    const data = await request.json()
    const { state, action } = data
    
    delete state['selectedTab']

    if (action === 'create') {

        await db.savedReviewRequestTableView.create({ data: { ...state, store: session.shop } })

    } else {

        await db.savedReviewRequestTableView.updateMany({ where: {store: {equals: session.shop}}, data : { ...state, store: session.shop } })

    }

    return true

}

const defaultState = {
    queryValue: '',
    selectedProductFilters: [],
    selectedFulfillmentFilters: [],
    selectedTab: 0,
    sortSelected: ['date desc']
}

export default function ReviewRequests() {

    const data = useLoaderData<typeof loader>()
    const { reviewRequests, savedTableViews } = data

    // STATE HANDLING

    const [indexTableState, setIndexTableState]= useState<ReviewRequestIndexTableState>(defaultState)

    const reviewRequestsAfterFiltering = reviewRequests.filter(request => {

        return request.email.includes(indexTableState.queryValue.trim()) || request.orderNumber.toString().includes(indexTableState.queryValue.trim())

    })

    const IndexTableMarkup = reviewRequestsAfterFiltering.map((reviewRequest, index) => {

        const storeName = reviewRequest.store.split('.myshopify')[0]
        const orderUrl = `https://admin.shopify.com/store/${storeName}/orders/${reviewRequest.orderId}`

        return (

            <IndexTable.Row key={index} position={index} id={index.toString()}>
                <IndexTable.Cell>{reviewRequest.product}</IndexTable.Cell>
                <IndexTable.Cell>{new Date(reviewRequest.date).toLocaleDateString()}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Link target="_blank" url={orderUrl}>#{reviewRequest.orderNumber}</Link>
                </IndexTable.Cell>
                <IndexTable.Cell>{reviewRequest.email}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge tone={reviewRequest.fulfillmentStatus === null ? "attention" : "success" }>
                        {reviewRequest.fulfillmentStatus === null ? "pending" : reviewRequest.fulfillmentStatus}
                    </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge tone={reviewRequest.reviewStatus === "waiting" ? "attention" : "success" }>
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
        }
    ]

    const appliedFilters: IndexFiltersProps['appliedFilters'] = []
    if (indexTableState.selectedProductFilters.length > 0) {

        appliedFilters.push({
            key: 'product',
            label: joinFilters(indexTableState.selectedProductFilters),
            onRemove: () => setIndexTableState({...indexTableState, selectedProductFilters: []})
        })
        
    }

    const tabs: IndexFiltersProps['tabs'] = ['All Review Requests', ...savedTableViews.map(view => view.name)].map((tabName, index) => {

        return {content: tabName, id: `${tabName}-${index}`}

    })

    const changeTabs = (index: number) => {

        if (index > 0) {
            setIndexTableState({...savedTableViews[index-1], selectedTab: index})
        } else {
            setIndexTableState({...defaultState})
        }

    }

    const sortOptions: IndexFiltersProps['sortOptions'] = [
        {label: 'Number of Emails Sent', value: 'numEmails asc', directionLabel: 'Least to Most'},
        {label: 'Number of Emails Sent', value: 'numEmails desc', directionLabel: 'Most to Least'},
        {label: 'Order Date', value: 'date asc', directionLabel: 'Oldest to Newest'},
        {label: 'Order Date', value: 'date desc', directionLabel: 'Newest to Oldest'}
    ]

    const createNewView = async (name: string) => {
        submit(JSON.stringify({state: { ...indexTableState, name }, action: 'create'}), {method: 'POST', encType: 'application/json'})
        return true
    }

    const saveView = async () => {
        submit(JSON.stringify({state: { ...indexTableState }, action: 'update'}), {method: 'POST', encType: 'application/json'})
        return true
    }

    const primaryAction: IndexFiltersProps['primaryAction'] = {
        type: indexTableState.selectedTab === 0 ? "save-as" : "save",
        onAction: indexTableState.selectedTab === 0 ? createNewView : saveView
    }

    const cancelFilterChanges = () => {

        if (indexTableState.selectedTab > 0) {

            setIndexTableState({...savedTableViews[indexTableState.selectedTab - 1], selectedTab: indexTableState.selectedTab})

        } else {

            setIndexTableState(defaultState)

        }

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
                onClearAll={() => {}}
                primaryAction={primaryAction}
                queryValue={indexTableState.queryValue}
                onQueryChange={(value) => setIndexTableState({...indexTableState, queryValue: value})}
                onQueryClear={() => setIndexTableState({...indexTableState, queryValue: ''})}
                cancelAction={{onAction: cancelFilterChanges}}
                onCreateNewView={createNewView}
                queryPlaceholder="Search by email or order number"
                onSelect={changeTabs}
                selected={indexTableState.selectedTab}
                />
                <IndexTable 
                selectable={false}
                headings={[{title: 'Product'}, {title: 'Date Ordered'}, {title: 'Order Number'}, {title: 'Email'}, {title: 'Fulfillment Status'}, {title: 'Review Status'}, {title: 'Emails Sent'}]}
                itemCount={reviewRequestsAfterFiltering.length}
                >
                    {IndexTableMarkup}
                </IndexTable>
            </Card>
        
        }
        </Page>

    )

}

const joinFilters = (filters: string[]) => {

    return filters.join(', ')

}