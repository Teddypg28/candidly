import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { BlockStack, Card, Layout, Page, PageActions, Select, TextField } from "@shopify/polaris";

import db from '../db.server'
import { authenticate } from "~/shopify.server";
import { useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";

export const loader = async ({ request, params } : LoaderFunctionArgs) => {

    try {

        const { session } = await authenticate.admin(request)

        const reviewId = params.id

        if (reviewId) {

            const review = await db.productReview.findFirst({where: {store: {equals: session.shop}, AND: {id: {equals: parseInt(reviewId)}}}})

            if (review) {

                return json({id: review.id || undefined, title: review.title, body: review.body, name: review.name, rating: review.rating.toString()})

            }

            return redirect('/app/reviews')

        }
        
    } catch (error) {

        console.log(error)
        
    }

    return redirect('/app/reviews')

}

export const action = async ({ request } : ActionFunctionArgs) => {

    const data = await request.json()

    const id = data.state.id

    delete data.state['id']

    const rating = parseInt(data.state.rating)

    const result = await db.productReview.update({where: {id}, data: {...data.state, rating}, omit: {productId: true}})

    return result

}

export default function Review() {

    const review = useLoaderData<typeof loader>()

    const [state, setState] = useState(review)
    const [cleanState, setCleanState] = useState(review)

    const isStateClean = JSON.stringify(state) === JSON.stringify(cleanState)

    const options = [
        {label: '5 Stars', value: '5'},
        {label: '4 Stars', value: '4'},
        {label: '3 Stars', value: '3'},
        {label: '2 Stars', value: '2'},
        {label: '1 Star', value: '1'},
    ]

    const submit = useSubmit()

    const handleSave = () => {

        submit(JSON.stringify({state}), {method: 'POST', encType: 'application/json'})

        setCleanState(state)

    }

  return (
    <Page
    title="Review"
    subtitle="Edit or delete review details"
    backAction={{url: '/app'}}
    >
        <SaveBar open={!isStateClean}>
            <button variant='primary' onClick={handleSave}></button>
            <button onClick={() => setState(review)}></button>
        </SaveBar>
        <Layout>
            <Layout.Section variant="oneHalf">
                <Card>
                    <BlockStack gap='200'>
                        <TextField 
                        value={state.name} 
                        onChange={value => setState({...state, name: value})}
                        placeholder="Reviewer Name" 
                        autoComplete="off" 
                        label="Reviewer Name" />
                        <Select 
                        options={options}
                        value={state.rating} 
                        onChange={value => setState({...state, rating: value})}
                        placeholder="Star Rating" 
                        label="Star Rating" />
                        <TextField 
                        value={state.title} 
                        onChange={value => setState({...state, title: value})}
                        placeholder="Review Title" 
                        autoComplete="off" 
                        label="Review Title" />
                        <TextField 
                        value={state.body} 
                        onChange={value => setState({...state, body: value})}
                        placeholder="Review Body" 
                        autoComplete="off" 
                        label="Review Body" />
                    </BlockStack>
                </Card>
            </Layout.Section>
            <Layout.Section>
                <PageActions 
                primaryAction={{content: 'Save', disabled: isStateClean, onAction: handleSave}}
                secondaryActions={[{content: 'Delete', destructive: true}]}
                />
            </Layout.Section>
        </Layout>
        
    </Page>
  )
}

