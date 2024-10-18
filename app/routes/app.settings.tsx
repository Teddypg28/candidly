import { LoaderFunctionArgs } from "@remix-run/node";
import { Banner, BlockStack, Box, Card, Checkbox, ChoiceList, InlineGrid, InlineStack, Label, Page, RangeSlider, Text } from "@shopify/polaris";
import { RangeSliderValue } from "@shopify/polaris/build/ts/src/components/RangeSlider/types";
import { useState } from "react";
import { authenticate } from "~/shopify.server";

import db from '../db.server'
import { useLoaderData } from "@remix-run/react";

export async function loader({request} : LoaderFunctionArgs) {

    const { session } = await authenticate.admin(request)

    const storeExists = await db.appSettings.findFirst({where: {store: {equals: session.shop}}, omit: {id: true, store: true}})

    if (storeExists) {

        return storeExists

    } 

    const newStoreAppSettings = {

        autoPublish: false,
        minRating: 4, 
        requiresVerification: true,
        store: session.shop

    }

    return await db.appSettings.create({data: newStoreAppSettings, omit: {store: true, id: true}})

}

export default function Settings() {

    const settings = useLoaderData<typeof loader>()

    const [publishImmediately, setPublishImmediately] = useState([settings.autoPublish.toString()])
    const [minRating, setMinRating] = useState<RangeSliderValue>(settings.minRating)
    const [isVerificationRequired, setIsVerificationRequired] = useState(settings.requiresVerification)

    return (

        <Page 
        title="App Settings"
        >
            <BlockStack>
                <InlineGrid alignItems="start" columns={{ xs: "1fr", md: "4fr 6fr" }}>
                    <Box>
                        <BlockStack gap='150'>
                            <Text as="h1" variant="headingMd">Review Publishing</Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                                Choose when to publish reviews and whether or not to include customer verification
                            </Text>
                        </BlockStack>
                    </Box>
                    <Card>
                        <BlockStack gap='400'>
                            <Banner tone="info">
                                All unpublished reviews with verified email addresses will be published after 14 days, unless rejected.
                            </Banner>
                            <BlockStack>
                                <ChoiceList 
                                title=''
                                titleHidden
                                onChange={setPublishImmediately}
                                selected={publishImmediately}
                                choices={[
                                    {label: 'Do not automatically publish all new reviews', value: 'false'},
                                    {label: 'Automatically publish all new reviews, as long as certain criteria is met', value: 'true'}
                                ]}
                                />
                            </BlockStack>
                            {publishImmediately[0] === 'true' &&
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
                                            onChange={setMinRating} 
                                            value={minRating}
                                            />
                                        </div>
                                        <Text as="p" variant="bodySm">{minRating} {minRating === 1 ? 'star' : 'stars'}</Text>
                                    </InlineStack>
                                </BlockStack>
                                <Checkbox 
                                onChange={() => setIsVerificationRequired(!isVerificationRequired)} 
                                checked={isVerificationRequired} 
                                label='Reviewer name/email must be verified' 
                                />
                            </BlockStack>}
                        </BlockStack>
                    </Card>
                </InlineGrid>
            </BlockStack>
        </Page>

    )

}