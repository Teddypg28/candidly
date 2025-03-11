import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { SelectedCollection } from "~/types/types";

export default async function fetchCollectionInfo(admin: AdminApiContext, collectionIds: string[]) {

    const query = `query getCollectionDetails($id: ID!) {
		collection(id: $id) {
    	title
        }
    }`

    const collectionDataObjects: SelectedCollection[] = await Promise.all(collectionIds.map(async (id) => {

        const res = await admin.graphql(query, {variables: {id: id}})
        const data = await res.json()

        return {
            id,
            title: data.data.collection.title
        }

    }))

    return collectionDataObjects

}