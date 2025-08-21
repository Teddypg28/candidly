import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { BlockStack, Button, Card, InlineStack, Page, Text } from "@shopify/polaris";
import { useEffect } from "react";
import { authenticate } from "~/shopify.server";
import db from '../db.server'
import { Subscription } from "@prisma/client";
import { advanced, basic, free, pro } from "~/emailQuotaVariables";

export const loader = async ({ request } : LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request)

    return await db.subscription.findFirst({where: {shop: {equals: session.shop}}}) as Subscription
}

export const action = async ({ request } : ActionFunctionArgs) => {

    try {
        const { session, admin } = await authenticate.admin(request)
    
        const billingData = await request.json()

        const currentSubscription = await db.subscription.findFirst({where: {shop: {equals: session.shop}}}) as Subscription

        if (billingData.planName === "Free") {
            const cancelSubscriptionMutation = `
            #graphql
            mutation AppSubscriptionCancel($id: ID!, $prorate: Boolean) {
                appSubscriptionCancel(id: $id, prorate: $prorate) {
                userErrors {
                    field
                    message
                }
                appSubscription {
                    id
                    status
                }
                }
            }`

            await admin.graphql(cancelSubscriptionMutation, {variables: {
                "id": currentSubscription.subscriptionId,
                "prorate": true
            }})

            const renewalDate = new Date(currentSubscription.renewalDate)
            renewalDate.setUTCHours(0, 0, 0, 0)
            const isoStringRenewalDate = renewalDate.toISOString()

            const currentDate = new Date()
            currentDate.setUTCHours(0, 0, 0, 0)
            const isoStringCurrentDate = currentDate.toISOString()

            const daysLeftInCycle = Math.floor((new Date(isoStringRenewalDate).getTime() - new Date(isoStringCurrentDate).getTime()) / (1000 * 60 * 60 * 24))
            const daysUsed = 30 - daysLeftInCycle

            const paidQuotaSoFar = currentSubscription.emailQuota
            const newEmailQuota = free
            const updatedEmailQuota = newEmailQuota + ((paidQuotaSoFar - newEmailQuota) * (daysUsed/30))

            await db.subscription.update({where: {id: currentSubscription.id}, data: {type: "free", emailQuota: updatedEmailQuota}})

            return null
        }
    
        const mutation = `
            mutation AppSubscriptionCreate(
                    $name: String!, 
                    $lineItems: [AppSubscriptionLineItemInput!]!, 
                    $returnUrl: URL!, 
                    $test: Boolean,
                    $replacementBehavior: AppSubscriptionReplacementBehavior
                )
                {
                appSubscriptionCreate(
                    name: $name, 
                    returnUrl: $returnUrl, 
                    lineItems: $lineItems, 
                    test: $test,
                    replacementBehavior: $replacementBehavior
                    ) {
                userErrors {
                    field
                    message
                }
                appSubscription {
                    id
                }
                confirmationUrl
                }
          }
        `
    
        const response = await admin.graphql(mutation, {
              variables: {
                  "name": `${billingData.planName} Plan`,
                  "returnUrl": `https://admin.shopify.com/store/${session.shop.split(".")[0]}/apps/candidly-app/app`,
                  "lineItems": [
                      {
                          "plan": {
                              "appRecurringPricingDetails": {
                                  "price": {
                                      "amount": billingData.planName === "Basic" ? 9.99 : billingData.planName === "Pro" ? 19.99 : 39.99,
                                      "currencyCode": "USD"
                                  },
                                  "interval": "EVERY_30_DAYS"
                              }
                          }
                      }
                  ],
                  "test": false,
                  "replacementBehavior": "APPLY_IMMEDIATELY",
              },
            },
          );

        const data = await response.json()

        if (data.data.appSubscriptionCreate.userErrors.length === 0) return data.data.appSubscriptionCreate.confirmationUrl

        return null
        
    } catch (error) {
        console.log(error)
        return null
    }
}

