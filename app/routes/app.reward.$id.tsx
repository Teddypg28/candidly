import { Banner, BlockStack, Button, Card, InlineStack, Layout, Page, Select, Text, Thumbnail } from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import { useState } from "react";
import RewardChoice from "~/components/RewardChoice";
import { Reward as RewardStateReward, RewardState } from "~/types/types";

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { SaveBar } from "@shopify/app-bridge-react";

import db from '../db.server'

export const action = async ({ request, params } : ActionFunctionArgs) => {

    const { session, redirect } = await authenticate.admin(request)

    if (params.id === "new") {

        const payload = await request.json()

        const reward = await db.reward.create({data: {...payload}})

        


    }


}

export const loader = async ({ request, params } : LoaderFunctionArgs) => {

    const {session} = await authenticate.admin(request)

    if (params.id === "new") {

        const perfect = {selectedRewardType: 'none', fixedAmount: 10, percentageAmount: 10, bogoRewardType: "free", bogoPurchaseAmount: 1, bogoReceiveAmount: 1, bogoDiscountAmount: 1, minPurchaseType: 'none', minPurchaseDollarValue: 1, minPurchaseQuantityValue: 1}
        const good = {selectedRewardType: 'none', fixedAmount: 10, percentageAmount: 10, bogoRewardType: "free", bogoPurchaseAmount: 1, bogoReceiveAmount: 1, bogoDiscountAmount: 1, minPurchaseType: 'none', minPurchaseDollarValue: 1, minPurchaseQuantityValue: 1}
        const subpar = {selectedRewardType: 'none', fixedAmount: 10, percentageAmount: 10, bogoRewardType: "free", bogoPurchaseAmount: 1, bogoReceiveAmount: 1, bogoDiscountAmount: 1, minPurchaseType: 'none', minPurchaseDollarValue: 1, minPurchaseQuantityValue: 1}

        return {subpar: {...subpar}, good: {...good}, perfect: {...perfect}}
    }

}

export default function Reward() {

    const data = useLoaderData<typeof loader>()

    const submit = useSubmit()

    const [currentTab, setCurrentTab] = useState('subpar')
    const [rewardState, setRewardState] = useState<RewardState>(data)
    const [cleanRewardState, setCleanRewardState] = useState<RewardState>(data)

    const [selectedProducts, setSelectedProducts] = useState<{type: string, products: any}>({type: 'all', products: []})

    const NaNDetected = Object.keys(rewardState[currentTab as keyof RewardState]).find(key => {

        const keys = ['fixedAmount', 'percentageAmount', 'bogoPurchaseAmount', 'bogoReceiveAmount', 'bogoDiscountAmount']

        if (keys.includes(key) && isNaN(rewardState[currentTab as keyof RewardState][key as keyof RewardStateReward] as number)) {
            return key
        }

    })

    const selectProducts = async () => {

        const products = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
            multiple: true
        })

        if (products) {

            setSelectedProducts({...selectedProducts, products})

        }

    }

    const saveChanges = () => {

        const productIds = selectedProducts.products.map((product: any) => product.id)

        console.log(productIds)

        // submit(JSON.stringify({...rewardState, }))

    }

    return (

        <Page
        title="Review Reward"
        subtitle="Edit or delete this review reward"
        backAction={{url: '/app/rewards'}}
        >
            <SaveBar 
            open={cleanRewardState !== rewardState} 
            >
                <button variant={'primary'} onClick={saveChanges}></button>
                <button onClick={() => setRewardState(cleanRewardState)}></button>
            </SaveBar>
            <Layout>
                <Layout.Section variant="oneHalf">
                    <Card>
                        <BlockStack gap={'200'}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <button 
                                disabled={NaNDetected !== undefined}
                                style={{border: 'none', backgroundColor: currentTab === 'subpar' ? 'rgb(230, 230, 230)' : 'white', cursor: 'pointer', borderRadius: '5px', padding: '5px 8px'}}
                                onClick={() => setCurrentTab('subpar')}
                                >
                                    Subpar Review
                                </button>
                                <button 
                                disabled={NaNDetected !== undefined}
                                style={{border: 'none', backgroundColor: currentTab === 'good' ? 'rgb(230, 230, 230)' : 'white', cursor: 'pointer', borderRadius: '5px', padding: '5px 8px'}}
                                onClick={() => setCurrentTab('good')}
                                >
                                    Good Review
                                </button>
                                <button 
                                disabled={NaNDetected !== undefined}
                                style={{border: 'none', backgroundColor: currentTab === 'perfect' ? 'rgb(230, 230, 230)' : 'white', cursor: 'pointer', borderRadius: '5px', padding: '5px 8px'}}
                                onClick={() => setCurrentTab('perfect')}
                                >
                                    Perfect Review
                                </button>
                            </div>
                            <RewardChoice type={currentTab} state={rewardState} setState={setRewardState} />
                        </BlockStack>
                    </Card>
                </Layout.Section>
                {rewardState[currentTab as keyof RewardState].selectedRewardType !== 'none' && 
                <Layout.Section variant="oneThird">
                    <Card>
                        <BlockStack gap={'300'}>
                            <Text as="h1" fontWeight="bold">Applies To</Text>
                            <Select 
                            label=''
                            value={selectedProducts.type}
                            options={[
                                {label: 'All Products', value: 'all'},
                                {label: 'Specific Products', value: 'specific'}
                            ]}
                             onChange={(value) => setSelectedProducts({...selectedProducts, type: value})}
                            />
                            {selectedProducts.type === 'all' &&
                            
                            <Banner tone="info">If you decide to create another reward for a specific product, that reward will overrule the reward set for "All Products" so that only 1 is given to the customer</Banner>

                            }
                            {selectedProducts.type === 'specific' && 
                            <InlineStack>
                                <Button variant={'primary'} onClick={selectProducts}>{selectedProducts.products.length > 0 ? 'Change Products' : 'Select Products'}</Button>
                            </InlineStack>
                            }
                            {selectedProducts.products.length > 0 && selectedProducts.type === 'specific' && 
                            <BlockStack gap={'200'}>
                                {selectedProducts.products.map((product: any, index: number) => {

                                    const productImage = product.images.length > 0 ? product.images[0].originalSrc : ImageIcon

                                    return (
                                        <>
                                            <InlineStack key={index} gap={'200'} blockAlign="center">
                                                <Thumbnail size="small" alt="product image" source={productImage} />
                                                <BlockStack>
                                                    <Text fontWeight="bold" as="p">{product.title}</Text>
                                                    <Text as="p">Variants: {product.totalVariants === product.variants.length ? 'All' : product.variants.map((variant: any) => {
                                                        return variant.title
                                                    }).join(', ')}
                                                    </Text>
                                                </BlockStack>
                                            </InlineStack>
                                            {index !== selectedProducts.products.length - 1 && <hr style={{width: '100%', backgroundColor: 'lightgray', height: '0.5px', border: 'none'}} />}
                                        </>
                                    )
                                })}
                            </BlockStack>
                            }
                        </BlockStack>
                    </Card>
                </Layout.Section>
            }
            </Layout>
        </Page>

    )

}