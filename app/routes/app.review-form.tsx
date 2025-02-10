import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Banner, BlockStack, Card, Label, Layout, Page, TextField } from "@shopify/polaris";
import ReviewFormPreview from "~/components/ReviewFormPreview";

import { authenticate } from "~/shopify.server";
import db from '../db.server'
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { ColorPicker, IColor, useColor } from 'react-color-palette'
import "react-color-palette/css"

import { SaveBar } from "@shopify/app-bridge-react";
import { defaultReviewFormSettings } from "~/types/types";
import fetchRewardTiers from "~/helpers/fetchRewardTiers";

export async function loader({ request } : LoaderFunctionArgs) {
    const { session } = await authenticate.admin(request)
    const reviewFormSettings = await db.reviewFormSettings.findFirst({where: {store: {equals: session.shop}}})
    const rewardTiers = await fetchRewardTiers(session.shop)

    if (reviewFormSettings) {
        return json({...reviewFormSettings, rewards: rewardTiers})
    }
    const defaultSettings = await db.reviewFormSettings.create({data: {...defaultReviewFormSettings, store: session.shop}})

    return json({...defaultSettings, rewards: rewardTiers})
}

export default function ReviewForm() {

    const data = useLoaderData<typeof loader>()

    const [settingsState, setSettingsState] = useState(data)
    const cleanState = data

    const [color, setColor] = useColor(settingsState.primaryFormColor)
    const [cleanColor, setCleanColor] = useState(color)

    const isFormDirty = JSON.stringify(cleanState) !== JSON.stringify(settingsState)

    return (

        <Page>
            <SaveBar open={isFormDirty}>
                <button variant={'primary'}></button>
                <button onClick={() => { setSettingsState(cleanState); setColor(cleanColor) }}></button>
            </SaveBar>
            <BlockStack gap='200'>
                <Banner 
                tone="info"
                title="Note: Reward Configuration"
                >
                    If no rewards are configured, the form will not include the progress bars or reward tiers
                </Banner>
                <Layout>
                    <Layout.Section variant="oneThird">
                        <Card>
                            <BlockStack gap='200'>
                                <TextField 
                                value={settingsState.heading} 
                                onChange={(value) => setSettingsState(prevSettingsState => {return {...prevSettingsState, heading: value}})}
                                label='Heading' 
                                autoComplete="off" />
                                <TextField 
                                value={settingsState.subheading} 
                                onChange={(value) => setSettingsState(prevSettingsState => {return {...prevSettingsState, subheading: value}})} 
                                label='Subheading' 
                                autoComplete="off" />
                                <TextField 
                                value={settingsState.headlinePlaceholder} 
                                onChange={(value) => setSettingsState(prevSettingsState => {return {...prevSettingsState, headlinePlaceholder: value}})}
                                label='Headline Placeholder' 
                                autoComplete="off" />
                                <TextField 
                                value={settingsState.reviewPlaceholder} 
                                onChange={(value) => setSettingsState(prevSettingsState => {return {...prevSettingsState, reviewPlaceholder: value}})} 
                                label='Review Placeholder' 
                                autoComplete="off" />
                                <Label id="primaryFormColor">Primary Form Color</Label>
                                <ColorPicker
                                height={150}
                                color={color} 
                                onChange={(color: IColor) => { setSettingsState(prevSettingsState => {return {...prevSettingsState, primaryFormColor: color.hex}}); setColor(color)}} />
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                    <Layout.Section variant="oneHalf">
                        <ReviewFormPreview 
                        rewards={settingsState.rewards}
                        heading={settingsState.heading}
                        subheading={settingsState.subheading}
                        headlinePlaceholder={settingsState.headlinePlaceholder}
                        reviewPlaceholder={settingsState.reviewPlaceholder}
                        primaryColor={settingsState.primaryFormColor}
                        />
                    </Layout.Section>
                </Layout>
            </BlockStack>
        </Page>

    )

}