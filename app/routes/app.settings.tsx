import { useState } from "react";

import { BlockStack, Layout, Page, ColorPicker, Text, TextField, Button, hexToRgb, rgbToHsb, hsbToHex, InlineStack } from "@shopify/polaris";
import { Modal, SaveBar } from "@shopify/app-bridge-react";
import { ViewIcon, CheckCircleIcon } from '@shopify/polaris-icons';

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { json } from "@remix-run/node";
import db from '../db.server'

import { useLoaderData, useSubmit } from "@remix-run/react";
import ReviewFormPreview from "~/components/ReviewFormPreview";
import isBlockDisabled from "~/helpers/isBlockDisabled";
import filterSettingsBeforeDbUpdate from "~/helpers/filterSettingsBeforeDbUpdate";

export const loader = async ({request} : LoaderFunctionArgs) => {

    const { session } = await authenticate.admin(request)

    const reviewSettings = await db.reviewSettings.findFirst({where: {store: {equals: session.shop}}})

    const isReviewsWidgetDisabled = await isBlockDisabled(request, 'reviews', 'appBlock')

    const store = session.shop

    if (!reviewSettings) {

        const reviewFormData = { 

            store,
            formHeading: 'Tell Us What You Think',
            formSubheading: 'Rate it out of 5 stars:',
            primaryColor: JSON.stringify( { hue: 900, brightness: 1, saturation: 1 } ),
            backgroundColor: JSON.stringify( { hue: 0, saturation: 0, brightness: 0.9647, alpha: 1 })
            
        }

        const reviewResult = await db.reviewSettings.create({data: reviewFormData})
        
        return json({ reviewSettings : {...reviewResult, isReviewsWidgetDisabled}, store})

    } 

    return json({ reviewSettings : {...reviewSettings, isReviewsWidgetDisabled}, store})

}

export const action = async ({ request } : ActionFunctionArgs) => {

    const { session } = await authenticate.admin(request)

    const data = await request.json()

    const currentReviewSettings = await db.reviewSettings.findFirst({where: {store: {equals: session.shop}}})

    const isReviewSettingsClean = JSON.stringify(currentReviewSettings) === JSON.stringify(data.reviewSettings)

    if (!isReviewSettingsClean) {

        const dataToUpdate = filterSettingsBeforeDbUpdate(data.reviewSettings)

        await db.reviewSettings.updateMany({where: {store: { equals: session.shop }, }, data: {...dataToUpdate} })

    }

    return true

}

