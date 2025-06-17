import { BlockStack, Button, Card, InlineStack, Layout, Page, Text, Thumbnail } from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import { useState } from "react";
import RewardChoice from "~/components/RewardChoice";
import { Reward as RewardStateReward, RewardState, initialRewardState, SelectedProduct_Reward, ExcludedProduct } from "~/types/types";
import { Reward as RewardShape } from "@prisma/client";

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { SaveBar } from "@shopify/app-bridge-react";

import db from '../db.server'
import fetchSelectedProductData from "~/helpers/rewards/fetchSelectedProductData";

export const action = async ({ request } : ActionFunctionArgs) => {

    const { session } = await authenticate.admin(request)

    const payload = await request.json()

    const currentReward = await db.reward.findFirst({where: {store: {equals: session.shop}}}) as RewardShape

    await Promise.all(['subpar', 'good', 'perfect'].map(async (reviewType) => {
        // grab the excluded products (if any) from request data
        const excludedProducts = payload[reviewType].excludedProducts as ExcludedProduct[]
        delete payload[reviewType]['excludedProducts']
        // update reward setting
        const updatedRewardSetting = await db.rewardSetting.update({where: {id: currentReward[`${reviewType}Id` as keyof typeof Reward]}, data: {...payload[reviewType]}})
        // delete db records of excluded products that are no longer in the updated data
        const currentDbRecords = await db.excludedProduct.findMany({where: {rewardSettingId: {equals: updatedRewardSetting.id}}})
        // updated data showing just the ids of the products
        let updatedExcludedProductIds = excludedProducts.map(product => product.productId)
        await Promise.all(currentDbRecords.map(async (currentDbRecord) => {
            // if product id of excluded product from db not in updated excluded product ids, delete it from db
            if (!updatedExcludedProductIds.includes(currentDbRecord.productId)) {
                await db.excludedProduct.delete({where: {id: currentDbRecord.id}})
            }
            updatedExcludedProductIds = updatedExcludedProductIds.filter(productId => productId !== currentDbRecord.productId)
        }))
        // the remaining product ids need to be created 
        await Promise.all(updatedExcludedProductIds.map(async (productId) => {
            const data = excludedProducts.find(product => product.productId === productId) as ExcludedProduct
            await db.excludedProduct.create({data: {...data, rewardSettingId: updatedRewardSetting.id}})
        }))
    }))
    
    return true
}

export const loader = async ({ request } : LoaderFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request)

    // fetch rewardSettings for store
    const rewardSettings = await db.reward.findFirst({where: {store: {equals: session.shop}}, 
        include: 
            {
                subpar: {include: {excludedProducts: {select: {productId: true}}}}, 
                good: {include: {excludedProducts: {select: {productId: true}}}},
                perfect: {include: {excludedProducts: {select: {productId: true}}}}
            },
        omit: {
                subparId: true,
                goodId: true, 
                perfectId: true, 
                store: true,
                id: true
            }
        })

    // if rewardSettings exist already, return them
    if (rewardSettings) {
        const selectedProducts = await fetchSelectedProductData(rewardSettings, admin)
        return {rewardSettings, selectedProducts}
    }

    // initialize them in the db with default values
    const perfect = initialRewardState
    const good = initialRewardState
    const subpar = initialRewardState

    const initializedRewardSettings = await db.reward.create({data: 
        {
            store: session.shop, 
            subpar: {create: {...subpar, excludedProducts: {create: subpar.excludedProducts}}}, 
            good: {create: {...good, excludedProducts: {create: good.excludedProducts}}}, 
            perfect: {create: {...perfect, excludedProducts: {create: perfect.excludedProducts}}}
        },
        include: {
            subpar: {include: {excludedProducts: {select: {productId: true}}}},
            good: {include: {excludedProducts: {select: {productId: true}}}},
            perfect: {include: {excludedProducts: {select: {productId: true}}}}
        },
        omit: {
            subparId: true,
            goodId: true, 
            perfectId: true, 
            store: true,
            id: true
        }   
    })  
    return {rewardSettings: initializedRewardSettings, selectedProducts: {subpar: [], good: [], perfect: []}}
}

