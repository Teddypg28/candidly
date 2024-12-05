import { json, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Button, Card, InlineGrid, InlineStack, Link, Page, ProgressBar, Select, Text } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

import { ClipboardCheckIcon, ClipboardCheckFilledIcon } from '@shopify/polaris-icons';

import db from '../db.server'
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import getAnalyticsData from "~/helpers/getAnalyticsData";

export const loader = async ({ request } : LoaderFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request)

    const appSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}})
    const reviewRequestEmailSettings = await db.reviewRequestEmailSettings.findFirst({where: {store: {equals: session.shop}}})
    const reviewFormDesignSettings = await db.reviewFormSettings.findFirst({where: {store: {equals: session.shop}}})
    const analyticsData = await getAnalyticsData(session, admin, 'all')

    return json({appSettings, reviewRequestEmailSettings, reviewFormDesignSettings, analyticsData})
}

export default function Index() {

    const settingsData = useLoaderData<typeof loader>()

    const [stepsDismissed, setStepsDismissed] = useState(false)
    const [dateRange, setDateRange] = useState('all')
    const [analyticsData, setAnalyticsData] = useState(settingsData.analyticsData)

    useEffect(() => {
       const getAnalyticsData = async () => {
           const res = await fetch('/api/analytics', {method: 'POST', body: JSON.stringify({dateRange})})
           const data = await res.json()
           setAnalyticsData(data)
       }
       getAnalyticsData()
    }, [dateRange])

    const onboardingSteps = [
        {
            name: 'Visit the Settings Page', 
            description: 'Make any necessary changes to the default settings that are currently in place', 
            complete: settingsData.appSettings,
            url: '/app/settings/general'
        },
        {
            name: 'Customize Your Review Request Email Template', 
            description: 'Add a logo and configure how you want your email to look when you send review requests to customers', 
            complete: settingsData.reviewRequestEmailSettings,
            url: '/app/email-template'
        },
        {
            name: 'Customize Your Review Form', 
            description: 'Customize the look and messaging on the review form that your customers will fill out', 
            complete: settingsData.reviewFormDesignSettings,
            url: '/app/review-form'
        }
    ]

    const numOfStepsCompleted = onboardingSteps.filter(step => step.complete !== null).length
    const progress = Math.round((numOfStepsCompleted/onboardingSteps.length) * 100)
    const indexOfFirstIncompleteStep = onboardingSteps.findIndex(step => step.complete === null)

    const onboardingStepsMarkup = onboardingSteps.map((step, index) => {
        return (
            <BlockStack key={index} gap={'500'}>
                <InlineStack blockAlign="center" gap={'200'}>
                    {step.complete ? <ClipboardCheckFilledIcon height={25} width={25} /> : <ClipboardCheckIcon height={25} width={25} />}
                    <BlockStack gap={'150'}>
                        <Text as="h3" variant="headingMd">{step.name}</Text>
                        <Text as="p" variant="bodySm">{step.description}</Text>
                        {index === indexOfFirstIncompleteStep && (
                        <InlineStack>
                            <Button url={step.url} variant="primary">Complete Step</Button>
                        </InlineStack>
                        )}
                    </BlockStack>
                </InlineStack>
                {index + 1 < onboardingSteps.length ? <hr style={{border: 'none', backgroundColor: 'lightgray', height: '0.10px', width: '100%'}} /> : <div></div>}
            </BlockStack>
        )
    })

    const analyticsMarkup = [{start: 0, end: 1}, {start: 2, end: 3}, {start: 4, end: 5}].map(indices => {
        const cards: React.JSX.Element[] = []
        analyticsData.forEach((row, index) => {
            if (index >= indices.start && index <= indices.end) {
                cards.push(
                    <Card key={index}>
                        <BlockStack gap={'150'}>
                            <Text as="h1" alignment="center" variant="headingMd">{row.heading}</Text>
                            <Text as="h1" variant="heading2xl" alignment="center">{row.value}</Text>
                        </BlockStack>
                    </Card>
                )
            }
        })
        return (
            <InlineGrid columns={2} gap={'200'}>
                {cards}
            </InlineGrid>
        )
    })

    return (
        <Page
        title="Home Dashboard"
        primaryAction={{content: 'Support'}}
        >
            <BlockStack gap={'200'}>
                {!stepsDismissed &&
                <>
                    <Text as="h1" variant="headingLg">Setup</Text>
                    <Card>
                        <BlockStack gap={'500'}>
                            {progress === 100 ?
                            <InlineStack blockAlign="start" align="space-between">
                                <BlockStack gap='050'>
                                    <Text as="h1" variant="headingMd">You Are All Set Up!</Text>
                                    <Text as="p" variant="bodySm">
                                        Feel free to ask us any questions using the support button in the upper right corner! Our goal is to help you achieve your goals!
                                    </Text>
                                </BlockStack>
                                <Button variant="plain" onClick={() => setStepsDismissed(true)}>Dismiss</Button>
                            </InlineStack>
                            :
                            <BlockStack gap='050'>
                                <Text as="h1" variant="headingMd">Let's Get You Set Up!</Text>
                                <Text as="p" variant="bodySm">Complete the following steps to maximize your success with RateSphere:</Text>
                            </BlockStack>
                            }
                            <BlockStack gap={'500'}>
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%'}}>
                                    <Text as="p" fontWeight="bold">{numOfStepsCompleted} of 3 Tasks Complete</Text>
                                    <div style={{width: '80%'}}>
                                        <ProgressBar tone="success" size="small" progress={progress} />
                                    </div>
                                </div>
                                <BlockStack gap={'600'}>
                                    {onboardingStepsMarkup}
                                </BlockStack> 
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </>
                }
                <InlineStack align="space-between">
                    <Text as="h1" variant="headingLg">Analytics</Text>
                    <Select 
                    label="Date Range"
                    labelHidden 
                    options={[
                        {label: "All Time", value: "all"},
                        {label: "Today", value: "today"},
                        {label: "Past 30 Days", value: "month"},
                        {label: "Past 6 Months", value: "sixMonths"},
                        {label: "Past Year", value: "year"},
                    ]}
                    value={dateRange}
                    onChange={setDateRange}
                    />
                </InlineStack>
                {analyticsMarkup}
            </BlockStack>
        </Page>
    )
}