import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { BlockStack, Card, DropZone, InlineStack, Layout, Page, PageActions, Text, TextField, Thumbnail } from "@shopify/polaris";

import db from '../db.server'
import { authenticate } from "~/shopify.server";
import { useEffect, useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";

export const loader = async ({ request, params } : LoaderFunctionArgs) => {

    try {

        const { session } = await authenticate.admin(request)

        const reviewId = params.id

        if (reviewId) {
            const review = await db.productReview.findFirst({where: {store: {equals: session.shop}, AND: {id: {equals: parseInt(reviewId)}}}})
            if (review) {
                return json(
                    {
                        id: review.id, 
                        title: review.title, 
                        body: review.body, 
                        name: review.name, 
                        rating: review.rating.toString(), 
                        media: await Promise.all(review.media.map(
                            async (s3Url) => { 
                                const response = await fetch(s3Url)
                                const blob = await response.blob()
                                return new File([blob], s3Url.split('.com/')[1], {type: blob.type})
                             })
                        )
                    })
            }
            return redirect('/app/reviews')
        }

        return redirect('/app/reviews')
    
    } catch (error) {

        console.log(error)
        
    }

}

export const action = async ({ request } : ActionFunctionArgs) => {

    const data = await request.json()

    const id = data.state.id

    delete data.state['id']

    const rating = parseInt(data.state.rating)

    return await db.productReview.update({where: {id}, data: {...data.state, rating}})

}

export default function Review() {

    const review = useLoaderData<typeof loader>()

    const navigate = useNavigate()

    const [state, setState] = useState(review)
    const [cleanState, setCleanState] = useState(review)

    const isStateClean = JSON.stringify(state) === JSON.stringify(cleanState)

    const submit = useSubmit()

    const handleSave = () => {
        submit(JSON.stringify({state}), {method: 'POST', encType: 'application/json'})
        setCleanState(state)
    }

    const deleteReview = () => {
        submit(JSON.stringify({ids: [review.id]}), {method: 'POST', encType: 'application/json', action: '/api/reviews/admin/delete', navigate: false})
        navigate('/app')
    }

    const fileUpload = !state.media.length && <DropZone.FileUpload actionTitle="Upload Images/Videos" />;

    const handleDrop = (files: File[], acceptedFiles: File[], rejectedFiles: File[]) => {
        const currentUploadedFileNames = state.media.map(file => file.name)
        const newUploadedFiles = acceptedFiles.filter(file => !currentUploadedFileNames.includes(file.name))
        setState({...state, media: [...newUploadedFiles]})
    }

    const uploadedFileMarkup = state.media.map((file, index) => {
        return (
            <div key={index}>
                <BlockStack gap={'200'} inlineAlign="center">
                    <Thumbnail
                    source={window.URL.createObjectURL(file as File)}
                    alt={file.name}
                    />
                    <Text as="p">{file.name}</Text>
                </BlockStack>
            </div>
        )
    })

  return (
    <Page
    title="Review"
    subtitle="Edit or delete review details"
    backAction={{url: '/app/reviews'}}
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
                        onChange={value => setState(prevState => {return {...prevState, name: value}})}
                        placeholder="Reviewer Name" 
                        autoComplete="off" 
                        label="Reviewer Name" />
                        <TextField 
                        value={state.rating} 
                        onChange={value => setState(prevState => {return {...prevState, rating: value}})}
                        placeholder="Star Rating" 
                        label="Star Rating" 
                        autoComplete="off"
                        disabled
                        />
                        <Text as="p" variant="bodyXs">Due to consumer transparency policies, the star rating is uneditable</Text>
                        <TextField 
                        value={state.title} 
                        onChange={value => setState(prevState => {return {...prevState, title: value}})}
                        placeholder="Review Title" 
                        autoComplete="off" 
                        label="Review Title" />
                        <TextField 
                        value={state.body} 
                        onChange={value => setState(prevState => {return {...prevState, body: value}})}
                        placeholder="Review Body" 
                        autoComplete="off" 
                        label="Review Body" />
                    </BlockStack>
                </Card>
            </Layout.Section>
            <Layout.Section variant="oneThird">
                <Card>
                    <Text as="h2" variant="headingMd">
                        {state.media.length}/5 Files Uploaded
                    </Text>
                    <BlockStack gap={'200'}>
                        <DropZone 
                        accept="image/*,video/*"
                        onDrop={handleDrop}
                        disabled={state.media.length === 5}
                        >
                            <div style={{padding: '10px 5px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <InlineStack 
                                align="center"   
                                gap={'500'}
                                >
                                {uploadedFileMarkup}
                                </InlineStack>
                                {fileUpload}
                            </div>
                        </DropZone>
                    </BlockStack>
                </Card>

            </Layout.Section>
            <Layout.Section>
                <PageActions 
                primaryAction={{content: 'Save', disabled: isStateClean, onAction: handleSave}}
                secondaryActions={[{content: 'Delete', destructive: true, onAction: deleteReview}]}
                />
            </Layout.Section>
        </Layout>
        
    </Page>
  )
}