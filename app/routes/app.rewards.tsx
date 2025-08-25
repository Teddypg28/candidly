import { BlockStack, Button, Card, ChoiceList, InlineError, InlineStack, Layout, Page, Select, Text, Thumbnail } from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import { useState } from "react";
import { Reward as RewardStateReward, initialRewardState, SelectedProduct_Reward, EligibleProduct, SelectedCollection_Reward, EligibleCollection } from "~/types/types";
import { Reward as RewardShape, Subscription } from "@prisma/client";

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { SaveBar } from "@shopify/app-bridge-react";

import db from '../db.server'
import fetchSelectedProductData from "~/helpers/rewards/fetchSelectedProductData";
import fetchSelectedCollectionData from "~/helpers/rewards/fetchSelectedCollectionData";
import fetchBxgyProductData from "~/helpers/rewards/fetchBxgyProductData";
import RewardChoice from "~/components/RewardChoice";

export const action = async ({ request } : ActionFunctionArgs) => {

    const { session } = await authenticate.admin(request)

    const subscription = await db.subscription.findFirst({where: {shop: {equals: session.shop}}})

    if (subscription?.type !== "free") {

        const payload = await request.json()
    
        const currentReward = await db.reward.findFirst({where: {store: {equals: session.shop}}}) as RewardShape
        // grab the eligible products & eligible collections (if any) from request data
        const eligibleProducts = payload.eligibleProducts as EligibleProduct[]
        const eligibleCollections = payload.eligibleCollections as EligibleCollection[]
        delete payload['eligibleProducts']
        delete payload['eligibleCollections']
        // update reward setting
        const updatedReward = await db.reward.update({where: {id: currentReward.id}, data: {...payload}})
        // delete db records of eligible products that are no longer in the updated data
        const currentProductDbRecords = await db.eligibleProduct.findMany({where: {rewardId: {equals: currentReward.id}}})
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
            await db.eligibleProduct.create({data: {...data, rewardId: currentReward.id}})
        }))
        const currentCollectionDbRecords = await db.eligibleCollection.findMany({where: {rewardId: {equals: currentReward.id}}})
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
            await db.eligibleCollection.create({data: {...data, rewardId: currentReward.id}})
        }))
    }
    return true
}

export const loader = async ({ request } : LoaderFunctionArgs) => {
    const { session, admin, redirect } = await authenticate.admin(request)

    const subscription = await db.subscription.findFirst({where: {shop: {equals: session.shop}}}) as Subscription

    if (subscription.type === "free") return redirect('/app/billing')

    // fetch reward for store
    const reward = await db.reward.findFirst({where: {store: {equals: session.shop}}, omit: {store: true, id: true}, include: {eligibleProducts: true, eligibleCollections: true}})

    // if rewardSettings exist already, return them
    if (reward) {
        const selectedProducts = await fetchSelectedProductData(reward, admin)
        const selectedCollections = await fetchSelectedCollectionData(reward, admin)
        const selectedBxgyProducts = await fetchBxgyProductData(reward, admin)
        return { 
            reward,  
            selectedProductsCollections: { 
                products: selectedProducts, 
                collections: selectedCollections 
            },
            selectedBxgyProducts,
        }
    }

    // initialize them in the db with default values
    const initializedReward = await db.reward.create({data: 
        {
            store: session.shop, 
            ...initialRewardState, 
            eligibleProducts: {create: initialRewardState.eligibleProducts}, 
            eligibleCollections: {create: initialRewardState.eligibleCollections},
        },
        include: {
            eligibleCollections: true,
            eligibleProducts: true
        },
        omit: {
            store: true,
            id: true
        }   
    })  
    return {
        reward: initializedReward, 
        selectedProductsCollections: {
            products: [], 
            collections: []
        },
        selectedBxgyProducts: [],
    }
}

