import { json, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Card, InlineGrid, Page, Text } from "@shopify/polaris";
import db from '../db.server'
import { useLoaderData } from "@remix-run/react";

export async function loader({ params } : LoaderFunctionArgs) {
    const questionId = parseInt(params.questionId as string)
    const question = await db.reviewFormQuestion.findFirst({where: {id: {equals: questionId}}})
    const answers = await db.answerChoiceSnapshot.findMany({where: {questionId: {equals: questionId}}})

    const answersObject: {[key: string]: number} = {}
    answers.forEach(answer => {
        if (answersObject[answer.value as keyof typeof answersObject]) {
            answersObject[answer.value as keyof typeof answersObject] += 1
        } else {
            answersObject[answer.value as keyof typeof answersObject] = 1
        }
    })
    const topAnswer = answers.length > 0 ? Object.keys(answersObject).reduce((prevValue, currentValue) => 
        answersObject[currentValue] > answersObject[prevValue] ? currentValue : prevValue
    ) : null
    const bottomAnswer = answers.length > 1 ? Object.keys(answersObject).reduce((prevValue, currentValue) => 
        answersObject[currentValue] < answersObject[prevValue] ? currentValue : prevValue
    ) : null

    const answerStats = [
        { title: 'Total Customer Answers', value: answers.length },
        { title: 'Top Answer', value: topAnswer },
        { title: 'Bottom Answer', value: bottomAnswer }
    ]
    return json({
        title: question?.title || 'Question Deleted',
        answerStats
    })
}

export default function CustomerAnswers() {

    const data = useLoaderData<typeof loader>()

    const AnswerStatMarkup = data.answerStats.map((stat) => {
        return (
            <Card>
                <BlockStack gap={'300'}>
                    <Text as="h3">{stat.title}</Text>
                    <Text as="h1" variant="headingLg">{stat.value || '-'}</Text>
                </BlockStack>
            </Card>
        )
    })

    return (
        <Page>
            <BlockStack gap={'200'}>
                <Card>
                    <Text as="h1" variant="headingLg">Question: <span style={{fontWeight: 'normal'}}>{data.title}</span></Text>
                </Card>
                <BlockStack gap={'100'}>
                    <Text as="h1" variant="headingLg">Answer Breakdown</Text>
                    <InlineGrid columns={3} gap={'200'}>{AnswerStatMarkup}</InlineGrid>
                </BlockStack>
            </BlockStack>
        </Page>
    )
}