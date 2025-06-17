import { AdminApiContext } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";

import { ImageIcon } from "@shopify/polaris-icons";
import { SelectedProduct } from "~/types/types";

// fetches product info to display which products are connected to a custom question
export default async function fetchProductInfo(admin: AdminApiContext, productIds: string[]) {

    const query = `query getProductDetails($id: ID!) {
        product(id: $id) {
            title
            featuredMedia {
            preview {
                image {
                url
                }
            }}
            variants(first: 100) {
            nodes {
                title
            }}}
    }`

    const productDataObjects: SelectedProduct[] = await Promise.all(productIds.map(async (id) => {

        const res = await admin.graphql(query, {variables: {id}})
        const data = await res.json()

        return {
            id,
            image: data.data.product.featuredMedia ? data.data.product.featuredMedia.preview.image.url : ImageIcon,
            title: data.data.product.title,
            variants: data.data.product.variants.nodes.map((variant: any) => variant.title)
        }

    }))

    return productDataObjects

}