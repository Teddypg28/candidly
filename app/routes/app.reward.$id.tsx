import { Banner, BlockStack, Card, Layout, List, Page, Select, Text, TextField } from "@shopify/polaris";
import { useState } from "react";
import RewardChoice from "~/components/RewardChoice";

export default function Reward() {

    const [currentTab, setCurrentTab] = useState('subpar')

    const [rewardState, setRewardState] = useState({
        subpar: {
            selectedRewardType: 'none',
            dollarAmount: 1,
            percentageAmount: 1,
            purchaseAmount: 1,
            freeAmount: 1,
        },
        good: {
            selectedRewardType: 'dollar',
            dollarAmount: 10,
            percentageAmount: 5,
            purchaseAmount: 1,
            freeAmount: 1,
        },
        perfect: {
            selectedRewardType: 'bogo',
            dollarAmount: 20,
            percentageAmount: 10,
            purchaseAmount: 1,
            freeAmount: 2,
        }
    })

    return (

        <Page
        title="Review Reward"
        subtitle="Edit or delete this review reward"
        backAction={{url: '/app/rewards'}}
        >
            <Layout>
                <Layout.Section variant="oneHalf">
                    <Card>
                        <BlockStack gap={'200'}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <div 
                                style={{backgroundColor: currentTab === 'subpar' ? 'rgb(230, 230, 230)' : 'white', cursor: 'pointer', borderRadius: '5px', padding: '3px 6px'}}
                                onClick={() => setCurrentTab('subpar')}
                                >
                                    Subpar Review
                                </div>
                                <div 
                                style={{backgroundColor: currentTab === 'good' ? 'rgb(230, 230, 230)' : 'white', cursor: 'pointer', borderRadius: '5px', padding: '3px 6px'}}
                                onClick={() => setCurrentTab('good')}
                                >
                                    Good Review
                                </div>
                                <div 
                                style={{backgroundColor: currentTab === 'perfect' ? 'rgb(230, 230, 230)' : 'white', cursor: 'pointer', borderRadius: '5px', padding: '3px 6px'}}
                                onClick={() => setCurrentTab('perfect')}
                                >
                                    Perfect Review
                                </div>
                            </div>
                            <RewardChoice type={currentTab} state={rewardState} setState={setRewardState} />
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneThird">
                    <Card>
                        <Text as="h1">Product Details</Text>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>

    )

}