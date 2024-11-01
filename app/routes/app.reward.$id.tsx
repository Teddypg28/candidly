import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
import { useState } from "react";
import RewardChoice from "~/components/RewardChoice";
import { Reward as RewardStateReward, RewardState } from "~/types/types";

export default function Reward() {

    const [currentTab, setCurrentTab] = useState('subpar')

    const [rewardState, setRewardState] = useState<RewardState>({
        subpar: {
            selectedRewardType: 'none',
            fixedAmount: 1,
            percentageAmount: 1,
            bogoRewardType: 'free',
            bogoPurchaseAmount: 1,
            bogoReceiveAmount: 1,
            bogoDiscountAmount: 1,
            minPurchaseRequirements: {
                type: 'none'
            }
        },
        good: {
            selectedRewardType: 'fixed',
            fixedAmount: 10,
            percentageAmount: 5,
            bogoRewardType: 'free',
            bogoPurchaseAmount: 1,
            bogoReceiveAmount: 1,
            bogoDiscountAmount: 1,
            minPurchaseRequirements: {
                type: 'none'
            }
        },
        perfect: {
            selectedRewardType: 'bogo',
            fixedAmount: 20,
            percentageAmount: 10,
            bogoRewardType: 'free',
            bogoPurchaseAmount: 1,
            bogoReceiveAmount: 1,
            bogoDiscountAmount: 1,
            minPurchaseRequirements: {
                type: 'none'
            }
        }
    })

    const NaNDetected = Object.keys(rewardState[currentTab as keyof RewardState]).find(key => {

        const keys = ['fixedAmount', 'percentageAmount', 'bogoPurchaseAmount', 'bogoReceiveAmount', 'bogoDiscountAmount']

        if (keys.includes(key) && isNaN(rewardState[currentTab as keyof RewardState][key as keyof RewardStateReward] as number)) {
            return key
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
                                <button 
                                disabled={NaNDetected !== undefined}
                                style={{border: 'none', backgroundColor: currentTab === 'subpar' ? 'rgb(230, 230, 230)' : 'white', cursor: 'pointer', borderRadius: '5px', padding: '4px 6px'}}
                                onClick={() => setCurrentTab('subpar')}
                                >
                                    Subpar Review
                                </button>
                                <button 
                                disabled={NaNDetected !== undefined}
                                style={{border: 'none', backgroundColor: currentTab === 'good' ? 'rgb(230, 230, 230)' : 'white', cursor: 'pointer', borderRadius: '5px', padding: '4px 6px'}}
                                onClick={() => setCurrentTab('good')}
                                >
                                    Good Review
                                </button>
                                <button 
                                disabled={NaNDetected !== undefined}
                                style={{border: 'none', backgroundColor: currentTab === 'perfect' ? 'rgb(230, 230, 230)' : 'white', cursor: 'pointer', borderRadius: '5px', padding: '4px 6px'}}
                                onClick={() => setCurrentTab('perfect')}
                                >
                                    Perfect Review
                                </button>
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