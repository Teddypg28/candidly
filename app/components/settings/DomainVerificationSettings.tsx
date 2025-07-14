import { Card, BlockStack, Text, TextField, InlineStack } from "@shopify/polaris"

import { DNSRecord, SettingsPageProps } from "~/types/types"

interface DomainVerificationSettingsProps extends SettingsPageProps {
    records: DNSRecord[];
    verificationStatus: String
}

export default function DomainVerificationSettings({state, setState, records, verificationStatus}: DomainVerificationSettingsProps) {

    return (
        <>
            <Card>
                <BlockStack gap={'400'}>
                    <BlockStack gap={'500'}>
                        <BlockStack gap={'050'}>
                            <Text as="h1" variant="headingSm">Domain Verification</Text>
                            <Text as="p" variant="bodyMd">
                                Verifying your domain means customers will receive notifications that come from your domain instead of ours, thus establishing better branding and trust
                            </Text>
                        </BlockStack>
                        <BlockStack gap={'500'}>
                            <BlockStack gap={'300'}>
                                <BlockStack gap="050">
                                    <Text as="h1" variant="headingMd">
                                        Step 1: Enter your domain name
                                    </Text>
                                    <Text as="p" variant="bodySm">Ex: mystore.com</Text>
                                </BlockStack>
                                <InlineStack>
                                    <TextField 
                                    autoComplete="off" 
                                    placeholder="Domain Name" 
                                    label="" 
                                    value={state.domain}
                                    onChange={(domainVal) => setState(prevState => {return {...prevState, domain: domainVal}})}
                                    />
                                </InlineStack>
                            </BlockStack>
                            {records.length > 0 && 
                            <>
                                <BlockStack gap={'200'}>
                                    <Text as="h1" variant="headingMd">
                                        Step 2: Configure these records in your domain's DNS settings
                                    </Text>
                                    <Card>
                                        <BlockStack gap='500'>
                                            {records?.map(record => {
                                            return (
                                                <BlockStack gap='200'>
                                                    <Text as="h1" variant="headingMd">{record.Type}</Text>
                                                    <BlockStack>
                                                        <Text as="p" variant="bodySm"><strong>Name: </strong>{record.Name}</Text>
                                                        <Text as="p" variant="bodySm"><strong>Value: </strong>{record.Value}</Text>
                                                    </BlockStack>
                                                </BlockStack>
                                            )
                                            })}
                                        </BlockStack>
                                    </Card>
                                </BlockStack>
                                <BlockStack gap={'200'}>
                                    <Text as="h1" variant="headingMd">
                                        Verification Status: <span style={{color: verificationStatus === "Success" ? "green" : verificationStatus === "Failed" ? "danger" : "#ad7b1c"}}>{verificationStatus}</span>
                                    </Text>
                                    {verificationStatus !== "Success" &&
                                    <Text as="p" variant="bodySm">
                                        Need help? Send us an email at support@trycandidly.app
                                    </Text>
                                    }
                                </BlockStack>
                            </>
                            }
                        </BlockStack>
                    </BlockStack>
                </BlockStack>
            </Card>
        </>

    )

}