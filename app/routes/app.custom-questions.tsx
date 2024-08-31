import { DataTable, EmptyState, Link, Page } from "@shopify/polaris";

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

    const dataTableRows = currentQuestions.map((question: any) => {
        const values: any = []

        let questionObjectKeys = Object.keys(question)
        questionObjectKeys = questionObjectKeys.filter(key => {
            return key !== 'id' && key !== 'answerLabel' && key !== 'displayAnswer'
        })

        questionObjectKeys.forEach((key: any) => {

            if (question[key] === null) {

                values.push('N/A')

            } else if (key === 'answerChoices') {

                values.push(question[key].length === 0 ? 'N/A' : question[key].length)

            } else if (key === 'title') {

                values.push(<Link url={`/app/question/${question.id}`}>{question[key]}</Link>)

            } else if (key === 'product') {

                const truncatedProductTitle = (question[key] as string).substring(0, 50)

                if (truncatedProductTitle.trim() === question[key].trim()) {

                    values.push((question[key]))

                } else {

                    values.push(`${truncatedProductTitle}...`)
                }

                
            } else {

                values.push(question[key])

            }

        })

        return values

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

            <DataTable
            headings={['Product', 'Title', 'Label', 'Answer Choices']}
            columnContentTypes={['text', 'text', 'text', 'text']}
            rows={dataTableRows}
            />

            }
        </Page>
  )
}

export default CustomQuestions


