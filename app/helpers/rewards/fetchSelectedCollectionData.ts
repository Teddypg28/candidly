import { AdminApiContext } from "@shopify/shopify-app-remix/server"
import { Reward, SelectedCollection_Reward } from "~/types/types"

// fetches collection data to display which collections the reward is configured for
export default async function fetchSelectedCollectionData(reward: Reward, admin: AdminApiContext) {
    const selectedCollections: SelectedCollection_Reward[] = []
    await Promise.all(reward.eligibleCollections.map(async (collection) => {
            const query = `{
                collection(id: "${collection.collectionId}") {
                    title
                }
              }`
            const res = await admin.graphql(query)
            const data = await res.json()
            if (data.data.collection) {
                selectedCollections.push({
                    title: data.data.collection.title,
                    id: collection.collectionId
                })
            } else {
                selectedCollections.push({
                    title: "Collection deleted",
                    id: ""
                })
            }
        }))
        return selectedCollections
    }    