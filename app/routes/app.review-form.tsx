import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Banner, BlockStack, Card, Label, Layout, Page, TextField } from "@shopify/polaris";
import ReviewFormPreview from "~/components/ReviewFormPreview";

import { authenticate } from "~/shopify.server";
import db from '../db.server'
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";

import { HexColorPicker, HexColorInput } from 'react-colorful'

import { SaveBar } from "@shopify/app-bridge-react";
import { defaultReviewFormSettings } from "~/types/types";

export async function action({ request } : ActionFunctionArgs) {
    const data = await request.json()
    await db.reviewFormSettings.update({where: {id: data.id}, data: {...data}}) 
    return true
}

export async function loader({ request } : LoaderFunctionArgs) {
    const { session } = await authenticate.admin(request)
    const reviewFormSettings = await db.reviewFormSettings.findFirst({where: {store: {equals: session.shop}}})

    if (reviewFormSettings) {
        return json({settings: reviewFormSettings})
    }
    const defaultSettings = await db.reviewFormSettings.create({data: {...defaultReviewFormSettings, store: session.shop}})

    return json({settings: defaultSettings})
}

export default function ReviewForm() {

    const data = useLoaderData<typeof loader>()

    const [settingsState, setSettingsState] = useState(data.settings)
    const cleanState = data.settings

    const isFormDirty = JSON.stringify(cleanState) !== JSON.stringify(settingsState)

    const submit = useSubmit()

    const saveChanges = () => submit(JSON.stringify(settingsState), {method: 'POST', encType: 'application/json'})

    return (

        <Page>
            <SaveBar open={isFormDirty}>
                <button variant={'primary'} onClick={saveChanges}></button>
                <button onClick={() => { setSettingsState(cleanState) }}></button>
            </SaveBar>
            <BlockStack gap='200'>
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
                                <HexColorPicker
                                color={settingsState.primaryFormColor} 
                                onChange={(color) => { setSettingsState(prevSettingsState => {return {...prevSettingsState, primaryFormColor: color}})}} 
                                />
                                <HexColorInput 
                                color={settingsState.primaryFormColor} 
                                onChange={(color) => { setSettingsState(prevSettingsState => {return {...prevSettingsState, primaryFormColor: color}})}}
                                />
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                    <Layout.Section variant="oneHalf">
                        <ReviewFormPreview 
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