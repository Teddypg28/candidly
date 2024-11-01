import { useNavigate } from "@remix-run/react"
import { Card, Text, EmptyState, Page } from "@shopify/polaris"

export default function Rewards() {

    const nav = useNavigate()

    return (
        <Page
        title="Rewards"
        >
            <Card>
                <EmptyState
                action={{content: 'Create Your First Reward', onAction: () => nav('/app/reward/new')}}
                heading="You Haven't Created Any Rewards Yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                />
            </Card>
        </Page>
    )

}