import { json, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Card, InlineGrid, Page, Text } from "@shopify/polaris";
import db from '../db.server'
import { useLoaderData, useNavigate } from "@remix-run/react";
import { authenticate } from "~/shopify.server";

export async function loader({ params, request } : LoaderFunctionArgs) {
    const { redirect } = await authenticate.admin(request)

    const questionId = parseInt(params.questionId as string)
    const question = await db.reviewFormQuestion.findFirst({where: {id: {equals: questionId}}, include: {textAnswers: true}})

    if (!question || question.answerType[0] !== "text") return redirect('/app/custom-questions')

    return json(
        {
            title: question.title,
            answers: question.textAnswers
        }
    )
}

export default function CustomerAnswers() {

    const data = useLoaderData<typeof loader>()
    const nav = useNavigate()
    
    const AnswerOverviewMarkup = ['Total Customer Answers'].map((title, index) => {
        return (
            <Card key={index}>
                <BlockStack gap={'300'}>
                    <Text as="h3">{title}</Text>
                    <Text as="h1" variant="headingLg">{data.answers.length}</Text>
                </BlockStack>
            </Card>
        )
    })

    return (
        <Page
        title={data.title}
        backAction={{content: 'Custom Question', onAction: () => nav('/app/custom-questions')}}
        >
            <BlockStack gap={'200'}>
                <BlockStack gap={'100'}>
                    <Text as="h1" variant="headingLg">Answer Breakdown</Text>
                    <InlineGrid columns={1}>{AnswerOverviewMarkup}</InlineGrid>
                </BlockStack>
            </BlockStack>
        </Page>
    )
}