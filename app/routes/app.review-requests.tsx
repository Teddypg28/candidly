import { LoaderFunctionArgs } from "@remix-run/node";
import { Badge, Card, ChoiceList, EmptySearchResult, EmptyState, IndexFilters, IndexFiltersMode, IndexFiltersProps, IndexTable, Page, Text, useSetIndexFiltersMode } from "@shopify/polaris";

import db from '../db.server'

import { authenticate } from "~/shopify.server";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";

export async function loader({ request } : LoaderFunctionArgs) {

    const { session, admin } = await authenticate.admin(request)

    const reviewRequests = await db.reviewRequest.findMany({where: {store: {equals: session.shop}}})

    const createEachProductRequest = async (request: any) => {

        const query = `
        {
            order(id: "gid://shopify/Order/${request.orderId}") {
              lineItems(first: 100, reverse: true) {
                edges {
                  node {
                    currentQuantity
                    product {
                      title
                    }  
                  }
                }
              }
            }
          }`

        const res = await admin.graphql(query)
        const data = await res.json()

        const stillInOrderTitles = data.data.order.lineItems.edges.filter((edge: any) => {

            if (edge.node.currentQuantity > 0) {
                return edge
            }

        }).map((item: any) => {

            return item.node.product.title

        })

        const reviewRequests = stillInOrderTitles.filter((title: any, index: number) => {

            return stillInOrderTitles.indexOf(title) === index

        }).map((itemName: string) => {
            
            return {

                email: request.email,
                fulfillmentStatus: request.fulfillmentStatus,
                reviewStatus: request.reviewStatus,
                emailsSent: request.emailsSent,
                product: itemName
                
            }

        })

        return reviewRequests

    }

    const results = await Promise.all(reviewRequests.map(async (request) => {

        return createEachProductRequest(request)

    }))

    const data: {email: string, fulfillmentStatus: string | null, reviewStatus: string, emailsSent: number, product: string}[] = []

    results.forEach(result => {
        result.forEach((requestObject: any) => {
            data.push(requestObject)
        })
    })

    return data
}

export default function ReviewRequests() {

    const reviewRequests = useLoaderData<typeof loader>()

    // STATE HANDLING

    const [emailQueryValue, setEmailQueryValue] = useState('')

    const reviewRequestsAfterFiltering = reviewRequests.filter(request => {

        return request.email.includes(emailQueryValue.trim())

    })

    const IndexTableMarkup = reviewRequestsAfterFiltering.map((reviewRequest, index) => {

        return (

            <IndexTable.Row key={index} position={index} id={index.toString()}>
                <IndexTable.Cell>{reviewRequest.product}</IndexTable.Cell>
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
                choices={filteredProductNames}
                selected={[]}
                />
            )
        }
    ]

    console.log(IndexTableMarkup)

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
                tabs={[{content: 'All Review Requests', id: '0', isLocked: true, selected: true}]}
                mode={mode}
                setMode={setMode}
                filters={filters}
                onSelect={() => {}}
                onClearAll={() => {}}
                queryValue={emailQueryValue}
                onQueryChange={setEmailQueryValue}
                onQueryClear={() => setEmailQueryValue('')}
                cancelAction={{onAction: () => {}}}
                queryPlaceholder="Search by email"
                selected={0}
                />
                <IndexTable 
                selectable={false}
                headings={[{title: 'Product'}, {title: 'Email'}, {title: 'Fulfillment Status'}, {title: 'Review Status'}, {title: 'Emails Sent'}]}
                itemCount={reviewRequestsAfterFiltering.length}
                >
                    {IndexTableMarkup}
                </IndexTable>
            </Card>
        
        }
        </Page>

    )

}