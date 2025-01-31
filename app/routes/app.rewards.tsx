import { ActionFunctionArgs } from "@remix-run/node"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { Badge, Card, EmptyState, IndexTable, Link, Page } from "@shopify/polaris"

import db from '../db.server'
import { authenticate } from "~/shopify.server"

export const loader = async ({ request } : ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request)
    return await db.reward.findMany({where: {store: {equals: session.shop}}, include: {limitedEligibleProducts: true, subpar: true, good: true, perfect: true}})
}

export default function Rewards() {
    const rewards = useLoaderData<typeof loader>()
    const IndexTableRows = rewards.map((reward, index) => {
        return (
            <IndexTable.Row position={index} key={index} id={index.toString()}>
                <IndexTable.Cell>
                    <Link url={`/app/reward/${reward.id}`}>{reward.id}</Link>
                </IndexTable.Cell>
                <IndexTable.Cell>{reward.subpar.selectedRewardType}</IndexTable.Cell>
                <IndexTable.Cell>{reward.good.selectedRewardType}</IndexTable.Cell>
                <IndexTable.Cell>{reward.perfect.selectedRewardType}</IndexTable.Cell>
                <IndexTable.Cell>{reward.limitedEligibleProducts.length > 0 ? reward.limitedEligibleProducts.length : 'All'}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge tone="critical">False</Badge>
                </IndexTable.Cell>
            </IndexTable.Row>
        )
    })

    const nav = useNavigate()

    return (
        <Page
        title="Review Rewards"
        subtitle={rewards.length > 0 ? 'Here are all of your current review rewards' : ''}
        >
            <Card>
                {rewards.length > 0 ?
                
                <IndexTable
                headings={[
                    {title: 'Reward ID'}, 
                    {title: 'Subpar Tier Reward'}, 
                    {title: 'Good Tier Reward'}, 
                    {title: 'Perfect Tier Reward'}, 
                    {title: 'Number of Products'},
                    {title: 'Activated'}
                ]} 
                itemCount={rewards.length} 
                >
                    {IndexTableRows}
                </IndexTable>

                :
                
                <EmptyState
                action={{content: 'Create Your First Reward', onAction: () => nav('/app/reward/new')}}
                heading="You Haven't Created Any Rewards Yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                />
                }
            </Card>
        </Page>
    )

}