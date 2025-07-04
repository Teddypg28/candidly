import { BlockStack, Button, Card, InlineStack, Page, Text, TextField, Tooltip } from "@shopify/polaris";

export default function Rewards() {
    return (

        <Page 
        title="Review Rewards" 
        subtitle="Configure rewards to incentivize your customers to leave better reviews"
        >
            <BlockStack gap={'300'}>
                <Card>
                    <BlockStack gap={'200'}>
                        <Text as="h1" variant="headingMd" tone="success" fontWeight="bold">
                            Perfect Review
                        </Text>
                        <Text as="p" variant="bodyXs">
                            Consists of a headline with at least 5 words, a body with at least
                            40 words, and at least 1 photo or video.
                        </Text>
                        <InlineStack gap={'300'} blockAlign="center">
                            <TextField 
                            type="number" 
                            label="" 
                            autoComplete="off" 
                            suffix="% Off"
                            />
                            <InlineStack>
                                <Tooltip content="Disabling the reward means nothing will be rewarded to the customer for this type of review">
                                    <Button variant="plain" tone="critical">Disable Reward</Button>
                                </Tooltip>
                            </InlineStack>
                        </InlineStack>
                    </BlockStack>
                </Card>
                <Card>
                    <BlockStack gap={'200'}>
                        <Text as="h1" tone="subdued" variant="headingMd" fontWeight="bold">
                            Average Review
                        </Text>
                        <Text as="p" variant="bodyXs">
                            Consists of a headline with at least 5 words, a body with at least
                            20 words, and at least 1 photo or video.
                        </Text>
                        <InlineStack gap={'300'} blockAlign="center">
                            <TextField 
                            type="number" 
                            label="" 
                            autoComplete="off" 
                            suffix="% Off"
                            />
                            <InlineStack>
                                <Tooltip content="Disabling the reward means nothing will be rewarded to the customer for this type of review">
                                    <Button variant="plain" tone="critical">Disable Reward</Button>
                                </Tooltip>
                            </InlineStack>
                        </InlineStack>
                    </BlockStack>
                </Card>
                <Card>
                    <BlockStack gap={'200'}>
                        <Text as="h1" tone="critical" variant="headingMd" fontWeight="bold">
                            Bad Review
                        </Text>
                        <Text as="p" variant="bodyXs">
                            Consists of a headline with a maximum of 3 words, a body with a maximum of
                            10 words, and no photos or videos.
                        </Text>
                        <InlineStack gap={'300'} blockAlign="center">
                            <TextField 
                            type="number" 
                            label="" 
                            autoComplete="off" 
                            suffix="% Off"
                            />
                            <InlineStack>
                                <Tooltip content="Disabling the reward means nothing will be rewarded to the customer for this type of review">
                                    <Button variant="plain" tone="critical">Disable Reward</Button>
                                </Tooltip>
                            </InlineStack>
                        </InlineStack>
                    </BlockStack>
                </Card>
            </BlockStack>
        </Page>

    )
}