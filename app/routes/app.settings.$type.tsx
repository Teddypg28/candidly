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

    const initialDisplayProducts = []

    for (let i = 0; i< 3; i++) {
        initialDisplayProducts.push({
            productId: '',
            store: session.shop,
            title: '',
            imageUrl: ''
        })
    }

    const defaultSettings = {

        store: session.shop,
        autoPublishReviews: ['false'],
        reviewRequestEmailProductDisplay: ['disabled'],
        minReviewRating: 4, 
        firstReviewRequest: 10,
        secondReviewRequest: 5

    }

    const initializedSettings = await db.appSettings.create({data: {...defaultSettings, displayProducts: {createMany: {data: initialDisplayProducts}}}, include: {displayProducts: true}})

    return {...initializedSettings, path: params.path}

}

export async function action({ request } : ActionFunctionArgs) {

    const { session } = await authenticate.admin(request)

    const data = await request.json()

    const currentDisplayProducts = [...data.settingsState.displayProducts]

    await Promise.all(currentDisplayProducts.map(async (product) => {

        const id = product.id
        const savedDisplayProduct = await db.displayProduct.findFirst({where: {id: {equals: id}}})

        const updateNeeded = JSON.stringify(savedDisplayProduct) !== JSON.stringify(product)

        if (updateNeeded) {

            delete product['id']
            await db.displayProduct.update({where: {id}, data: {...product}})
            return true
        }

    }))

    delete data.settingsState['id']
    delete data.settingsState['displayProducts']

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

    const isStateDirty = JSON.stringify(settingsState) !== JSON.stringify(cleanState)

    const cancelChanges = () => setSettingsState(cleanState)
    const updateSettings = () => {
        submit(JSON.stringify({settingsState}), {method: 'POST', encType: 'application/json'});
        setCleanState(settingsState)
    }

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