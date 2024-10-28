import { Card, BlockStack, Banner, ChoiceList, RangeSlider, Text, InlineStack, Label } from "@shopify/polaris"

import { SettingsPageProps } from "~/types/types"

export default function ReviewModeration({state, setState}: SettingsPageProps) {

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
                        onChange={(selected) => setState({...state, publishImmediately: selected})}
                        selected={state.publishImmediately}
                        choices={[
                            {label: 'Do not automatically publish all new reviews', value: 'false'},
                            {label: 'Automatically publish all new reviews, as long as certain criteria is met', value: 'true'}
                        ]}
                        />
                    </BlockStack>
                    {state.publishImmediately[0] === 'true' &&
                        <BlockStack gap='300'>
                        <Text as="h1" variant="bodyLg" fontWeight="bold">Criteria</Text>
                        <BlockStack gap='100'>
                            <Label id="ratingSlider">Minimum Rating</Label>
                            <InlineStack gap='200'>
                                <div style={{flex: 1}}>
                                    <RangeSlider 
                                    id="ratingSlider"
                                    min={1} 
                                    max={5} 
                                    label='' 
                                    labelHidden
                                    onChange={(value) => setState({...state, minRating: parseInt(value.toString())})} 
                                    value={state.minRating}
                                    />
                                </div>
                                <Text as="p" variant="bodySm">{state.minRating} {state.minRating === 1 ? 'star' : 'stars'}</Text>
                            </InlineStack>
                        </BlockStack>
                    </BlockStack>}
                </BlockStack>
            </Card>
        </>

    )

}