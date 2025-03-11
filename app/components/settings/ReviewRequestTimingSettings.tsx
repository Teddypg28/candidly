import { BlockStack, Text, Card, TextField } from "@shopify/polaris"

import { SettingsPageProps } from "~/types/types"

export default function ReviewRequestTimingSettings({state, setState}: SettingsPageProps) {

    return (

    <BlockStack gap='200'>
        <Card>
            <BlockStack gap={'400'}>
                <Text as="h1" variant="headingSm">Review Request Timing</Text>
                <BlockStack gap={'100'}>
                    <TextField 
                    id="firstEmail"
                    value={state.firstReviewRequest.toString()} 
                    type="number" 
                    min={1}
                    onChange={(val) => setState({...state, firstReviewRequest: parseInt(val) <= 0 || val.trim() === "" ? 1 : parseInt(val)})} 
                    autoComplete="off" 
                    label="First Review Request"
                    suffix="days after the order is fulfilled"
                    />
                </BlockStack>
                <BlockStack gap={'100'}>
                    <TextField 
                    id="secondEmail"
                    value={state.secondReviewRequest.toString()} 
                    type="number" 
                    min={1}
                    onChange={(val) => setState({...state, secondReviewRequest: parseInt(val) <= 0 || val.trim() === "" ? 1 : parseInt(val)})} 
                    autoComplete="off" 
                    label="Second Review Request"
                    suffix="days after the first review request"
                    />
                </BlockStack>
            </BlockStack>
        </Card>
    </BlockStack>

    )


}