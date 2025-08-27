import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Card, Layout, Page, TextField } from "@shopify/polaris";

import { authenticate } from "~/shopify.server";
import db from '../db.server'
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";

import { SaveBar } from "@shopify/app-bridge-react";
import ReviewFormPreview from "~/components/ReviewFormPreview";
import fetchRewardTierRewards from "~/helpers/rewards/fetchRewardTierRewards";

export async function action({ request } : ActionFunctionArgs) {
    const data = await request.json()
    await db.reviewFormSettings.update({where: {id: data.id}, data: {...data}}) 
    return true
}

export async function loader({ request } : LoaderFunctionArgs) {
    const { session } = await authenticate.admin(request)
    const reviewFormSettings = await db.reviewFormSettings.findFirst({where: {store: {equals: session.shop}}})
    const reviewFormQuestions = await db.reviewFormQuestion.findMany({where: {store: {equals: session.shop}}, include: {radioAnswerChoices: true}})

    const subscription = await db.subscription.findFirst({where: {shop: {equals: session.shop}}})
    
    const rewardSettings = await db.reward.findFirst({where: {store: {equals: session.shop}}})
    const rewardTierNames = await fetchRewardTierRewards(rewardSettings?.id)

    if (reviewFormSettings) {
        return json({settings: reviewFormSettings, questions: reviewFormQuestions, rewardNames: rewardSettings?.type === "tiers" && subscription?.type !== "free" ? rewardTierNames : []})
    }
    const defaultSettings = await db.reviewFormSettings.create({data: {store: session.shop}})

    return json({settings: defaultSettings, questions: reviewFormQuestions, rewardNames: []})
}

export default function ReviewFormTemplate() {

    const data = useLoaderData<typeof loader>()

    const [settingsState, setSettingsState] = useState(data.settings)
    const cleanState = data.settings

    const isFormDirty = JSON.stringify(cleanState) !== JSON.stringify(settingsState)

    const submit = useSubmit()

    const saveChanges = () => submit(JSON.stringify(settingsState), {method: 'POST', encType: 'application/json'})

    return (

        <Page
        title="Customize Your Review Form"
        subtitle="Edit the heading and placeholders of each question"
        backAction={{content: '', url: '/app'}}
        >
            <SaveBar open={isFormDirty}>
                <button variant={'primary'} onClick={saveChanges}></button>
                <button onClick={() => { setSettingsState(cleanState) }}></button>
            </SaveBar>
            <BlockStack gap={'200'}>
                <BlockStack gap='200'>
                    <Layout>
                        <Layout.Section variant="oneThird">
                            <Card>
                                <BlockStack gap='200'>
                                    <TextField 
                                    value={settingsState.starRatingHeading} 
                                    onChange={(value) => setSettingsState(prevSettingsState => {return {...prevSettingsState, starRatingHeading: value}})}
                                    label='Star Rating Heading' 
                                    autoComplete="off" />
                                    <TextField 
                                    value={settingsState.titleHeading} 
                                    onChange={(value) => setSettingsState(prevSettingsState => {return {...prevSettingsState, titleHeading: value}})}
                                    label='Review Title Heading' 
                                    autoComplete="off" />
                                    <TextField 
                                    value={settingsState.titlePlaceholder} 
                                    onChange={(value) => setSettingsState(prevSettingsState => {return {...prevSettingsState, titlePlaceholder: value}})}
                                    label='Review Title Placeholder' 
                                    autoComplete="off" />
                                    <TextField 
                                    value={settingsState.bodyHeading} 
                                    onChange={(value) => setSettingsState(prevSettingsState => {return {...prevSettingsState, bodyHeading: value}})}
                                    label='Review Body Heading' 
                                    autoComplete="off" />
                                    <TextField 
                                    value={settingsState.bodyPlaceholder} 
                                    onChange={(value) => setSettingsState(prevSettingsState => {return {...prevSettingsState, bodyPlaceholder: value}})}
                                    label='Review Body Placeholder' 
                                    autoComplete="off" />
                                    <TextField 
                                    value={settingsState.customQuestionsHeading} 
                                    onChange={(value) => setSettingsState(prevSettingsState => {return {...prevSettingsState, customQuestionsHeading: value}})}
                                    label='Custom Questions Heading' 
                                    autoComplete="off" />
                                    <TextField 
                                    value={settingsState.mediaHeading} 
                                    onChange={(value) => setSettingsState(prevSettingsState => {return {...prevSettingsState, mediaHeading: value}})}
                                    label='Review Media Heading' 
                                    autoComplete="off" />                               
                                </BlockStack>
                            </Card>
                        </Layout.Section>
                        <Layout.Section variant="oneHalf">
                            <ReviewFormPreview 
                            customQuestionsHeading={settingsState.customQuestionsHeading}
                            bodyHeading={settingsState.bodyHeading}
                            bodyPlaceholder={settingsState.bodyPlaceholder}
                            mediaHeading={settingsState.mediaHeading}
                            starRatingHeading={settingsState.starRatingHeading}
                            titleHeading={settingsState.titleHeading}
                            titlePlaceholder={settingsState.titlePlaceholder}
                            rewardNames={data.rewardNames}
                            />
                        </Layout.Section>
                    </Layout>
                </BlockStack>
            </BlockStack>
        </Page>

    )

}