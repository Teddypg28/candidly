import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Layout, Page } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

import { SaveBar } from "@shopify/app-bridge-react";

import { useLoaderData, useLocation, useSubmit } from "@remix-run/react";
import { useState } from "react";

import db from '../db.server'

import SettingsTabs from "~/components/SettingsTabs";
import ReviewVerificationSettings from "~/components/settings/ReviewVerificationSettings";
import ReviewRequestTimingSettings from "~/components/settings/ReviewRequestTimingSettings";
import ReviewEmailSettings from "~/components/settings/ReviewEmailSettings";

export async function loader({request, params} : LoaderFunctionArgs) {

    const { session } = await authenticate.admin(request)

    const appSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}, include: {displayProducts: true}})

    if (appSettings) return {...appSettings, path: params.path}

    const defaultSettings = {

        store: session.shop,
        autoPublishReviews: ['false'],
        reviewRequestEmailProductDisplay: ['disabled'],
        minReviewRating: 4, 
        firstReviewRequest: 10,
        secondReviewRequest: 5

    }

    const initializedSettings = await db.appSettings.create({data: {...defaultSettings}, omit: {id: true}, include: {displayProducts: true}})

    return {...initializedSettings, path: params.path}

}

export async function action({ request } : ActionFunctionArgs) {

    const { session } = await authenticate.admin(request)

    console.log('RUN')

    return true

}

export default function Settings() {

    const submit = useSubmit()
    const location = useLocation()
    const settingsPath = location.pathname.split('/settings/')[1]

    const settings = useLoaderData<typeof loader>()

    const [settingsState, setSettingsState] = useState(settings)
    const [cleanState, setCleanState] = useState(settingsState)

    const isStateDirty = JSON.stringify(settingsState) !== JSON.stringify(cleanState)

    const cancelChanges = () => setSettingsState(cleanState)
    const updateSettings = () => submit(null, {method: 'POST', encType: 'application/json'})

    let SettingsComponent

    switch(settingsPath) {
        case "review-request-timing":
            SettingsComponent = <ReviewRequestTimingSettings state={settingsState} setState={setSettingsState} />
            break
        case "email":
            SettingsComponent = <ReviewEmailSettings state={settingsState} setState={setSettingsState} />
            break    
        case "verification":
            SettingsComponent = <ReviewVerificationSettings state={settingsState} setState={setSettingsState} />
            break
    }

    return (

        <Page 
        title="App Settings"
        >
            <SaveBar open={isStateDirty}>
                <button variant={'primary'} onClick={updateSettings}></button>
                <button onClick={cancelChanges}></button>
            </SaveBar>
            <Layout>
                <Layout.Section variant="oneThird">
                    <SettingsTabs 
                    store={settings.store}
                    path={settingsPath}
                    />
                </Layout.Section>
                <Layout.Section variant="oneHalf">
                    {SettingsComponent}
                </Layout.Section>
            </Layout>
        </Page>

    )

}