export default function Settings() {

    const data = useLoaderData<typeof loader>()

    const submit = useSubmit()

    const [cleanSettings, setCleanSettings] = useState(data)
    const [settingsState, setSettingsState] = useState(data)
    const isFormClean = JSON.stringify(cleanSettings) === JSON.stringify(settingsState)
    
    const { reviewSettings, store } = settingsState
    const { formHeading, formSubheading, primaryColor, backgroundColor, isReviewsWidgetDisabled } = reviewSettings

    const [isReviewPreviewShowing, setIsReviewPreviewShowing] = useState(false)
    
    const [reviewFormHexColor, setReviewFormHexColor] = useState(hsbToHex(JSON.parse(primaryColor)))
    const [backgroundHexColor, setBackgroundHexColor] = useState(hsbToHex(JSON.parse(backgroundColor)))

    const reviewsDeepLink = `https://${store}/admin/themes/current/editor?template=product&addAppBlockId=71f5b7e8-355e-4ae5-9482-6637e5f48118/reviews&target=newAppsSection`

    const handleSave = () => {

        setCleanSettings({...settingsState})
        submit(settingsState, {method: 'POST', encType: 'application/json'})
        
    }

    const convertToHsb = (hexValue: string, type: string) => {

        const rgb = hexToRgb(hexValue)
        const hsb = rgbToHsb(rgb)

        if (type === 'reviewPrimary') {
            setReviewFormHexColor(hexValue)
            return setSettingsState({...settingsState, reviewSettings: {...reviewSettings, primaryColor: JSON.stringify(hsb)}})
        }

        if (type === 'reviewBackground') {
            setBackgroundHexColor(hexValue)
            return setSettingsState({...settingsState, reviewSettings: {...reviewSettings, backgroundColor: JSON.stringify(hsb)}})
        }

    }

    const handleColorPickerChange = (hsbValue: string, type: string) => {

        if (type === 'reviewPrimary') {
            setSettingsState({...settingsState, reviewSettings: {...reviewSettings, primaryColor: hsbValue}})
            return setReviewFormHexColor(hsbToHex(JSON.parse(hsbValue)))
        }

        if (type === 'reviewBackground') {
            setSettingsState({...settingsState, reviewSettings: {...reviewSettings, backgroundColor: hsbValue}})
            return setBackgroundHexColor(hsbToHex(JSON.parse(hsbValue)))
        }

    }

    return (
        <Page
        title="App Settings"
        subtitle="Customize the form to fit your own branding and messaging"
        >
            <SaveBar open={!isFormClean}>
                <button variant='primary' onClick={handleSave}></button>
                <button onClick={() => { setSettingsState(data)}}></button>
            </SaveBar>
            <Modal 
            open={isReviewPreviewShowing}
            onHide={() => setIsReviewPreviewShowing(false)}
            >
                <ReviewFormPreview 
                formHeading={formHeading}
                formSubheading={formSubheading}
                primaryColor={reviewFormHexColor}
                />
            </Modal>
            <Layout>
                <Layout.Section>
                    <BlockStack gap='500'>
                        <InlineStack gap='100'>
                            <Button variant="primary" icon={ViewIcon} onClick={() => setIsReviewPreviewShowing(true)}>Preview</Button>
                            <Button target="_blank" url={reviewsDeepLink} disabled={!isReviewsWidgetDisabled} icon={isReviewsWidgetDisabled ? undefined : CheckCircleIcon} variant="primary" tone="critical">
                                {isReviewsWidgetDisabled ? 'Enable' : 'Enabled'}
                            </Button>
                        </InlineStack>
                
                        <BlockStack gap='500'>
                            <BlockStack gap='200'>
                                <BlockStack gap='200'>
                                    <TextField 
                                    value={formHeading} 
                                    onChange={(value) => setSettingsState({...settingsState, reviewSettings: {...reviewSettings, formHeading: value}})} 
                                    label='Review Form Heading' 
                                    autoComplete="off" />
                                    <TextField 
                                    value={formSubheading} 
                                    onChange={(value) => setSettingsState({...settingsState,  reviewSettings: {...reviewSettings, formSubheading: value}})} 
                                    label='Review Form Subheading' 
                                    autoComplete="off" />
                                </BlockStack>
                                <InlineStack gap='1000'>
                                    <BlockStack gap='200'>
                                        <BlockStack gap='100'>
                                            <Text as="h1">Primary Brand Color</Text>
                                            <ColorPicker color={JSON.parse(primaryColor)} onChange={(value) => handleColorPickerChange(JSON.stringify(value), 'reviewPrimary')} />
                                        </BlockStack>
                                        <InlineStack blockAlign="end" gap='200'>
                                            <TextField value={reviewFormHexColor} onChange={(value) => convertToHsb(value, 'reviewPrimary')} label="Primary Brand Color" placeholder="Enter color code here" autoComplete="off" />
                                            <div style={{backgroundColor: reviewFormHexColor, height: '32px', width: '32px', borderRadius: '5px'}}></div>
                                        </InlineStack>
                                    </BlockStack>
                                    <BlockStack gap='200'>
                                        <BlockStack gap='100'>
                                            <Text as="h1">Widget Background Color</Text>
                                            <ColorPicker color={JSON.parse(backgroundColor)} onChange={(value) => handleColorPickerChange(JSON.stringify(value), 'reviewBackground')} />
                                        </BlockStack>
                                        <InlineStack blockAlign="end" gap='200'>
                                            <TextField value={backgroundHexColor} onChange={(value) => convertToHsb(value, 'reviewBackground')} label="Widget Background Color" placeholder="Enter color code here" autoComplete="off" />
                                            <div style={{backgroundColor: backgroundHexColor, height: '32px', width: '32px', borderRadius: '5px'}}></div>
                                        </InlineStack>
                                    </BlockStack>
                                </InlineStack>
                            </BlockStack>
                        </BlockStack>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    )
}
