import { AdminApiContext } from "@shopify/shopify-app-remix/server"
import { Reward, SelectedProduct_Reward } from "~/types/types"

// fetches product data to display which product the reward is configured for
export default async function fetchSelectedProductData(reward: Reward, admin: AdminApiContext) {
    const selectedProducts: SelectedProduct_Reward[] = []

    await Promise.all(reward.eligibleProducts.map(async (product) => {
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
        if (data.data.product) {
            selectedProducts.push({
                images: data.data.product.media ? [{originalSrc: data.data.product.media.edges[0].node.preview.image.url}] : [],
                title: data.data.product.title,
                id: product.productId
            })
        } else {
            selectedProducts.push({id: "", images: [], title: "Product deleted"})
        }
    }))
    
    return selectedProducts
}