export default function Reward() {

    const data = useLoaderData<typeof loader>()

    const submit = useSubmit()
    const navigation = useNavigation()
    
    const [rewardState, setRewardState] = useState<RewardStateReward>(data.reward)
    const cleanRewardState = data.reward
    
    const isStateDirty = JSON.stringify(rewardState) !== JSON.stringify(cleanRewardState)
    
    const [bxgyProductState, setBxgyProductState] = useState(data.selectedBxgyProducts)
    const [selectedProductsCollections, setSelectedProductsCollections] = useState<{
        products: SelectedProduct_Reward[],
        collections: SelectedCollection_Reward[]
    }>(data.selectedProductsCollections)

    const selectProducts = async () => {
        const products = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
            multiple: true
        })

        if (products) {
            setSelectedProductsCollections({...selectedProductsCollections, products: {...selectedProductsCollections["products"], ...products}})
            const eligibleProductData = products.map(product => {
                return {
                    productId: product.id
                }
            })
            setRewardState({...rewardState, eligibleProducts: eligibleProductData})
        }
    }

    const selectCollections = async () => {
        const collections = await window.shopify.resourcePicker({
            type: 'collection',
            action: 'select',
            multiple: true
        })

        if (collections) {
            setSelectedProductsCollections({...selectedProductsCollections, collections: {...selectedProductsCollections["collections"], ...collections}})
            const eligibleCollectionData = collections.map(collection => {
                return {
                    collectionId: collection.id, 
                }
            })
            setRewardState({...rewardState, eligibleCollections: eligibleCollectionData.sort((a, b) => a.collectionId.localeCompare(b.collectionId))})
        }
    }

    const isErrors = () => {
        if (rewardState.productCollectionConfiguration === "collections" && 
        rewardState.eligibleCollections.length === 0) return true

        if (rewardState.productCollectionConfiguration === "products" && 
        rewardState.eligibleProducts.length === 0) return true
        
        if (rewardState.selectedRewardType === "bxgy" && (
        rewardState.bxgyPurchaseProductId === "" || 
        rewardState.bxgyReceiveProductId === "")) return true

        if (rewardState.selectedRewardType === "bxgy" && 
        isNaN(rewardState.bxgyPercentageAmount)) return true

        if (isNaN(rewardState.minPurchaseQuantityValue)) return true

        return false
    }

    const saveChanges = () => {
        const errors = isErrors()
        if (errors) return
        submit(JSON.stringify(rewardState), {method: 'POST', encType: 'application/json'})
    }

    const removeEligibleProduct = (productId: string) => {
        const updatedSelectedProducts = selectedProductsCollections["products"].filter((product) => product.id !== productId)
        const updatedProducts = rewardState.eligibleProducts.filter((product) => product.productId !== productId)

        setSelectedProductsCollections({...selectedProductsCollections, "products": {...selectedProductsCollections["products"], ...updatedSelectedProducts}})
        setRewardState({...rewardState, eligibleProducts: updatedProducts})
    }

    const removeEligibleCollection = (collectionId: string) => {
        const updatedSelectedCollections = selectedProductsCollections["collections"].filter((collection) => collection.id !== collectionId)
        const updatedCollections = rewardState.eligibleCollections.filter((collection) => collection.collectionId !== collectionId).sort((a, b) => a.collectionId.localeCompare(b.collectionId))

        setSelectedProductsCollections({...selectedProductsCollections, "collections": {...selectedProductsCollections["collections"], ...updatedSelectedCollections}})
        setRewardState({...rewardState, eligibleCollections: updatedCollections})
    }

    const resetState = () => {
        setRewardState(cleanRewardState); 
        setSelectedProductsCollections(data.selectedProductsCollections);
        setBxgyProductState(data.selectedBxgyProducts)
    }

    const changeRewardType = (selected: string[], name: string) => {
        setRewardState(prevRewardsState => {return {...prevRewardsState, disabled: selected[0] === "none" ? true : false}}) 
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
                            {label: 'Reward', value: 'solo', helpText: 'Reward your customers for submitting reviews'},
                            {label: 'No Reward', value: 'none', helpText: 'Disable all rewards'},
                        ]}
                        selected={[rewardState.disabled ? 'none' : 'solo']}
                        onChange={changeRewardType}
                        title="Reward Type"
                        />
                    </BlockStack>
                </Layout.Section>
                <Layout.Section variant="oneHalf">
                    {!rewardState.disabled &&
                     <Card>
                        <BlockStack gap={'200'}>
                            <RewardChoice 
                            state={rewardState} setState={setRewardState} 
                            bxgyProductState={bxgyProductState} 
                            setBxgyProductState={setBxgyProductState} 
                            />
                        </BlockStack>
                    </Card>}
                </Layout.Section>
                {!rewardState.disabled && rewardState.selectedRewardType !== 'bxgy' &&
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
                                onChange={(val) => setRewardState({...rewardState, productCollectionConfiguration: val})}
                                value={rewardState.productCollectionConfiguration}
                                options={[
                                    {label: 'Products', value: 'products'},
                                    {label: 'Collections', value: 'collections'},
                                    {label: 'All', value: 'all'}
                                ]}
                                />
                            </BlockStack>
                            <InlineStack>
                                {
                                rewardState.productCollectionConfiguration === "products" ?
                                <Button variant={'primary'} onClick={selectProducts}>Select Products</Button> :
                                rewardState.productCollectionConfiguration === "collections" ? 
                                <Button variant={'primary'} onClick={selectCollections}>Select Collections</Button> : ""
                                }
                            </InlineStack>
    
                            {rewardState.productCollectionConfiguration === "products" && selectedProductsCollections["products"].length > 0 && 
                            <BlockStack gap={'200'}>
                                {selectedProductsCollections["products"].map((product: any, index: number) => {

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
                                            {index !== selectedProductsCollections["products"].length - 1 && <hr style={{width: '100%', backgroundColor: 'lightgray', height: '0.5px', border: 'none'}} />}
                                        </>
                                    )
                                })}
                            </BlockStack>}
                            {rewardState.productCollectionConfiguration === "products" && rewardState.eligibleProducts.length === 0 && <InlineError fieldID="product" key="productError" message="Please select at least 1 product" />}
                            
                            {rewardState.productCollectionConfiguration === "collections" && selectedProductsCollections["collections"].length > 0 && 
                            <BlockStack gap={'200'}>
                                {selectedProductsCollections["collections"].map((collection: any, index: number) => {
                                    return (
                                        <>
                                            <InlineStack key={index} gap={'200'} blockAlign="center">
                                                <Text as="p">{collection.title}</Text>
                                                <Button onClick={() => removeEligibleCollection(collection.id)} variant="primary" tone="critical">Remove Collection</Button>
                                            </InlineStack>
                                            {index !== selectedProductsCollections["collections"].length - 1 && <hr style={{width: '100%', backgroundColor: 'lightgray', height: '0.5px', border: 'none'}} />}
                                        </>
                                    )
                                })}
                            </BlockStack>}
                            {rewardState.productCollectionConfiguration === "collections" && rewardState.eligibleCollections.length === 0 && <InlineError fieldID="collection" key="collectionError" message="Please select at least 1 collection" />}
                        </BlockStack>
                    </Card>
                </Layout.Section>}
            </Layout>
        </Page>
    )
}