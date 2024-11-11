import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";

export default function EmailTemplate() {

    return (

        <Page>
            <Layout>
                <Layout.Section variant="oneThird">
                    <Card>

                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneHalf">
                    <Card>
                        <h2 style={{fontWeight: 'bold'}}>Email Preview</h2>
                        <BlockStack gap='300'>
                            <div style={{backgroundColor: 'black', height:'70px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <div style={{color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    [Logo Here]
                                </div>
                            </div>
                            <BlockStack gap={'300'}>
                                <Text alignment="center" variant="headingLg" as="p">Hey [name],</Text>
                                <Text alignment="center" variant="headingXl" as="p">So...What do you think?</Text>
                            </BlockStack>
                            <Text as="p" variant="bodyLg" alignment="center">
                                We hope you’re enjoying the [product name]! We’d love to hear your thoughts—your feedback helps us improve and helps others make confident decisions. 
                                <br />
                                <br />
                                As a thank-you, we’re offering a reward of up to [max reward] if you fill out this review form. It only takes a minute, and it means a lot to us!
                                <br />
                                <br />
                                [Link to review form]
                                <br />
                                <br />
                                Thank you for your support!
                            </Text>
                            <hr style={{width: '100%'}} />
                            <h2 style={{fontWeight: 'bold', fontSize: '18px'}}>Top Picks for You</h2>
                            <div style={{display: 'flex', alignItems: 'center', gap: '60px'}}>
                                <div style={{border: '2px solid lightgray', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Product #1</div>
                                <div style={{border: '2px solid lightgray', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Product #2</div>
                                <div style={{border: '2px solid lightgray', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Product #3</div>
                            </div>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>

    )

}