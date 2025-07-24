import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { RewardState, SelectedProduct_Bogo } from "~/types/types";

// fetch product image and title for bogo purchase & receive products
export default async function fetchBogoProductData(rewardSettings: RewardState, admin: AdminApiContext) {
    const selectedProducts: {subpar: SelectedProduct_Bogo[], good: SelectedProduct_Bogo[], perfect: SelectedProduct_Bogo[], solo: SelectedProduct_Bogo[]} = {subpar: [], good: [], perfect: [], solo: []}
    await Promise.all(['subpar', 'good', 'perfect', 'solo'].map(async (reviewType) => {
        const productIds: string[] = []
        if (rewardSettings.rewards[reviewType as keyof typeof rewardSettings.rewards].bogoPurchaseProductId) {
            productIds.push(rewardSettings.rewards[reviewType as keyof typeof rewardSettings.rewards].bogoPurchaseProductId)
        } 
        if (rewardSettings.rewards[reviewType as keyof typeof rewardSettings.rewards].bogoReceiveProductId) {
            productIds.push(rewardSettings.rewards[reviewType as keyof typeof rewardSettings.rewards].bogoReceiveProductId)
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