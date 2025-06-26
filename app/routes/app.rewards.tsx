import { BlockStack, Button, Card, InlineStack, Layout, Page, Select, Text, Thumbnail } from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import { useState } from "react";
import RewardChoice from "~/components/RewardChoice";
import { Reward as RewardStateReward, RewardState, initialRewardState, SelectedProduct_Reward, EligibleProduct, SelectedCollection_Reward } from "~/types/types";
import { Reward as RewardShape } from "@prisma/client";

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { SaveBar } from "@shopify/app-bridge-react";

import db from '../db.server'
import fetchSelectedProductData from "~/helpers/rewards/fetchSelectedProductData";
import fetchSelectedCollectionData from "~/helpers/rewards/fetchSelectedCollectionData";

export const action = async ({ request } : ActionFunctionArgs) => {

    const { session } = await authenticate.admin(request)

    const payload = await request.json()

    const currentReward = await db.reward.findFirst({where: {store: {equals: session.shop}}}) as RewardShape

    await Promise.all(['subpar', 'good', 'perfect'].map(async (reviewType) => {
        // grab the eligible products (if any) from request data
        const eligibleProducts = payload[reviewType].eligibleProducts as EligibleProduct[]
        delete payload[reviewType]['eligibleProducts']
        // update reward setting
        const updatedRewardSetting = await db.rewardSetting.update({where: {id: currentReward[`${reviewType}Id` as keyof typeof Reward]}, data: {...payload[reviewType]}})
        // delete db records of eligible products that are no longer in the updated data
        const currentDbRecords = await db.eligibleProduct.findMany({where: {rewardSettingId: {equals: updatedRewardSetting.id}}})
        // updated data showing just the ids of the products
        let updatedEligibleProductIds = eligibleProducts.map(product => product.productId)
        await Promise.all(currentDbRecords.map(async (currentDbRecord) => {
            // if product id of eligible product from db not in updated eligible product ids, delete it from db
            if (!updatedEligibleProductIds.includes(currentDbRecord.productId)) {
                await db.eligibleProduct.delete({where: {id: currentDbRecord.id}})
            }
            updatedEligibleProductIds = updatedEligibleProductIds.filter(productId => productId !== currentDbRecord.productId)
        }))
        // the remaining product ids need to be created 
        await Promise.all(updatedEligibleProductIds.map(async (productId) => {
            const data = eligibleProducts.find(product => product.productId === productId) as EligibleProduct
            await db.eligibleProduct.create({data: {...data, rewardSettingId: updatedRewardSetting.id}})
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
                subpar: {include: {eligibleProducts: {select: {productId: true}}, eligibleCollections: {select: {collectionId: true}}}},
                good: {include: {eligibleProducts: {select: {productId: true}}, eligibleCollections: {select: {collectionId: true}}}},
                perfect: {include: {eligibleProducts: {select: {productId: true}}, eligibleCollections: {select: {collectionId: true}}}}
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
        const selectedCollections = await fetchSelectedCollectionData(rewardSettings, admin)
        return {rewardSettings, selectedProductsCollections: { products: selectedProducts, collections: selectedCollections }}
    }

    // initialize them in the db with default values
    const perfect = initialRewardState
    const good = initialRewardState
    const subpar = initialRewardState

    const initializedRewardSettings = await db.reward.create({data: 
        {
            store: session.shop, 
            subpar: {create: {...subpar, eligibleProducts: {create: subpar.eligibleProducts}, eligibleCollections: {create: subpar.eligibleCollections}}}, 
            good: {create: {...good, eligibleProducts: {create: good.eligibleProducts}, eligibleCollections: {create: good.eligibleCollections}}}, 
            perfect: {create: {...perfect, eligibleProducts: {create: perfect.eligibleProducts}, eligibleCollections: {create: perfect.eligibleCollections}}}
        },
        include: {
            subpar: {include: {eligibleProducts: {select: {productId: true}}, eligibleCollections: {select: {collectionId: true}}}},
            good: {include: {eligibleProducts: {select: {productId: true}}, eligibleCollections: {select: {collectionId: true}}}},
            perfect: {include: {eligibleProducts: {select: {productId: true}}, eligibleCollections: {select: {collectionId: true}}}}
        },
        omit: {
            subparId: true,
            goodId: true, 
            perfectId: true, 
            store: true,
            id: true
        }   
    })  
    return {rewardSettings: initializedRewardSettings, selectedProductsCollections: {products: {subpar: [], good: [], perfect: []}, collections: {subpar: [], good: [], perfect: []}}}
}

export default function Reward() {

    const data = useLoaderData<typeof loader>()

    const submit = useSubmit()

    const [currentTab, setCurrentTab] = useState('subpar')
    const [rewardState, setRewardState] = useState<RewardState>(data.rewardSettings)
    const cleanRewardState = data.rewardSettings

    const isStateDirty = JSON.stringify(rewardState) !== JSON.stringify(cleanRewardState)

    const [selectedProductsCollections, setSelectedProductsCollections] = useState<{
        products: {
            subpar: SelectedProduct_Reward[];
            good: SelectedProduct_Reward[];
            perfect: SelectedProduct_Reward[];
        },
        collections: {
            subpar: SelectedCollection_Reward[];
            good: SelectedCollection_Reward[];
            perfect: SelectedCollection_Reward[];
        }
    }>(data.selectedProductsCollections)
    const cleanSelectedProductsCollections = data.selectedProductsCollections

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
            setSelectedProductsCollections({...selectedProductsCollections, products: {...selectedProductsCollections["products"], [currentTab]: products}})
            const eligibleProductData = products.map(product => {
                return {
                    productId: product.id, 
                    variantIds: product.variants.map(variant => variant.id)
                }
            })
            setRewardState({...rewardState, [currentTab]: {...rewardState[currentTab as keyof typeof rewardState], eligibleProducts: eligibleProductData}})
        }
    }

    const selectCollections = async () => {
        const collections = await window.shopify.resourcePicker({
            type: 'collection',
            action: 'select',
            multiple: true
        })

        if (collections) {
            setSelectedProductsCollections({...selectedProductsCollections, collections: {...selectedProductsCollections["collections"], [currentTab]: collections}})
            const eligibleCollectionData = collections.map(collection => {
                return {
                    collectionId: collection.id, 
                }
            })
            setRewardState({...rewardState, [currentTab]: {...rewardState[currentTab as keyof typeof rewardState], eligibleCollections: eligibleCollectionData}})
        }
    }

    const saveChanges = () => {
        submit(JSON.stringify(rewardState), {method: 'POST', encType: 'application/json'})
    }

    const removeEligibleProduct = (productId: string) => {
        const updatedSelectedProducts = selectedProductsCollections["products"][currentTab as keyof typeof selectedProductsCollections["products"]].filter((product: any) => product.id !== productId)
        const updatedRewardState = rewardState[currentTab as keyof typeof rewardState].eligibleProducts.filter((product: any) => product.productId !== productId)

        setSelectedProductsCollections({...selectedProductsCollections, collections: {...selectedProductsCollections["collections"], [currentTab]: updatedSelectedProducts}})
        setRewardState({...rewardState, [currentTab]: {...rewardState[currentTab as keyof typeof rewardState], eligibleProducts: updatedRewardState}})
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
                <button onClick={() => { setRewardState(cleanRewardState); setSelectedProductsCollections(cleanSelectedProductsCollections)}}></button>
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
                                <Text as="h1" fontWeight="bold">Product & Collection Configuration</Text>
                                <Text as="p">
                                    Select specific products or collections for which this reward will be configured.
                                </Text>
                                <Select
                                label=''
                                options={[
                                    {label: 'Products', value: 'products'},
                                    {label: 'Collections', value: 'collections'},
                                    {label: 'All', value: 'all'}
                                ]}
                                />
                            </BlockStack>
                            <InlineStack>
                                {
                                    rewardState[currentTab as keyof RewardState].productCollectionConfiguration === "products" ?
                                    <Button variant={'primary'} onClick={selectProducts}>Select Products</Button> :
                                    rewardState[currentTab as keyof RewardState].productCollectionConfiguration === "collections" ? 
                                    <Button variant={'primary'} onClick={selectCollections}>Select Collections</Button> : ""
                                }

                            </InlineStack>
                            
                            {selectedProductsCollections["products"][currentTab as keyof typeof selectedProductsCollections["products"]].length > 0 && 
                            <BlockStack gap={'200'}>
                                {selectedProductsCollections["products"][currentTab as keyof typeof selectedProductsCollections["products"]].map((product: any, index: number) => {

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
                                                        <Button onClick={() => removeEligibleProduct(product.id)} variant="primary" tone="critical">Remove Product</Button>
                                                    </InlineStack>
                                                </BlockStack>
                                            </InlineStack>
                                            {index !== selectedProductsCollections["products"][currentTab as keyof typeof selectedProductsCollections["products"]].length - 1 && <hr style={{width: '100%', backgroundColor: 'lightgray', height: '0.5px', border: 'none'}} />}
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