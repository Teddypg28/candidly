import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { Reward, SelectedProduct_Bxgy } from "~/types/types";

// fetch product image and title for bogo purchase & receive products
export default async function fetchBxgyProductData(reward: Reward, admin: AdminApiContext) {
    const selectedProducts: SelectedProduct_Bxgy[] = []
    const productIds: string[] = []
    if (reward.bxgyPurchaseProductId) {
        productIds.push(reward.bxgyPurchaseProductId)
    } 
    if (reward.bxgyReceiveProductId) {
        productIds.push(reward.bxgyReceiveProductId)
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
        selectedProducts.unshift({
            title: data.data.product.title,
            image: data.data.product.media ? data.data.product.media.edges[0].node.preview.image.url : null
        }) :
        selectedProducts.push({
            title: data.data.product.title,
            image: data.data.product.media ? data.data.product.media.edges[0].node.preview.image.url : null
        })
    }))
    return selectedProducts
}
