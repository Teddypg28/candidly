import { BlockStack, Text, Card, TextField, InlineError } from "@shopify/polaris"

import { SettingsPageProps } from "~/types/types"

const isValueInvalid = (value: number) => {

    return value === 0

}

export default function ReviewRequestSettings({state, setState}: SettingsPageProps) {

    const firstEmailErrorFieldId = 'firstEmail';
    const isFirstEmailInvalid = isValueInvalid(state.firstEmailTime);
    const firstEmailErrorMessage = isFirstEmailInvalid ? 'Please enter a value greater than zero' : ''

    const secondEmailErrorFieldId = 'secondEmail';
    const isSecondEmailInvalid = isValueInvalid(state.secondEmailTime);
    const secondEmailErrorMessage = isSecondEmailInvalid ? 'Please enter a value greater than zero' : ''

    return (

    <BlockStack gap='200'>
        <Card>
            <BlockStack gap={'400'}>
                <Text as="h1" variant="headingSm">Review Request Emails</Text>
                <BlockStack gap={'100'}>
                    <TextField 
                    value={state.firstEmailTime.toString()} 
                    type="number" 
                    min={1}
                    onChange={(val) => setState({...state, firstEmailTime: parseInt(val)})} 
                    error={isFirstEmailInvalid}
                    autoComplete="off" 
                    label="First Review Request"
                    suffix="days after the order is fulfilled"
                    />
                    <InlineError message={firstEmailErrorMessage} fieldID={firstEmailErrorFieldId} />
                </BlockStack>
                <BlockStack gap={'100'}>
                    <TextField 
                    value={state.secondEmailTime.toString()} 
                    type="number" 
                    min={1}
                    error={isSecondEmailInvalid}
                    onChange={(val) => setState({...state, secondEmailTime: parseInt(val)})} 
                    autoComplete="off" 
                    label="Second Review Request"
                    suffix="days after the first review request"
                    />
                    <InlineError message={secondEmailErrorMessage} fieldID={secondEmailErrorFieldId} />
                </BlockStack>
            </BlockStack>
        </Card>
    </BlockStack>

    )


}