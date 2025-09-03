import { BlockStack, Button, Card, ChoiceList, InlineError, InlineStack, Layout, Page, Select, Text, Thumbnail } from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import { useState } from "react";
import RewardChoice from "~/components/RewardChoice";
import { Reward as RewardStateReward, RewardState, initialRewardState, SelectedProduct_Reward, EligibleProduct, SelectedCollection_Reward, EligibleCollection } from "~/types/types";
import { Reward as RewardShape, Subscription } from "@prisma/client";

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { SaveBar } from "@shopify/app-bridge-react";

import db from '../db.server'
import fetchSelectedProductData from "~/helpers/rewards/fetchSelectedProductData";
import fetchSelectedCollectionData from "~/helpers/rewards/fetchSelectedCollectionData";
import fetchBxgyProductData from "~/helpers/rewards/fetchBxgyProductData";

export const action = async ({ request } : ActionFunctionArgs) => {

    const { session } = await authenticate.admin(request)

    const subscription = await db.subscription.findFirst({where: {shop: {equals: session.shop}}})

    if (subscription?.type !== "free") {

        const payload = await request.json()
    
        const currentReward = await db.reward.findFirst({where: {store: {equals: session.shop}}}) as RewardShape
        // update reward type
        await db.reward.update({where: {id: currentReward.id}, data: {type: payload["type"]}})
    
        await Promise.all(['subpar', 'good', 'perfect', 'media'].map(async (reviewType) => {
            // grab the eligible products & eligible collections (if any) from request data
            const eligibleProducts = payload['rewards'][reviewType].eligibleProducts as EligibleProduct[]
            const eligibleCollections = payload['rewards'][reviewType].eligibleCollections as EligibleCollection[]
            delete payload['rewards'][reviewType]['eligibleProducts']
            delete payload['rewards'][reviewType]['eligibleCollections']
            // update reward setting
            const updatedRewardSetting = await db.rewardSetting.update({where: {id: currentReward[`${reviewType}Id` as keyof typeof Reward]}, data: {...payload['rewards'][reviewType]}})
            // delete db records of eligible products that are no longer in the updated data
            const currentProductDbRecords = await db.eligibleProduct.findMany({where: {rewardSettingId: {equals: updatedRewardSetting.id}}})
            // updated data showing just the ids of the products
            let updatedEligibleProductIds = eligibleProducts.map(product => product.productId)
            await Promise.all(currentProductDbRecords.map(async (currentDbRecord) => {
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
            const currentCollectionDbRecords = await db.eligibleCollection.findMany({where: {rewardSettingId: {equals: updatedRewardSetting.id}}})
            // updated data showing just the ids of the collections
            let updatedEligibleCollectionIds = eligibleCollections.map(collection => collection.collectionId)
            await Promise.all(currentCollectionDbRecords.map(async (currentDbRecord) => {
                // if product id of eligible product from db not in updated eligible product ids, delete it from db
                if (!updatedEligibleCollectionIds.includes(currentDbRecord.collectionId)) {
                    await db.eligibleCollection.delete({where: {id: currentDbRecord.id}})
                }
                updatedEligibleCollectionIds = updatedEligibleCollectionIds.filter(collectionId => collectionId !== currentDbRecord.collectionId)
            }))
            // the remaining product ids need to be created 
            await Promise.all(updatedEligibleCollectionIds.map(async (collectionId) => {
                const data = eligibleCollections.find(collection => collection.collectionId === collectionId) as EligibleCollection
                await db.eligibleCollection.create({data: {...data, rewardSettingId: updatedRewardSetting.id}})
            }))
        }))
        return true
    }
}

export const loader = async ({ request } : LoaderFunctionArgs) => {
    const { session, admin, redirect } = await authenticate.admin(request)

    const subscription = await db.subscription.findFirst({where: {shop: {equals: session.shop}}}) as Subscription

    if (subscription.type === "free") return redirect('/app/billing')

    // fetch rewardSettings for store
    const rewardSettings = await db.reward.findFirst({where: {store: {equals: session.shop}}, 
        include: 
            {
                subpar: {include: {eligibleProducts: {select: {productId: true}, orderBy: {productId: 'asc'}}, eligibleCollections: {select: {collectionId: true}, orderBy: {collectionId: 'asc'}}}},
                good: {include: {eligibleProducts: {select: {productId: true}, orderBy: {productId: 'asc'}}, eligibleCollections: {select: {collectionId: true}, orderBy: {collectionId: 'asc'}}}},
                perfect: {include: {eligibleProducts: {select: {productId: true}, orderBy: {productId: 'asc'}}, eligibleCollections: {select: {collectionId: true}, orderBy: {collectionId: 'asc'}}}},
                media: {include: {eligibleProducts: {select: {productId: true}, orderBy: {productId: 'asc'}}, eligibleCollections: {select: {collectionId: true}, orderBy: {collectionId: 'asc'}}}}
            },
        omit: {
                subparId: true,
                goodId: true, 
                perfectId: true, 
                mediaId: true,
                store: true,
                id: true
            }
        })

    // if rewardSettings exist already, return them
    if (rewardSettings) {
        const selectedProducts = await fetchSelectedProductData({rewards: rewardSettings, type: rewardSettings.type}, admin)
        const selectedCollections = await fetchSelectedCollectionData({rewards: rewardSettings, type: rewardSettings.type}, admin)
        const selectedBxgyProducts = await fetchBxgyProductData({rewards: rewardSettings, type: rewardSettings.type}, admin)
        return { 
            rewardSettings: {
                good: rewardSettings.good, 
                subpar: rewardSettings.subpar, 
                perfect: rewardSettings.perfect, 
                media: rewardSettings.media
            },  
            selectedProductsCollections: { 
                products: selectedProducts, 
                collections: selectedCollections 
            },
            selectedBxgyProducts,
            type: rewardSettings.type,
        }
    }

    // initialize them in the db with default values
    const initializedRewardSettings = await db.reward.create({data: 
        {
            store: session.shop, 
            type: 'none',
            subpar: {create: {...initialRewardState, eligibleProducts: {create: initialRewardState.eligibleProducts}, eligibleCollections: {create: initialRewardState.eligibleCollections}}}, 
            good: {create: {...initialRewardState, eligibleProducts: {create: initialRewardState.eligibleProducts}, eligibleCollections: {create: initialRewardState.eligibleCollections}}}, 
            perfect: {create: {...initialRewardState, eligibleProducts: {create: initialRewardState.eligibleProducts}, eligibleCollections: {create: initialRewardState.eligibleCollections}}},
            media: {create: {...initialRewardState, eligibleProducts: {create: initialRewardState.eligibleProducts}, eligibleCollections: {create: initialRewardState.eligibleCollections}}},
        },
        include: {
            subpar: {include: {eligibleProducts: {select: {productId: true}}, eligibleCollections: {select: {collectionId: true}, orderBy: {collectionId: 'asc'}}}},
            good: {include: {eligibleProducts: {select: {productId: true}}, eligibleCollections: {select: {collectionId: true}, orderBy: {collectionId: 'asc'}}}},
            perfect: {include: {eligibleProducts: {select: {productId: true}}, eligibleCollections: {select: {collectionId: true}, orderBy: {collectionId: 'asc'}}}},
            media: {include: {eligibleProducts: {select: {productId: true}}, eligibleCollections: {select: {collectionId: true}, orderBy: {collectionId: 'asc'}}}}
        },
        omit: {
            subparId: true,
            goodId: true, 
            perfectId: true, 
            mediaId: true,
            store: true,
            id: true
        }   
    })  
    return {
        rewardSettings: {
            good: initializedRewardSettings.good, 
            subpar: initializedRewardSettings.subpar, 
            perfect: initializedRewardSettings.perfect, 
            media: initializedRewardSettings.media
        }, 
        selectedProductsCollections: {
            products: {subpar: [], good: [], perfect: [], media: []}, 
            collections: {subpar: [], good: [], perfect: [], media: []}
        },
        selectedBxgyProducts: {subpar: [], good: [], perfect: [], media: []},
        type: initializedRewardSettings.type,
    }
}

export default function Reward() {

    const data = useLoaderData<typeof loader>()

    const submit = useSubmit()
    const navigation = useNavigation()

    const [currentTab, setCurrentTab] = useState(data.type === "media" ? 'media' : 'subpar')
    
    const [rewardState, setRewardState] = useState<RewardState>({rewards: data.rewardSettings, type: data.type})
    const cleanRewardState = {rewards: data.rewardSettings, type: data.type}
    
    const isStateDirty = JSON.stringify(rewardState) !== JSON.stringify(cleanRewardState)
    
    const [bxgyProductState, setBxgyProductState] = useState(data.selectedBxgyProducts)
    const [selectedProductsCollections, setSelectedProductsCollections] = useState<{
        products: {
            subpar: SelectedProduct_Reward[];
            good: SelectedProduct_Reward[];
            perfect: SelectedProduct_Reward[];
            media: SelectedProduct_Reward[]
        },
        collections: {
            subpar: SelectedCollection_Reward[];
            good: SelectedCollection_Reward[];
            perfect: SelectedCollection_Reward[];
            media: SelectedCollection_Reward[]
        }
    }>(data.selectedProductsCollections)

    const NaNDetected = Object.keys(rewardState.rewards[currentTab as keyof typeof rewardState.rewards]).find(key => {
        const keys = ['fixedAmount', 'percentageAmount', 'bxgyPurchaseAmount', 'bxgyReceiveAmount', 'bxgyDiscountAmount']
        if (keys.includes(key) && isNaN(rewardState.rewards[currentTab as keyof typeof rewardState.rewards][key as keyof RewardStateReward] as number)) {
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
                    productId: product.id
                }
            })
            const sortedProducts = eligibleProductData.sort((a, b) => {
                const idA = parseInt(a.productId.split("Product/")[1]);
                const idB = parseInt(b.productId.split("Product/")[1]);
                return idA - idB;
              });
            setRewardState({...rewardState, rewards: {...rewardState.rewards, [currentTab]: {...rewardState.rewards[currentTab as keyof typeof rewardState.rewards], eligibleProducts: sortedProducts}}})
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
            const sortedCollections = eligibleCollectionData.sort((a, b) => {
                const idA = parseInt(a.collectionId.split("Collection/")[1]);
                const idB = parseInt(b.collectionId.split("Collection/")[1]);
                return idA - idB;
              });
            setRewardState({...rewardState, rewards: {...rewardState.rewards, [currentTab]: {...rewardState.rewards[currentTab as keyof typeof rewardState.rewards], eligibleCollections: sortedCollections}}})
        }
    }

    const isErrors = () => {

        const tabs = ["subpar", "good", "perfect", "media"]
        for (let i = 0; i<tabs.length; i++) {
            if (rewardState.rewards[tabs[i] as keyof typeof rewardState.rewards].productCollectionConfiguration === "collections" && 
            rewardState.rewards[tabs[i] as keyof typeof rewardState.rewards].eligibleCollections.length === 0) {
                if (tabs[i] === "media") {
                    shopify.toast.show(`You must select at least 1 collection`, {duration: 2000})
                } else {
                    shopify.toast.show(`You must select at least 1 collection in the ${tabs[i]} review tab`, {duration: 2000})
                }
                return true
            }
        }

        for (let i = 0; i<tabs.length; i++) {
            if (rewardState.rewards[tabs[i] as keyof typeof rewardState.rewards].productCollectionConfiguration === "products" && 
            rewardState.rewards[tabs[i] as keyof typeof rewardState.rewards].eligibleProducts.length === 0) {
                if (tabs[i] === "media") {
                    shopify.toast.show(`You must select at least 1 product`, {duration: 2000})
                } else {
                    shopify.toast.show(`You must select at least 1 product in the ${tabs[i]} review tab`, {duration: 2000})
                }
                return true
            }
        }
        
        if (rewardState.rewards[rewardState.type === "media" ? 'media' : currentTab as keyof typeof rewardState.rewards].selectedRewardType === "bxgy" && (
        rewardState.rewards[rewardState.type === "media" ? 'media' : currentTab as keyof typeof rewardState.rewards].bxgyPurchaseProductId === "" || 
        rewardState.rewards[rewardState.type === "media" ? 'media' : currentTab as keyof typeof rewardState.rewards].bxgyReceiveProductId === "")) return true

        if (rewardState.rewards[rewardState.type === "media" ? 'media' : currentTab as keyof typeof rewardState.rewards].selectedRewardType === "bxgy" && 
        isNaN(rewardState.rewards[rewardState.type === "media" ? 'media' : currentTab as keyof typeof rewardState.rewards].bxgyPercentageAmount)) return true

        if (isNaN(rewardState.rewards[rewardState.type === "media" ? 'media' : currentTab as keyof typeof rewardState.rewards].minPurchaseQuantityValue)) return true

        return false
    }

    const saveChanges = () => {
        const errors = isErrors()
        if (errors) return
        submit(JSON.stringify({rewards: rewardState.rewards, type: rewardState.type}), {method: 'POST', encType: 'application/json'})
    }

    const removeEligibleProduct = (productId: string) => {
        const updatedSelectedProducts = selectedProductsCollections["products"][currentTab as keyof typeof selectedProductsCollections["products"]].filter((product) => product.id !== productId)
        const updatedProducts = rewardState.rewards[currentTab as keyof typeof rewardState.rewards].eligibleProducts.filter((product) => product.productId !== productId)

        const sortedProducts = updatedProducts.sort((a, b) => {
            const idA = parseInt(a.productId.split("Product/")[1]);
            const idB = parseInt(b.productId.split("Product/")[1]);
            return idA - idB;
          });

        setSelectedProductsCollections({...selectedProductsCollections, "products": {...selectedProductsCollections["products"], [currentTab as keyof typeof rewardState]: updatedSelectedProducts}})
        setRewardState({...rewardState, rewards: {...rewardState.rewards, [currentTab as keyof typeof rewardState.rewards]: {...rewardState.rewards[currentTab as keyof typeof rewardState.rewards], eligibleProducts: sortedProducts}}})
    }

    const removeEligibleCollection = (collectionId: string) => {
        const updatedSelectedCollections = selectedProductsCollections["collections"][currentTab as keyof typeof selectedProductsCollections["collections"]].filter((collection) => collection.id !== collectionId)
        const updatedCollections = rewardState.rewards[currentTab as keyof typeof rewardState.rewards].eligibleCollections.filter((collection) => collection.collectionId !== collectionId)

        const sortedCollections = updatedCollections.sort((a, b) => {
            const idA = parseInt(a.collectionId.split("Collection/")[1]);
            const idB = parseInt(b.collectionId.split("Collection/")[1]);
            return idA - idB;
          });        

        setSelectedProductsCollections({...selectedProductsCollections, "collections": {...selectedProductsCollections["collections"], [currentTab as keyof typeof rewardState]: updatedSelectedCollections}})
        setRewardState({...rewardState, rewards: {...rewardState.rewards, [currentTab as keyof typeof rewardState]: {...rewardState.rewards[currentTab as keyof typeof rewardState.rewards], eligibleCollections: sortedCollections}}})
    }

    const resetState = () => {
        setRewardState(cleanRewardState); 
        setSelectedProductsCollections(data.selectedProductsCollections);
        setBxgyProductState(data.selectedBxgyProducts)
        if (cleanRewardState.type === "media") setCurrentTab("media")
        if (cleanRewardState.type === "tiers") setCurrentTab("subpar")
    }

    const changeRewardType = (selected: string[], name: string) => {
        setRewardState(prevRewardsState => {return {...prevRewardsState, rewards: {...prevRewardsState.rewards}, type: selected[0]}}) 
        if (selected[0] === "tiers") setCurrentTab("subpar")
        if (selected[0] === "media") setCurrentTab("media")
    }

    return (

        <Page
        title="Review Rewards"
        subtitle="Customize how you want to reward your customers for reviews"
        >
            <SaveBar 
            open={isStateDirty} 
            >
                <button variant={'primary'} onClick={saveChanges} loading={navigation.state === "submitting"}></button>
                <button onClick={resetState}></button>
            </SaveBar>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="400">
                        <ChoiceList 
                        choices={[
                            {label: 'Photo/Image Upload Reward', value: 'media', helpText: 'Reward customers for uploading an image/video with their review'},
                            {label: 'Quality/In-Depth Reward', value: 'tiers', helpText: 'Reward customers based on how in-depth (word count) their review is using different reward tiers'},
                            {label: 'No Rewards', value: 'none', helpText: 'Disable all rewards'},
                        ]}
                        selected={[rewardState.type]}
                        onChange={changeRewardType}
                        title="Reward Type"
                        />
                    </BlockStack>
                </Layout.Section>
                <Layout.Section variant="oneHalf">
                    {rewardState.type !== "none" &&
                     <Card>
                        <BlockStack gap={'200'}>
                        {rewardState.type === "tiers" && ( 
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
                            </div>)}
                            <RewardChoice 
                            type={rewardState.type === "media" ? "media" : currentTab} 
                            state={rewardState} setState={setRewardState} 
                            bxgyProductState={bxgyProductState} 
                            setBxgyProductState={setBxgyProductState} 
                            />
                        </BlockStack>
                    </Card>}
                </Layout.Section>
                {rewardState.type !== 'none' && rewardState.rewards[currentTab as keyof typeof rewardState.rewards].selectedRewardType !== "bxgy" &&
                <Layout.Section variant="oneThird">
                    <Card>
                        <BlockStack gap={'300'}>
                            <BlockStack gap={'150'}>
                                <Text as="h1" fontWeight="bold">Product & Collection Configuration</Text>
                                <Text as="p">
                                    Select specific products or collections for which this reward will be configured.
                                </Text>
                                <Select
                                label
                                onChange={(val) => setRewardState({...rewardState, rewards: {...rewardState.rewards, [currentTab as keyof typeof rewardState]: {...rewardState.rewards[currentTab as keyof typeof rewardState.rewards], productCollectionConfiguration: val}}})}
                                value={rewardState.rewards[currentTab as keyof typeof rewardState.rewards].productCollectionConfiguration}
                                options={[
                                    {label: 'Products', value: 'products'},
                                    {label: 'Collections', value: 'collections'},
                                    {label: 'All', value: 'all'}
                                ]}
                                />
                            </BlockStack>
                            <InlineStack>
                                {
                                rewardState.rewards[currentTab as keyof typeof rewardState.rewards].productCollectionConfiguration === "products" ?
                                <Button variant={'primary'} onClick={selectProducts}>Select Products</Button> :
                                rewardState.rewards[currentTab as keyof typeof rewardState.rewards].productCollectionConfiguration === "collections" ? 
                                <Button variant={'primary'} onClick={selectCollections}>Select Collections</Button> : ""
                                }
                            </InlineStack>
    
                            {rewardState.rewards[currentTab as keyof typeof rewardState.rewards].productCollectionConfiguration === "products" && selectedProductsCollections["products"][currentTab as keyof typeof selectedProductsCollections["products"]].length > 0 && 
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
                                                        <Button onClick={() => removeEligibleProduct(product.id)} variant="primary" tone="critical">Remove Product</Button>
                                                    </InlineStack>
                                                </BlockStack>
                                            </InlineStack>
                                            {index !== selectedProductsCollections["products"][currentTab as keyof typeof selectedProductsCollections["products"]].length - 1 && <hr style={{width: '100%', backgroundColor: 'lightgray', height: '0.5px', border: 'none'}} />}
                                        </>
                                    )
                                })}
                            </BlockStack>}
                            {rewardState.rewards[currentTab as keyof typeof rewardState.rewards].productCollectionConfiguration === "products" && rewardState.rewards[currentTab as keyof typeof rewardState.rewards].eligibleProducts.length === 0 && <InlineError fieldID="product" key="productError" message="Please select at least 1 product" />}
                            
                            {rewardState.rewards[currentTab as keyof typeof rewardState.rewards].productCollectionConfiguration === "collections" && selectedProductsCollections["collections"][currentTab as keyof typeof selectedProductsCollections["collections"]].length > 0 && 
                            <BlockStack gap={'200'}>
                                {selectedProductsCollections["collections"][rewardState.type === "media" ? "media" : currentTab as keyof typeof selectedProductsCollections["collections"]].map((collection: any, index: number) => {
                                    return (
                                        <>
                                            <InlineStack key={index} gap={'200'} blockAlign="center">
                                                <Text as="p">{collection.title}</Text>
                                                <Button onClick={() => removeEligibleCollection(collection.id)} variant="primary" tone="critical">Remove Collection</Button>
                                            </InlineStack>
                                            {index !== selectedProductsCollections["collections"][currentTab as keyof typeof selectedProductsCollections["collections"]].length - 1 && <hr style={{width: '100%', backgroundColor: 'lightgray', height: '0.5px', border: 'none'}} />}
                                        </>
                                    )
                                })}
                            </BlockStack>}
                            {rewardState.rewards[currentTab as keyof typeof rewardState.rewards].productCollectionConfiguration === "collections" && rewardState.rewards[currentTab as keyof typeof rewardState.rewards].eligibleCollections.length === 0 && <InlineError fieldID="collection" key="collectionError" message="Please select at least 1 collection" />}
                        </BlockStack>
                    </Card>
                </Layout.Section>}
            </Layout>
        </Page>
    )
}