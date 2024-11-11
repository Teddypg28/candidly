import { BlockStack, Text, Card, TextField, InlineError } from "@shopify/polaris"

import { SettingsPageProps } from "~/types/types"

const isValueInvalid = (value: number) => {

    return value === 0

}

export default function ReviewRequestTimingSettings({state, setState}: SettingsPageProps) {

    const isFirstEmailInvalid = isValueInvalid(state.firstReviewRequest);
    const firstEmailErrorMessage = isFirstEmailInvalid ? 'Please enter a value greater than zero' : ''

    const isSecondEmailInvalid = isValueInvalid(state.secondReviewRequest);
    const secondEmailErrorMessage = isSecondEmailInvalid ? 'Please enter a value greater than zero' : ''

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
                    onChange={(val) => setState({...state, firstReviewRequest: parseInt(val)})} 
                    error={isFirstEmailInvalid}
                    autoComplete="off" 
                    label="First Review Request"
                    suffix="days after the order is fulfilled"
                    />
                    <InlineError message={firstEmailErrorMessage} fieldID="firstEmail" />
                </BlockStack>
                <BlockStack gap={'100'}>
                    <TextField 
                    id="secondEmail"
                    value={state.secondReviewRequest.toString()} 
                    type="number" 
                    min={1}
                    error={isSecondEmailInvalid}
                    onChange={(val) => setState({...state, secondReviewRequest: parseInt(val)})} 
                    autoComplete="off" 
                    label="Second Review Request"
                    suffix="days after the first review request"
                    />
                    <InlineError message={secondEmailErrorMessage} fieldID="secondEmail" />
                </BlockStack>
            </BlockStack>
        </Card>
    </BlockStack>

    )


}