import { json, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Card, Page, Text } from "@shopify/polaris";
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

    const AnswersMarkup = data.answers.map((answer, index) => {
        return ( 
            <BlockStack>
                <Text as="p" key={index}>{answer.value}</Text> 
                {index !== data.answers.length - 1 && <hr style={{height: '0.10px', width: '100%', border: 'none', margin: '10px 0px', backgroundColor: 'lightgray'}} />}
            </BlockStack>
        )
    })

    return (
        <Page
        title={data.title}
        backAction={{content: 'Custom Question', onAction: () => nav('/app/custom-questions')}}
        >
            <BlockStack gap={'200'}>
                <BlockStack gap={'100'}>
                    <Text as="h1" variant="headingLg">{data.answers.length} Answers</Text>
                    <Card>{AnswersMarkup}</Card>
                </BlockStack>
            </BlockStack>
        </Page>
    )
}