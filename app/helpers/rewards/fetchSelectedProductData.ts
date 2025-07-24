import { AdminApiContext } from "@shopify/shopify-app-remix/server"
import { RewardState, SelectedProduct_Reward } from "~/types/types"

// fetches product data to display which product the reward is configured for
export default async function fetchSelectedProductData(rewardSettings: RewardState, admin: AdminApiContext) {
    const selectedProducts: {subpar: SelectedProduct_Reward[], good: SelectedProduct_Reward[], perfect: SelectedProduct_Reward[], solo: SelectedProduct_Reward[]} = {subpar: [], good: [], perfect: [], solo: []}
    await Promise.all(['subpar', 'good', 'perfect', 'solo'].map(async (reviewType) => {
        await Promise.all(rewardSettings.rewards[reviewType as keyof typeof rewardSettings.rewards].eligibleProducts.map(async (product) => {
            const query = `{
                product(id: "${product.productId}") {
                    id
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
                    variants(first: 100) {
                    edges {
                        node {
                        id
                        title
                        }
                    }
                    }
                }
                }`
            const res = await admin.graphql(query)
            const data = await res.json()
            selectedProducts[reviewType as keyof typeof selectedProducts].push({
                images: data.data.product.media ? [{originalSrc: data.data.product.media.edges[0].node.preview.image.url}] : [],
                title: data.data.product.title,
                id: product.productId
            })

        }))
    }))    
    return selectedProducts
}