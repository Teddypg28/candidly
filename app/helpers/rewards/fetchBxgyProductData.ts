import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { RewardState, SelectedProduct_Bxgy } from "~/types/types";

// fetch product image and title for bogo purchase & receive products
export default async function fetchBxgyProductData(rewardSettings: RewardState, admin: AdminApiContext) {
    const selectedProducts: {subpar: SelectedProduct_Bxgy[], good: SelectedProduct_Bxgy[], perfect: SelectedProduct_Bxgy[], media: SelectedProduct_Bxgy[]} = {subpar: [], good: [], perfect: [], media: []}
    await Promise.all(['subpar', 'good', 'perfect', 'media'].map(async (reviewType) => {
        const productIds: string[] = []
        if (rewardSettings.rewards[reviewType as keyof typeof rewardSettings.rewards].bxgyPurchaseProductId) {
            productIds.push(rewardSettings.rewards[reviewType as keyof typeof rewardSettings.rewards].bxgyPurchaseProductId)
        } 
        if (rewardSettings.rewards[reviewType as keyof typeof rewardSettings.rewards].bxgyReceiveProductId) {
            productIds.push(rewardSettings.rewards[reviewType as keyof typeof rewardSettings.rewards].bxgyReceiveProductId)
        }
        await Promise.all(productIds.map(async (productId, index) => {
            const query = `{
                product(id: "${productId}") {
                    title
                    media(first: 1) {
                    edges {
                        node {
                        preview {
                            image {
                            url
                            }
                        }
                        }
                    }
                    }
            }
        }`
            const res = await admin.graphql(query)
            const data = await res.json()
            index === 0 ? 
            selectedProducts[reviewType as keyof typeof selectedProducts].unshift({
                title: data.data.product.title,
                image: data.data.product.media ? data.data.product.media.edges[0].node.preview.image.url : null
            }) :
            selectedProducts[reviewType as keyof typeof selectedProducts].push({
                title: data.data.product.title,
                image: data.data.product.media ? data.data.product.media.edges[0].node.preview.image.url : null
            })
        }))
    }))    
    return selectedProducts
}