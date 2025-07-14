import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Banner, BlockStack, Card, InlineStack, Page, Text, TextField } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

import db from '../db.server'

import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";

export const action = async ({ request } : ActionFunctionArgs) => {
    try {
        const { session } = await authenticate.admin(request)
    
        const data = await request.json()
        const updatedRewards = await db.rewards.updateMany({where: {store: {equals: session.shop}}, data})

        return new Response(JSON.stringify({updatedRewards}), {status: 200})
    } catch (error) {
        return new Response(JSON.stringify({error}), {status: 400})
    }
}

export const loader = async ({ request } : LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request)

    const rewards = await db.rewards.findFirst({where: {store: {equals: session.shop}}, omit: {id: true, store: true}})
    if (!rewards) {
        return await db.rewards.create({data: {store: session.shop}, omit: {id: true, store: true}})
    }
    return rewards
}

export default function Rewards() {

    const configuredRewards = useLoaderData<typeof loader>()
    const submit = useSubmit()

    const [rewardsState, setRewardsState] = useState({plain: configuredRewards.plain, advanced: configuredRewards.advanced})
    const cleanState = configuredRewards
    
    const isRewardsStateDirty = JSON.stringify(rewardsState) !== JSON.stringify(cleanState)

    const saveChanges = () => { submit(JSON.stringify(rewardsState), {encType: 'application/json', method: 'POST'}) }

    return (
        <Page 
        title="Review Rewards" 
        subtitle="Configure rewards to better your chances of receiving reviews"
        >
            <SaveBar open={isRewardsStateDirty}>
                <button variant="primary" onClick={saveChanges}></button>
                <button onClick={() => setRewardsState(cleanState)}></button>
            </SaveBar>
            <BlockStack gap={'300'}>
                <Banner tone="info" title="Disabling Rewards">
                    If you want to disable a specific reward, simply enter 0 as the coupon value.
                </Banner>
                <Card>
                    <BlockStack gap={'200'}>
                        <Text as="h1" variant="headingMd" fontWeight="bold">
                            Plain Review
                        </Text>
                        <Text as="p" variant="bodyXs">
                            A review that contains no uploaded images or videos showcasing the product.
                        </Text>
                        <InlineStack gap={'300'} blockAlign="center">
                            <TextField 
                            type="number" 
                            onChange={
                                (discountAmount) => setRewardsState(oldRewardsState => 
                                    {
                                        return {...oldRewardsState, plain: parseInt(discountAmount) > 50 ? 0 : parseInt(discountAmount)}
                                    }
                                )
                            }
                            value={rewardsState.plain.toString()}
                            label="" 
                            min={0}
                            max={50}
                            autoComplete="off" 
                            suffix="% Off Coupon"
                            />                    
                        </InlineStack>
                    </BlockStack>
                </Card>
                <Card>
                    <BlockStack gap={'200'}>
                        <Text as="h1" variant="headingMd" fontWeight="bold">
                            Advanced Review
                        </Text>
                        <Text as="p" variant="bodyXs">
                            A review that contains uploaded images or videos showcasing the product.
                        </Text>
                        <InlineStack gap={'300'} blockAlign="center">
                            <TextField 
                            type="number" 
                            value={rewardsState.advanced.toString()}
                            onChange={
                                (discountAmount) => setRewardsState(oldRewardsState => 
                                    {
                                        return {...oldRewardsState, advanced: parseInt(discountAmount) > 50 ? 0 : parseInt(discountAmount)}
                                    }
                                )
                            }
                            label="" 
                            min={0}
                            max={50}
                            autoComplete="off" 
                            suffix="% Off Coupon"
                            />
                        </InlineStack>
                    </BlockStack>
                </Card>
            </BlockStack>
        </Page>
    )
}