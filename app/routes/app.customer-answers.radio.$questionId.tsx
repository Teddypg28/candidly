import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { BlockStack, Card, InlineGrid, Page, ProgressBar, Text } from "@shopify/polaris";
import db from '../db.server'
import { useLoaderData, useNavigate } from "@remix-run/react";

export async function loader({ params } : LoaderFunctionArgs) {
    const questionId = params.questionId as string
    const question = await db.reviewFormQuestion.findFirst({where: {id: {equals: questionId}}, include: {radioAnswerChoices: true}})

    if (!question || question.answerType[0] !== "radio") return redirect('/app/custom-questions')

    const answers = await db.answerChoiceSnapshot.findMany({where: {questionId: {equals: questionId}}})
    const individualAnswerCountData: {[key: string]: number} = {}
    // iterate through answerSnapshots and increment answer count for matching answer choices
    answers.forEach(answer => {
        if (!individualAnswerCountData[answer.value as keyof typeof individualAnswerCountData]) {
            individualAnswerCountData[answer.value as keyof typeof individualAnswerCountData] = 0
        } 
        individualAnswerCountData[answer.value as keyof typeof individualAnswerCountData] += 1
    })

    return json({
        title: question.title,
        totalNumAnswers: answers.length,
        individualAnswerCountData
    })
}

export default function CustomerAnswers() {

    const data = useLoaderData<typeof loader>()
    const nav = useNavigate()
    
    const mostPopularAnswer = data.totalNumAnswers > 0 ? Object.keys(data.individualAnswerCountData).reduce((prevValue, currentValue) => 
        data.individualAnswerCountData[currentValue] > data.individualAnswerCountData[prevValue] ? currentValue : prevValue
    ) : null

    const leastPopularAnswer = data.totalNumAnswers > 1 ? Object.keys(data.individualAnswerCountData).reduce((prevValue, currentValue) => 
        data.individualAnswerCountData[currentValue] < data.individualAnswerCountData[prevValue] ? currentValue : prevValue
    ) : null

    const answerOverviewStats = [
        { title: 'Total Customer Answers', value: data.totalNumAnswers },
        { title: 'Most Popular Answer', value: mostPopularAnswer },
        { title: 'Least Popular Answer', value: leastPopularAnswer }
    ]

    const AnswerOverviewMarkup = answerOverviewStats.map((stat, index) => {
        return (
            <Card key={index}>
                <BlockStack gap={'300'}>
                    <Text as="h3">{stat.title}</Text>
                    <Text as="h1" variant="headingLg">{stat.value || '-'}</Text>
                </BlockStack>
            </Card>
        )
    })

    const answerObjectEntries = Object.entries(data.individualAnswerCountData)
    const NumAnswersMarkup = answerObjectEntries.sort(([,valueA], [,valueB]) => valueB - valueA).map(([key, value], index) => {
        return (
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}} key={index}>
                <p style={{width: '15%'}}>{key}</p>
                <div style={{width: '70%'}}>
                    <ProgressBar progress={(value/data.totalNumAnswers)*100 || 0} />
                </div>
                <p style={{width: '15%'}}>{value} {value === 1 ? "answer" : "answers"}</p>
            </div>
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
                    <InlineGrid columns={3} gap={'200'}>{AnswerOverviewMarkup}</InlineGrid>
                    <Card>
                        <BlockStack gap={'300'}>{NumAnswersMarkup.length > 0 ? NumAnswersMarkup : 'No Answers Yet'}</BlockStack>
                    </Card>
                </BlockStack>
            </BlockStack>
        </Page>
    )
}