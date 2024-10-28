import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Layout, Page } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import {
    SettingsIcon,
    EmailIcon,
    ShieldCheckMarkIcon
  } from '@shopify/polaris-icons';

import db from '../db.server'
import { useLoaderData, useLocation, useSubmit } from "@remix-run/react";
import SettingsTabs from "~/components/SettingsTabs";
import ReviewRequestSettings from "~/components/settings/ReviewRequestSettings";
import ReviewModeration from "~/components/settings/ReviewModeration";
import { useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";

export async function loader({request, params} : LoaderFunctionArgs) {

    const { session } = await authenticate.admin(request)

    const storeExists = await db.appSettings.findFirst({where: {store: {equals: session.shop}}, omit: {id: true}})

    if (storeExists) {

        return {...storeExists, path: params.path} 

    } 

    const newStoreAppSettings = {

        autoPublish: false,
        minRating: 4, 
        requiresVerification: true,
        firstEmail: 10,
        secondEmail: 5,
        thirdEmail: 3,
        store: session.shop

    }

    const settings = await db.appSettings.create({data: newStoreAppSettings})
    return {...settings, path: params.path}

}

export async function action({ request } : ActionFunctionArgs) {

    console.log('RUN')

    return true

}

export default function Settings() {

    const submit = useSubmit()

    const settings = useLoaderData<typeof loader>()
    const path = useLocation()
    const currentRoute = path.pathname.split('/settings/')[1]

    const [settingsState, setSettingsState] = useState({
        firstEmailTime: settings.firstEmail,
        secondEmailTime: settings.secondEmail,
        publishImmediately: [settings.autoPublish.toString()], 
        minRating: settings.minRating
    })
    const [cleanState, setCleanState] = useState(settingsState)

    const isStateDirty = JSON.stringify(settingsState) !== JSON.stringify(cleanState)

    const cancelChanges = () => {

        setSettingsState(cleanState)

    }

    const updateSettings = () => {

        submit(null, {method: 'POST', encType: 'application/json'})

    }

    const settingTabs = [
        {name: 'General', path: 'general', icon: <SettingsIcon height={20} width={20} />}, 
        {name: 'Review Request Emails', path: 'emails', icon: <EmailIcon height={20} width={20} />},
        {name: 'Review Verification', path: 'verification', icon: <ShieldCheckMarkIcon height={20} width={20} />}
    ]

    let CurrentPage

    switch(currentRoute) {
        case 'emails':
            CurrentPage = <ReviewRequestSettings state={settingsState} setState={setSettingsState} />
            break
        case 'verification':
            CurrentPage = <ReviewModeration state={settingsState} setState={setSettingsState} />
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
                    tabs={settingTabs}
                    selectedTabPath={currentRoute}
                    />
                </Layout.Section>
                <Layout.Section variant="oneHalf">
                    { CurrentPage }
                </Layout.Section>
            </Layout>
        </Page>

    )

}