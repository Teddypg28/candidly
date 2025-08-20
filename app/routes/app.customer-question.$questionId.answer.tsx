import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Card, Layout, Page, TextField, Thumbnail } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import db from '../db.server'
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";
import { CustomerQuestionEmailVariables } from "~/types/types";

import {ImageIcon} from '@shopify/polaris-icons';

export const action = async ({ request, params } : ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request)
    const questionId = params.questionId as string

    const data = await request.json()

    const question = await db.customerQuestion.findFirst({where: {id: {equals: questionId}}, include: {answer: true}})

    if (!question) {
        return new Response('question not found', {status: 401})
    }
    
    if (question?.answer) {
        const emailSent = JSON.stringify(question.answer.body) === JSON.stringify(data.answer)
        return await db.customerQuestion.update({where: {id: questionId}, data: {title: data.question, answer: {update: {data: {body: data.answer}}}, emailSent}})
    } 
    
    await db.customerQuestion.update({where: {id: questionId}, data: {title: data.question}})
    return await db.customerQuestionAnswer.create({data: {body: data.answer, questionId, store: session.shop}})
}

export const loader = async ({ request, params } : LoaderFunctionArgs) => {
    const { admin } = await authenticate.admin(request)

    const questionId = params.questionId as string

    const customerQuestion = await db.customerQuestion.findFirst({where: {id: {equals: questionId}}, include: {answer: true}})

    const productDataQuery = `
    { 
        product(id: "gid://shopify/Product/${customerQuestion?.productId}") {
            id
            title
            media(first: 1) {
            edges {
                node {
                preview {
                    image {
                    url
                    }
                }
                }
            }
            }
        }
    }`

    const res = await admin.graphql(productDataQuery)
    const data = await res.json()

    const productTitle = data.data.product ? data.data.product.title : "Product deleted"
    const productImageUrl = data.data.product && data.data.product.media ? data.data.product.media.edges[0].node.preview.image.url : ""
    
    return {customerQuestion, productTitle, productImageUrl}
}

export default function AnswerQuestion() {

    const data = useLoaderData<typeof loader>()

    const submit = useSubmit()

    const [questionAnswerState, setQuestionAnswerState] = useState({
        question: data.customerQuestion?.title,
        answer: data.customerQuestion?.answer?.body || ""
    })

    const cleanQuestionAnswerState = {question: data.customerQuestion?.title, answer: data.customerQuestion?.answer?.body || ""}
    
    const isStateDirty = JSON.stringify(questionAnswerState) !== JSON.stringify(cleanQuestionAnswerState)

    const saveQuestionAnswerState = () => {
        submit(JSON.stringify(questionAnswerState), {method: "POST", encType: "application/json"})
    }

    const emailCustomer = () => {
        const emailVariables: CustomerQuestionEmailVariables = {
            questionId: data.customerQuestion?.id as string,
            question: data.customerQuestion?.title,
            answer: data.customerQuestion?.answer?.body as string, 
            firstName: data.customerQuestion?.firstName,
        }
        submit(JSON.stringify({emailVariables, store: data.customerQuestion?.store, toAddress: data.customerQuestion?.email}), {action: '/api/answer/email/send', method: 'POST', encType: 'application/json', navigate: false})
    }

    return (
        <Page 
        title="Customer Question"
        backAction={{content: 'All Questions', url: '/app/question-answers'}}
        primaryAction={{content: 'Email Customer Answer', disabled: data.customerQuestion?.emailSent, onAction: emailCustomer}}
        >
            <SaveBar open={isStateDirty}>
                <button variant="primary" onClick={saveQuestionAnswerState}></button>
                <button onClick={() => setQuestionAnswerState(cleanQuestionAnswerState)}></button>
            </SaveBar>
            <Layout>
                <Layout.Section variant="oneHalf">
                    <Card>
                        <BlockStack gap={'200'}>     
                            <TextField 
                            autoComplete="off" 
                            value={questionAnswerState.question}
                            onChange={(val) => setQuestionAnswerState(prevState => {return {...prevState, question: val}})}
                            label="Customer Question" 
                            />
                            <TextField 
                            autoComplete="off" 
                            value={questionAnswerState.answer} 
                            onChange={(val) => setQuestionAnswerState(prevState => {return {...prevState, answer: val}})}
                            multiline
                            label="Answer" 
                            placeholder="Enter your answer here"
                            />
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneThird">
                    <Card>
                        <BlockStack gap={'300'}>
                            <BlockStack gap={'100'}>
                                <strong>Customer Name</strong>
                                <div style={{backgroundColor: '#f1f1f1', padding: '10px', borderRadius: '5px'}}>{data.customerQuestion?.firstName}</div>
                            </BlockStack>
                            <BlockStack gap={'100'}>
                                <strong>Product</strong>
                                <div style={{backgroundColor: '#f1f1f1', padding: '10px', borderRadius: '5px'}}>{data.productTitle}</div>
                                <Thumbnail alt="product image" source={data.productImageUrl || ImageIcon} size="large" />
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}