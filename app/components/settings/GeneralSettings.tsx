import { BlockStack, Card, Text, TextField } from "@shopify/polaris"
import { SettingsPageProps } from "~/types/types"

export default function GeneralSettings({state, setState}: SettingsPageProps) {
    return (
        <Card>
            <BlockStack gap={'400'}>
                <Text as="h1" variant="headingSm">General Settings</Text>
                <TextField autoComplete="off" label="Primary Email Address" placeholder="Enter email here" />
            </BlockStack>
        </Card>
    )
}