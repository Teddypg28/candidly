import { Banner, BlockStack, Button, Card, InlineStack, Layout, Page, PageActions, Select, Text, Thumbnail } from "@shopify/polaris";
import { ImageIcon, InfoIcon } from "@shopify/polaris-icons";

import { useCallback, useState } from "react";
import RewardChoice from "~/components/RewardChoice";
import { Reward as RewardStateReward, RewardState, initialRewardState } from "~/types/types";

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { SaveBar } from "@shopify/app-bridge-react";

import db from '../db.server'

export const action = async ({ request, params } : ActionFunctionArgs) => {

    const { session, redirect } = await authenticate.admin(request)

    const payload = await request.json()

    if (params.id === "configure") {
        const reward = await db.reward.create({data: 
            {
                subpar: {create: {...payload.subpar}}, 
                good: {create: {...payload.good}}, 
                perfect: {create: {...payload.perfect}},
                store: session.shop
            }
    })
        return redirect(`/app/reward/${reward.id}`)
    }

    if (payload.action === 'delete') {
        if (params.id) {
            const result = await db.reward.delete({where: {id: parseInt(params.id)}})
            await db.rewardSetting.delete({where: {id: result.goodId}})
            await db.rewardSetting.delete({where: {id: result.subparId}})
            await db.rewardSetting.delete({where: {id: result.perfectId}})
        }
        return redirect('/app/rewards')
    }

    const currentReward = await db.reward.findFirst({where: {id: payload.id}})
    await db.rewardSetting.update({where: {id: currentReward?.subparId}, data: {...payload.subpar}})
    await db.rewardSetting.update({where: {id: currentReward?.goodId}, data: {...payload.good}})
    await db.rewardSetting.update({where: {id: currentReward?.perfectId}, data: {...payload.perfect}})
    
    return true
}

export const loader = async ({ request, params } : LoaderFunctionArgs) => {

    const { redirect } = await authenticate.admin(request)

    if (params.id === "configure") {
        const perfect = initialRewardState
        const good = initialRewardState
        const subpar = initialRewardState

        return {subpar: {...subpar}, good: {...good}, perfect: {...perfect}}
    }

    if (params.id) {
        const result = await db.reward.findFirst({where: {id: {equals: parseInt(params.id)}}, include: 
        {
            subpar: {include: {excludedProducts: true}}, 
            good: {include: {excludedProducts: true}},
            perfect: {include: {excludedProducts: true}}
        }
    })

        if (result) {
            return result
        }

        return redirect('/app/rewards')
     }
}

export default function Reward() {

    const data = useLoaderData<typeof loader>()

    const submit = useSubmit()

    const [currentTab, setCurrentTab] = useState('subpar')
    const [rewardState, setRewardState] = useState<RewardState>(data)
    const [cleanRewardState, setCleanRewardState] = useState<RewardState>(data)

    const isStateDirty = JSON.stringify(rewardState) !== JSON.stringify(cleanRewardState)

    const [selectedProducts, setSelectedProducts] = useState<any>([])

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
            const excludedProductData = products.map(product => {
                return {productId: product.id, variantIds: product.variants.map(variant => variant.id)}
            })

            setSelectedProducts(products)
            setRewardState({...rewardState, [currentTab]: {...rewardState[currentTab as keyof typeof rewardState], excludedProducts: excludedProductData}})
        }
    }

    const saveChanges = () => {

        const productData = selectedProducts.map((product: any) => {
            return {productId: product.id, variantIds: product.variants.map((variant: any) => variant.id || '')}
        })

        setCleanRewardState(rewardState)

        submit(JSON.stringify({...rewardState, excludedProducts: productData}), {method: 'POST', encType: 'application/json'})

    }

    const deleteReward = useCallback(() => {
        
        submit(JSON.stringify({action: 'delete'}), {encType: 'application/json', method: 'POST'})

    }, [])

    const removeSelectedProduct = (productId: string) => {
        const updatedRewardState = rewardState[currentTab as keyof typeof rewardState].excludedProducts.filter((product: any) => product.productId !== productId)
        const updatedSelectedProducts = selectedProducts.filter((product: any) => product.id !== productId)

        setSelectedProducts(updatedSelectedProducts)
        setRewardState({...rewardState, [currentTab]: {...rewardState[currentTab as keyof typeof rewardState], excludedProducts: updatedRewardState}})
    }

    return (

        <Page
        title="Review Reward"
        subtitle={data.good.hasOwnProperty('id') ? "Edit or delete this review reward" : "Create a new reward"}
        backAction={{url: '/app/rewards'}}
        >
            <SaveBar 
            open={isStateDirty} 
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
                            <BlockStack gap={'150'}>
                                <Text as="h1" fontWeight="bold">Exclude Products</Text>
                                <Text as="p" tone="caution">
                                    For any products that you choose to exclude, customers will not be able to use the reward when purchasing it.
                                </Text>
                            </BlockStack>
                            <InlineStack>
                                <Button variant={'primary'} onClick={selectProducts}>Select Products</Button>
                            </InlineStack>
                            
                            {selectedProducts.length > 0 && 
                            <BlockStack gap={'200'}>
                                {selectedProducts.map((product: any, index: number) => {

                                    const productImage = product.images.length > 0 ? product.images[0].originalSrc : ImageIcon

                                    return (
                                        <>
                                            <InlineStack key={index} gap={'200'} blockAlign="center">
                                                <Thumbnail size="small" alt="product image" source={productImage} />
                                                <BlockStack>
                                                    <Text fontWeight="bold" as="p">{product.title}</Text>
                                                    <InlineStack gap={'200'}>
                                                        <Text as="p">Variants: {product.totalVariants === product.variants.length ? 'All' : product.variants.map((variant: any) => {
                                                            return variant.title
                                                        }).join(', ')}
                                                        </Text>
                                                        <Button onClick={() => removeSelectedProduct(product.id)} variant="primary" tone="critical">Remove Product</Button>
                                                    </InlineStack>
                                                </BlockStack>
                                            </InlineStack>
                                            {index !== selectedProducts.length - 1 && <hr style={{width: '100%', backgroundColor: 'lightgray', height: '0.5px', border: 'none'}} />}
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
            {data.good.hasOwnProperty('id') &&
            <PageActions
            secondaryActions={[{content: 'Delete', destructive: true, onAction: deleteReward}]}
            />
            }
        </Page>

    )

}