export default function Reward() {

    const data = useLoaderData<typeof loader>()

    const submit = useSubmit()

    const [currentTab, setCurrentTab] = useState('subpar')
    const [rewardState, setRewardState] = useState<RewardState>(data.rewardSettings)
    const cleanRewardState = data.rewardSettings

    const isStateDirty = JSON.stringify(rewardState) !== JSON.stringify(cleanRewardState)

    const [selectedProducts, setSelectedProducts] = useState<{
        subpar: SelectedProduct_Reward[];
        good: SelectedProduct_Reward[];
        perfect: SelectedProduct_Reward[];
    }>(data.selectedProducts)

    const [cleanSelectedProducts, setCleanSelectedProducts] = useState<{
        subpar: SelectedProduct_Reward[];
        good: SelectedProduct_Reward[];
        perfect: SelectedProduct_Reward[];
    }>(data.selectedProducts)

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
            setSelectedProducts({...selectedProducts, [currentTab]: products})
            const excludedProductData = products.map(product => {
                return {
                    productId: product.id, 
                    variantIds: product.variants.map(variant => variant.id)
                }
            })
            setRewardState({...rewardState, [currentTab]: {...rewardState[currentTab as keyof typeof rewardState], excludedProducts: excludedProductData}})
        }
    }

    const saveChanges = () => {
        submit(JSON.stringify(rewardState), {method: 'POST', encType: 'application/json'})
    }

    const removeExcludedProduct = (productId: string) => {
        const updatedSelectedProducts = selectedProducts[currentTab as keyof typeof selectedProducts].filter((product: any) => product.id !== productId)
        const updatedRewardState = rewardState[currentTab as keyof typeof rewardState].excludedProducts.filter((product: any) => product.productId !== productId)

        setSelectedProducts({...selectedProducts, [currentTab]: updatedSelectedProducts})
        setRewardState({...rewardState, [currentTab]: {...rewardState[currentTab as keyof typeof rewardState], excludedProducts: updatedRewardState}})
    }

    return (

        <Page
        title="Review Rewards"
        subtitle="Create reward tiers to incentivize customers to write awesome reviews for your products"
        >
            <SaveBar 
            open={isStateDirty} 
            >
                <button variant={'primary'} onClick={saveChanges}></button>
                <button onClick={() => { setRewardState(cleanRewardState); setSelectedProducts(cleanSelectedProducts)}}></button>
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
                            <BlockStack gap={'150'}>
                                <Text as="h1" fontWeight="bold">Exclude Products</Text>
                                <Text as="p">
                                    For any products that you choose to exclude, customers will not be able to use the reward when purchasing it.
                                </Text>
                            </BlockStack>
                            <InlineStack>
                                <Button variant={'primary'} onClick={selectProducts}>Select Products</Button>
                            </InlineStack>
                            
                            {selectedProducts[currentTab as keyof typeof selectedProducts].length > 0 && 
                            <BlockStack gap={'200'}>
                                {selectedProducts[currentTab as keyof typeof selectedProducts].map((product: any, index: number) => {

                                    const productImage = product.images.length > 0 ? product.images[0].originalSrc : ImageIcon

                                    return (
                                        <>
                                            <InlineStack key={index} gap={'200'} blockAlign="center">
                                                <Thumbnail size="large" alt="product image" source={productImage} />
                                                <BlockStack>
                                                    <Text fontWeight="bold" as="p">{product.title}</Text>
                                                    <InlineStack gap={'200'}>
                                                        <Text as="p">Variants: {product.totalVariants === product.variants.length ? 'All' : product.variants.map((variant: any) => {
                                                            return variant.title
                                                        }).join(', ')}
                                                        </Text>
                                                        <Button onClick={() => removeExcludedProduct(product.id)} variant="primary" tone="critical">Remove Product</Button>
                                                    </InlineStack>
                                                </BlockStack>
                                            </InlineStack>
                                            {index !== selectedProducts[currentTab as keyof typeof selectedProducts].length - 1 && <hr style={{width: '100%', backgroundColor: 'lightgray', height: '0.5px', border: 'none'}} />}
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