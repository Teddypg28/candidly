import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Layout, Page } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

import { SaveBar } from "@shopify/app-bridge-react";

import { useLoaderData, useLocation, useSubmit } from "@remix-run/react";
import { useRef, useState } from "react";

import db from '../db.server'

import SettingsTabs from "~/components/SettingsTabs";
import ReviewVerificationSettings from "~/components/settings/ReviewVerificationSettings";
import ReviewRequestTimingSettings from "~/components/settings/ReviewRequestTimingSettings";
import GeneralSettings from "~/components/settings/GeneralSettings";

export async function loader({request, params} : LoaderFunctionArgs) {
    const { session, admin } = await authenticate.admin(request)
    const appSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}})
    if (appSettings) return {...appSettings, path: params.path}

    // fetch store owner email and set it as primary email
    const getEmailQuery = `
        query getStoreEmail {
        shop {
          email
        }
      }`
    const res = await admin.graphql(getEmailQuery)
    const data = await res.json()
    const primaryEmail = data.data.shop.email

    const defaultSettings = {
        store: session.shop,
        autoPublishReviews: ['false'],
        minReviewRating: 4, 
        firstReviewRequest: 10,
        secondReviewRequest: 5,
        primaryEmail,
        companyName: session.shop.split('.')[0]
    }
    const initializedSettings = await db.appSettings.create({data: defaultSettings})
    return {...initializedSettings, path: params.path}
}

export async function action({ request } : ActionFunctionArgs) {
    const { session } = await authenticate.admin(request)
    const data = await request.json()
    await db.appSettings.updateMany({where: {store: {equals: session.shop}}, data: {...data.settingsState}})
    return true
}

export default function Settings() {

    const submit = useSubmit()
    const location = useLocation()
    const settingsPath = location.pathname.split('/settings/')[1]

    const settings = useLoaderData<typeof loader>()

    const [settingsState, setSettingsState] = useState(settings)
    const [cleanState, setCleanState] = useState(settingsState)
    const errors = useRef([])

    const isStateDirty = JSON.stringify(settingsState) !== JSON.stringify(cleanState)

    const cancelChanges = () => setSettingsState(cleanState)
    const updateSettings = () => {
        if (errors.current.length > 0) return
        submit(JSON.stringify({settingsState}), {method: 'POST', encType: 'application/json'});
        setCleanState(settingsState)
    }

    let SettingsComponent
    switch(settingsPath) {
        case "general":
            SettingsComponent = <GeneralSettings state={settingsState} setState={setSettingsState} errors={errors} />
            break
        case "review-request-timing":
            SettingsComponent = <ReviewRequestTimingSettings state={settingsState} setState={setSettingsState} errors={errors} />
            break   
        case "verification":
            SettingsComponent = <ReviewVerificationSettings state={settingsState} setState={setSettingsState} errors={errors} />
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