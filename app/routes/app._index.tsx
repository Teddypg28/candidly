import { json, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Button, Card, InlineGrid, InlineStack, Link, Page, ProgressBar, Select, Text } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

import { ClipboardCheckIcon, ClipboardCheckFilledIcon } from '@shopify/polaris-icons';

import db from '../db.server'
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import getAnalyticsData from "~/helpers/getAnalyticsData";
import { AnalyticsData } from "~/types/types";
import isBlockEnabled from "~/helpers/isBlockEnabled";

export const loader = async ({ request } : LoaderFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request)

    const appSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}})
    const reviewRequestEmailSettings = await db.reviewRequestEmailSettings.findFirst({where: {store: {equals: session.shop}}})
    const reviewFormDesignSettings = await db.reviewFormSettings.findFirst({where: {store: {equals: session.shop}}})
    const rewardSettings = await db.reward.findFirst({where: {store: {equals: session.shop}}})
    const analyticsData = await getAnalyticsData(session, admin, 'all')
    const isReviewWidgetEnabled = await isBlockEnabled(request, 'reviews', 'appBlock')

    const themes = await admin.rest.resources.Theme.all({ session })
    const activeTheme = themes.data.find(theme => theme.role === "main")
    const activeThemeId = activeTheme?.id

    return json(
        {
            appSettings, 
            reviewRequestEmailSettings, 
            reviewFormDesignSettings, 
            rewardSettings, 
            analyticsData, 
            isReviewWidgetEnabled, 
            activeThemeId, 
            store: session.shop
        }
    )
}

export default function Index() {

    const data = useLoaderData<typeof loader>()

    const [stepsDismissed, setStepsDismissed] = useState(false)
    const [dateRange, setDateRange] = useState('all')
    const [analyticsData, setAnalyticsData] = useState(data.analyticsData)

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
            name: 'Configure Reviews Widget', 
            description: 'Configure the reviews widget on your product pages', 
            complete: data.isReviewWidgetEnabled,
            url: `https://${data.store}/admin/themes/${data.activeThemeId || 'current'}/editor?template=product&addAppBlockId=8000cf7a96c4069469b9760940699882/reviews&target=product`
        },
        {
            name: 'Visit the Settings Page', 
            description: 'Make any necessary changes to the default settings that are currently in place', 
            complete: data.appSettings,
            url: '/app/settings/general'
        },
        {
            name: 'Create some rewards!', 
            description: 'Choose how you want to reward your customers when they submit reviews for your products.', 
            complete: data.rewardSettings,
            url: '/app/rewards'
        },
        {
            name: 'Customize Your Review Request Email Template', 
            description: 'Add a logo and configure how you want your email to look when you send review requests to customers', 
            complete: data.reviewRequestEmailSettings,
            url: '/app/email-template'
        },
        {
            name: 'Customize Your Review Form', 
            description: 'Customize the look and messaging on the review form that your customers will fill out', 
            complete: data.reviewFormDesignSettings,
            url: '/app/review-form'
        }
    ]

    const numOfStepsCompleted = onboardingSteps.filter(step => step.complete !== null && step.complete !== false).length
    const progress = Math.round((numOfStepsCompleted/onboardingSteps.length) * 100)
    const indexOfFirstIncompleteStep = onboardingSteps.findIndex(step => step.complete === null || step.complete === false)

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
                            <Button target="_blank" url={step.url} variant="primary">Complete Step</Button>
                        </InlineStack>
                        )}
                    </BlockStack>
                </InlineStack>
                {index + 1 < onboardingSteps.length ? <hr style={{border: 'none', backgroundColor: 'lightgray', height: '0.10px', width: '100%'}} /> : <div></div>}
            </BlockStack>
        )
    })

    const analyticsMarkup = [{start: 0, end: 1}, {start: 2, end: 3}, {start: 4, end: 5}].map((indices, indice) => {
        const cards: React.JSX.Element[] = []
        analyticsData.forEach((row: AnalyticsData, index) => {
            if (index >= indices.start && index <= indices.end) {
                cards.push(
                    <Card key={`${indice}-${index}`}>
                        <BlockStack gap={'150'} inlineAlign="center">
                            <Text as="h1" alignment="center" variant="headingMd">{row.heading}</Text>
                            {row.link ? <Link target="_blank" url={row.link}>{row.value}</Link> : <Text as="h1" variant="heading2xl" alignment="center">{row.value}</Text> }
                        </BlockStack>
                    </Card>
                )
            }
        })
        return (
            <InlineGrid key={indice} columns={2} gap={'200'}>
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
                                    <Text as="p" fontWeight="bold">{numOfStepsCompleted} of {onboardingSteps.length} Tasks Complete</Text>
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
                <InlineStack align="space-between" blockAlign="center">
                    <Text as="h1" variant="headingLg">Review Analytics</Text>
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