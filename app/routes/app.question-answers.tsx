import { LoaderFunctionArgs } from "@remix-run/node";
import { Card, EmptyState, IndexTable, Page, useIndexResourceState } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

import db from '../db.server'
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request } : LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request)
    const questions = await db.customerQuestion.findMany({where: {store: {equals: session.shop}}})
    return questions
}

export default function QuestionAnswers() {

    const questions = useLoaderData<typeof loader>()

    const { handleSelectionChange, allResourcesSelected, selectedResources, removeSelectedResources } = useIndexResourceState([])

    const indexTableMarkup = questions.map((question, index) => {
        const renderReviewBody = () => {
            const truncatedReviewBody = question.title.substring(0, 25)
            if (question.title.trim().length === truncatedReviewBody.length) {
                return question.title.trim()
            } else {
                return `${truncatedReviewBody}...`
            }
        }
        return (
            <IndexTable.Row key={index} selected={selectedResources.includes(question.id.toString())} id={question.id.toString()} position={index}>
                <IndexTable.Cell>{new Date(question.createdAt).toLocaleDateString()}</IndexTable.Cell>
                <IndexTable.Cell>{question.productId}</IndexTable.Cell>
                <IndexTable.Cell>{renderReviewBody()}</IndexTable.Cell>
            </IndexTable.Row>
        )
    })

    return (
        <Page
        title="Q&A"
        subtitle="Respond to questions from your shoppers"
        >

        {questions.length === 0 ?
                
            <Card>
                <EmptyState 
                heading="There are no questions yet!"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                />
            </Card>

            :

            <IndexTable
            headings={[{title: 'Date Asked'}, {title: 'Product'}, {title: 'Title'}]}
            itemCount={3}
            onSelectionChange={handleSelectionChange}
            selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
            >
                {indexTableMarkup}
            </IndexTable>

        }

        </Page>
    )
}