import { LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Card, Label, Layout, Page, TextField } from "@shopify/polaris";
import ReviewFormPreview from "~/components/ReviewFormPreview";

import { authenticate } from "~/shopify.server";
import db from '../db.server'
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { ColorPicker, useColor } from 'react-color-palette'
import "react-color-palette/css"
import { SaveBar } from "@shopify/app-bridge-react";

export async function loader({ request } : LoaderFunctionArgs) {

    const { session } = await authenticate.admin(request)

    const reviewFormSettings = await db.reviewFormSettings.findFirst({where: {store: {equals: session.shop}}})

    if (!reviewFormSettings) {

        const defaultSettings = {
            store: session.shop,
            heading: 'Tell Us What You Think',
            subheading: 'Rate it out of 5 stars:',
            headlinePlaceholder: 'Sum up your experience in a few short words',
            reviewPlaceholder: 'What did you like or not like?',
            primaryFormColor: '#fafafa',
        }

        return await db.reviewFormSettings.create({data: defaultSettings})

    }

    return reviewFormSettings

}

export default function ReviewForm() {

    const data = useLoaderData<typeof loader>()

    const [settingsState, setSettingsState] = useState(data)
    const [cleanState, setCleanState] = useState(settingsState)

    const [color, setColor] = useColor(settingsState.primaryFormColor)

    const isFormDirty = JSON.stringify(cleanState) !== JSON.stringify(settingsState) || cleanState.primaryFormColor !== color.hex

    return (

        <Page>
            <SaveBar open={isFormDirty}>
                <button variant={'primary'}></button>
                <button></button>
            </SaveBar>
            <Layout>
                <Layout.Section variant="oneThird">
                    <Card>
                        <BlockStack gap='200'>
                            <TextField 
                            value={settingsState.heading} 
                            onChange={(value) => setSettingsState({...settingsState, heading: value})}
                            label='Heading' 
                            autoComplete="off" />
                            <TextField 
                            value={settingsState.subheading} 
                            onChange={(value) => setSettingsState({...settingsState, subheading: value})} 
                            label='Subheading' 
                            autoComplete="off" />
                            <TextField 
                            value={settingsState.headlinePlaceholder} 
                            onChange={(value) => setSettingsState({...settingsState, headlinePlaceholder: value})}
                            label='Headline Placeholder' 
                            autoComplete="off" />
                            <TextField 
                            value={settingsState.reviewPlaceholder} 
                            onChange={(value) => setSettingsState({...settingsState, reviewPlaceholder: value})} 
                            label='Review Placeholder' 
                            autoComplete="off" />
                            <Label id="primaryFormColor">Primary Form Color</Label>
                            <ColorPicker
                            height={150}
                            color={color} 
                            onChange={setColor} />
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneHalf">
                    <ReviewFormPreview 
                    heading={settingsState.heading}
                    subheading={settingsState.subheading}
                    headlinePlaceholder={settingsState.headlinePlaceholder}
                    reviewPlaceholder={settingsState.reviewPlaceholder}
                    primaryColor={color}
                    />
                </Layout.Section>
            </Layout>
        </Page>

    )

}