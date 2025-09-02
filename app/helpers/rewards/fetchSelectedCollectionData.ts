import { AdminApiContext } from "@shopify/shopify-app-remix/server"
import { RewardState, SelectedCollection_Reward } from "~/types/types"

// fetches collection data to display which collections the reward is configured for
export default async function fetchSelectedCollectionData(rewardSettings: RewardState, admin: AdminApiContext) {
    const selectedCollections: {subpar: SelectedCollection_Reward[], good: SelectedCollection_Reward[], perfect: SelectedCollection_Reward[], media: SelectedCollection_Reward[]} = {subpar: [], good: [], perfect: [], media: []}
    await Promise.all(['subpar', 'good', 'perfect', 'media'].map(async (reviewType) => {
        await Promise.all(rewardSettings.rewards[reviewType as keyof typeof rewardSettings.rewards].eligibleCollections.map(async (collection) => {
            const query = `{
                collection(id: "${collection.collectionId}") {
                    title
                }
              }`
            const res = await admin.graphql(query)
            const data = await res.json()
            if (data.data.collection) {
                selectedCollections[reviewType as keyof typeof selectedCollections].push({
                    title: data.data.collection.title,
                    id: collection.collectionId
                })
            } else {
                selectedCollections[reviewType as keyof typeof selectedCollections].push({
                    title: "Collection deleted",
                    id: ""
                })
            }
        }))
    }))     

    return selectedCollections
}