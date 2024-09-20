import { DataTable, EmptyState, IndexFilters, IndexTable, Link, Page } from "@shopify/polaris";

import { Card } from "@shopify/polaris"

import { useLoaderData, useNavigate } from "@remix-run/react"

import { json, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

import db from '../db.server'

export const loader = async ({request} : LoaderFunctionArgs) => {
    try {

        const { session, admin } = await authenticate.admin(request)

        const questions = await db.reviewFormQuestion.findMany({where: {store: {equals: session.shop}}, include: {answerChoices: true}, omit: {store: true}})

        const updatedQuestions = await Promise.all(questions.map(async ({productId, ...rest}) => {

            const query = `query getProductTitle($id: ID!) {
                product(id: $id) {
                  title
                  }
                }`

            const res = await admin.graphql(query, {variables: {id: `gid://shopify/Product/${productId}`}})
            const data = await res.json()

            return { product: data.data.product.title, ...rest }
        }))

        return json(updatedQuestions)

    } catch (error) {

        console.error(error)

    }
}

const CustomQuestions = () => {

    const currentQuestions = useLoaderData<typeof loader>()

    const nav = useNavigate()

    const indexTableMarkup = currentQuestions.map((question: any, index: number) => {
        return (
            <IndexTable.Row position={index} id={question.id}>
                <IndexTable.Cell>{question.title}</IndexTable.Cell>
                <IndexTable.Cell>{question.product}</IndexTable.Cell>
                <IndexTable.Cell>{question.label || 'N/A'}</IndexTable.Cell>
                <IndexTable.Cell>{question.answerChoices.length === 0 ? 'N/A' : question.answerChoices.length}</IndexTable.Cell>
            </IndexTable.Row>
        )
    })

  return (
        <Page
        title="Custom Review Form Questions"
        subtitle="Generate any questions that you want to ask customers"
        backAction={{onAction: () => nav('/app/settings')}}
        primaryAction={{content: 'Create New Question', onAction: () => nav('/app/question/new')}}
        >
            {currentQuestions.length === 0 ?
            <Card>
                <EmptyState
                action={{content: 'Create Question', onAction: () => nav('/app/question/new')}}
                heading="You Don't Have Any Custom Questions Yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                    <p>Create your first one!</p>
                </EmptyState>
            </Card>

            :
            
            <Card>
                <IndexTable
                itemCount={currentQuestions.length}
                headings={[{title: 'Title'}, {title: 'Product'}, {title: 'Label'}, {title: 'Answer Choices'}]}
                >
                    {indexTableMarkup}
                </IndexTable>
            </Card>

            }
        </Page>
  )
}

export default CustomQuestions