export default function Billing() {

    const confirmationUrl = useActionData<typeof action>()
    const subscriptionData = useLoaderData<typeof loader>()
    
    const submit = useSubmit()

    useEffect(() => {
        if (confirmationUrl) window.open(confirmationUrl)
    }, [confirmationUrl])

    const selectPlan = (planName: string) => {
        submit(JSON.stringify({planName}), {method: 'POST', encType: 'application/json'})
    }

    return (
        <Page
        title="Select a Plan"
        >
            <InlineStack gap={'400'} align="space-evenly">
                <div style={{width: '225px'}}>
                    <Card>
                        <BlockStack gap={'800'}>
                            <BlockStack gap={'300'}>
                                <Text as="p" variant="bodySm">Free</Text>
                                <Text as="p" variant="headingLg" fontWeight="bold">Free <span style={{fontSize: '14px', color: 'white'}}>/ month</span></Text>
                            </BlockStack>
                            <Button 
                            onClick={() => selectPlan("Free")}
                            variant="primary" 
                            disabled={subscriptionData.type === "free"}>
                                {subscriptionData.type === "free" ? "Selected" : "Select"}
                            </Button>
                            <BlockStack>
                                <Text tone="subdued" as="p" variant="bodyMd">{free} review requests</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Customizable email templates</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Q&A</Text>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </div>
                <div style={{width: '225px'}}>
                    <Card>
                        <BlockStack gap={'800'}>
                            <BlockStack gap={'300'}>
                                <Text as="p" variant="bodySm">Basic</Text>
                                <Text as="p" variant="headingLg" fontWeight="bold">$9.99 <span style={{fontSize: '14px', color: 'gray'}}>/ month</span></Text>
                            </BlockStack>
                            <Button 
                            variant="primary" 
                            onClick={() => selectPlan("Basic")}
                            disabled={subscriptionData.type === "basic"}
                            >
                                {subscriptionData.type === "basic" ? "Selected" : "Select"}
                            </Button>
                            <BlockStack>
                                <Text tone="subdued" as="p" variant="bodyMd">{basic} review requests</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Unlimited custom questions</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Customizable email templates</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Q&A</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Reward incentives</Text>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </div>
                <div style={{width: '225px'}}>
                    <Card>
                        <BlockStack gap={'800'}>
                            <BlockStack gap={'300'}>
                                <Text as="p" variant="bodySm">Pro</Text>
                                <Text as="p" variant="headingLg" fontWeight="bold">$19.99 <span style={{fontSize: '14px', color: 'gray'}}>/ month</span></Text>
                            </BlockStack>
                            <Button 
                            variant="primary" 
                            onClick={() => selectPlan("Pro")}
                            disabled={subscriptionData.type === "pro"}
                            >
                                {subscriptionData.type === "pro" ? "Selected" : "Select"}
                            </Button>
                            <BlockStack>
                                <Text tone="subdued" as="p" variant="bodyMd">{pro} review requests</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Unlimited custom questions</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Customizable email templates</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Q&A</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Reward incentives</Text>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </div>
                <div style={{width: '225px'}}>
                    <Card>
                        <BlockStack gap={'800'}>
                            <BlockStack gap={'300'}>
                                <Text as="p" variant="bodySm">Advanced</Text>
                                <Text as="p" variant="headingLg" fontWeight="bold">$39.99 <span style={{fontSize: '14px', color: 'gray'}}>/ month</span></Text>
                            </BlockStack>
                            <Button 
                            variant="primary" 
                            onClick={() => selectPlan("Advanced")}
                            disabled={subscriptionData.type === "advanced"}
                            >
                                {subscriptionData.type === "advanced" ? "Selected" : "Select"}
                            </Button>
                            <BlockStack>
                                <Text tone="subdued" as="p" variant="bodyMd">{advanced} review requests</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Unlimited custom questions</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Customizable email templates</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Q&A</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Reward incentives</Text>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </div>
            </InlineStack>
        </Page>
    )    

}