import { LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Button, Card, InlineStack, Page, Text } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request } : LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request)
    return true
}

export default function Billing() {

    return (
        <Page
        title="Select a Plan"
        >
            <InlineStack gap={'400'} align="space-evenly">
                <div style={{width: '225px'}}>
                    <Card>
                        <BlockStack gap={'800'}>
                            <BlockStack gap={'300'}>
                                <Text as="p" variant="bodySm">Basic</Text>
                                <Text as="p" variant="headingLg" fontWeight="bold">Free <span style={{fontSize: '14px', color: 'white'}}>/ month</span></Text>
                            </BlockStack>
                            <Button variant="primary">Select</Button>
                            <BlockStack>
                                <Text tone="subdued" as="p" variant="bodyMd">100 review requests</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">1 custom question</Text>
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
                            <Button variant="primary">Select</Button>
                            <BlockStack>
                                <Text tone="subdued" as="p" variant="bodyMd">400 review requests</Text>
                                <Text tone="subdued" as="p" variant="bodyMd">3 custom questions</Text>
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
                            <Button variant="primary">Select</Button>
                            <BlockStack>
                                <Text tone="subdued" as="p" variant="bodyMd">750 review requests</Text>
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
                            <Button variant="primary">Select</Button>
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