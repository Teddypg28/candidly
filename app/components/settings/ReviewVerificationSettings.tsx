import { Card, BlockStack, Banner, ChoiceList, Text, TextField, InlineError } from "@shopify/polaris"

import { SettingsPageProps } from "~/types/types"

const isValueInvalid = (value: number) => {

    return value < 1 || value > 5

}

export default function ReviewVerificationSettings({state, setState}: SettingsPageProps) {

    const isRatingInvalid = isValueInvalid(state.minReviewRating)
    const errorMessage = isRatingInvalid ? 'Please enter a number from 1 to 5' : ''

    return (

        <>
            <Card>
                <BlockStack gap='400'>
                    <Banner tone="warning">
                        All unpublished reviews will be published after 14 days, unless rejected.
                    </Banner>
                    <BlockStack>
                        <ChoiceList 
                        title=''
                        titleHidden
                        onChange={(selected) => setState({...state, autoPublishReviews: selected})}
                        selected={state.autoPublishReviews}
                        choices={[
                            {label: 'Do not automatically publish all new reviews', value: 'false'},
                            {label: 'Automatically publish all new reviews, as long as certain criteria is met', value: 'true'}
                        ]}
                        />
                    </BlockStack>
                    {state.autoPublishReviews[0] === 'true' &&
                    <BlockStack gap='300'>
                        <Text as="h1" variant="bodyLg" fontWeight="bold">Criteria</Text>
                        <BlockStack gap={'100'}>
                            <TextField 
                            id="minRatingField"
                            type="number"
                            max={5}
                            min={1}
                            error={isRatingInvalid}
                            autoComplete="off"
                            label="Minimum Stars"
                            suffix="stars"
                            onChange={(value) => setState({...state, minReviewRating: parseInt(value)})}
                            value={state.minReviewRating.toString()}
                            />
                            <InlineError 
                            message={errorMessage}
                            fieldID="minRatingField"
                            />
                        </BlockStack>
                    </BlockStack>}
                </BlockStack>
            </Card>
        </>

    )

}