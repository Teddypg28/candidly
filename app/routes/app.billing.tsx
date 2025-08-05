import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { BlockStack, Button, Card, InlineStack, Page, Text } from "@shopify/polaris";
import { useEffect } from "react";
import { authenticate } from "~/shopify.server";
import db from '../db.server'
import { Subscription } from "@prisma/client";

export const loader = async ({ request } : LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request)

    return await db.subscription.findFirst({where: {shop: {equals: session.shop}}}) as Subscription
}

export const action = async ({ request } : ActionFunctionArgs) => {
    try {
        const { admin } = await authenticate.admin(request)
    
        const billingData = await request.json()
    
        const mutation = `
            mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!) {
                appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems) {
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
                  "returnUrl": "http://super-duper.shopifyapps.com/",
                  "lineItems": [
                      {
                          "plan": {
                              "appRecurringPricingDetails": {
                                  "price": {
                                      "amount": billingData.planName === "Basic" ? 9.99 : billingData.planName === "Pro" ? 19.99 : 29.99,
                                      "currencyCode": "USD"
                                  },
                                  "interval": "EVERY_30_DAYS"
                              }
                          }
                      }
                  ]
              },
            },
          );
    
        const data = await response.json()
    
        return data.data.appSubscriptionCreate.confirmationUrl as string  
    } catch (error) {
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
                            variant="primary" 
                            disabled={subscriptionData.type === "free"}>
                                {subscriptionData.type === "free" ? "Selected" : "Select"}
                            </Button>
                            <BlockStack>
                                <Text tone="subdued" as="p" variant="bodyMd">50 review requests</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Unlimited custom questions</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Review rewards</Text>
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
                                <Text tone="subdued" as="p" variant="bodyMd">250 review requests</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Unlimited custom questions</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Review rewards</Text>
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
                                <Text tone="subdued" as="p" variant="bodyMd">500 review requests</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Unlimited custom questions</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Review rewards</Text>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </div>
                <div style={{width: '225px'}}>
                    <Card>
                        <BlockStack gap={'800'}>
                            <BlockStack gap={'300'}>
                                <Text as="p" variant="bodySm">Advanced</Text>
                                <Text as="p" variant="headingLg" fontWeight="bold">$29.99 <span style={{fontSize: '14px', color: 'gray'}}>/ month</span></Text>
                            </BlockStack>
                            <Button 
                            variant="primary" 
                            onClick={() => selectPlan("Advanced")}
                            disabled={subscriptionData.type === "advanced"}
                            >
                                {subscriptionData.type === "advanced" ? "Selected" : "Select"}
                            </Button>
                            <BlockStack>
                                <Text tone="subdued" as="p" variant="bodyMd">Unlimited review requests</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Unlimited custom questions</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">Review rewards</Text>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </div>
            </InlineStack>
        </Page>
    )    

}