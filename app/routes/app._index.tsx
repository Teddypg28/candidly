import { LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, CalloutCard, Card, Layout, Text } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

import db from '../db.server'

export default function Index() {

    return (
            <div style={{width: 'fit-content', margin: 'auto'}}>
                <CalloutCard
                onDismiss={() => {}}
                title='Setup guide'
                illustration=""
                primaryAction={{content: 'test'}}
                >
                    <Text as="p" variant="bodySm">Use this guide to begin taking your store to the next level with reviews!</Text>
                
                </CalloutCard>
            </div>

    )
    
    
}