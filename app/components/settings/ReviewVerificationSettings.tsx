import { Card, BlockStack, Banner, ChoiceList, Text, TextField } from "@shopify/polaris"

import { SettingsPageProps } from "~/types/types"

export default function ReviewVerificationSettings({state, setState}: SettingsPageProps) {
    return (
        <>
            <Card>
                <BlockStack gap='400'>
                    <Text as="h1" variant="headingSm">Review Verification</Text>
                    <Banner tone="warning">
                        All unpublished reviews will be published after 14 days, unless rejected
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
                            autoComplete="off"
                            label="Minimum Stars"
                            suffix="stars"
                            onChange={(value) => setState({...state, minReviewRating: parseInt(value)})}
                            value={state.minReviewRating.toString()}
                            />
                        </BlockStack>
                    </BlockStack>}
                    <BlockStack gap='300'>
                        <Text as="h1" variant="bodyLg" fontWeight="bold">Disable Review Form on Product Page</Text>
                        <ChoiceList 
                        title=''
                        titleHidden
                        onChange={(selected) => setState({...state, isReviewFormDisabled: selected.toString()})}
                        selected={[state.isReviewFormDisabled]}
                        choices={[
                            {label: 'True', value: 'true'},
                            {label: 'False', value: 'false'}
                        ]}
                        />
                    </BlockStack>
                </BlockStack>
            </Card>
        </>

    )

}