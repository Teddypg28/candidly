import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { BlockStack, Card, DropZone, InlineStack, Layout, Page, Text, TextField, Thumbnail } from "@shopify/polaris";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' 
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

import db from '../db.server'
import styles from '../styles/Review.module.css'

import { authenticate } from "~/shopify.server";
import { useEffect, useRef, useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";
import { ProductReview } from "~/types/types";

export const loader = async ({ request, params } : LoaderFunctionArgs) => {
    try {
        const { session } = await authenticate.admin(request)
        const reviewId = params.id

        if (reviewId) {
            const review = await db.productReview.findFirst({where: {store: {equals: session.shop}, AND: {id: {equals: reviewId}}}, include: {media: {select: {url: true, name: true}}}, omit: {id: true}})
            if (review) {
                return json(
                    {
                        title: review.title, 
                        body: review.body, 
                        firstName: review.firstName, 
                        rating: review.rating.toString(), 
                        media: review.media
                    })
            }

            return redirect('/app/reviews')
        }

        return redirect('/app/reviews')
    
    } catch (error) {
        console.log(error)
        return redirect('/app/reviews')
    }
}

export default function Review() {

    const review = useLoaderData<typeof loader>()

    const submit = useSubmit()

    const [state, setState] = useState<ProductReview>(review)
    const [cleanState, setCleanState] = useState(review)

    const uploadedMediaContainerRefs = useRef<HTMLDivElement[]>([])
    const trashCanIconContainerRefs = useRef<HTMLDivElement[]>([])
    const eventListenerFunctions = useRef<any[]>([])

    useEffect(() => {
        uploadedMediaContainerRefs.current.forEach((uploadedMediaContainer, index) => {
            // Check if uploaded media container exists (not null)
            if (uploadedMediaContainer) {
                const showTrashCanIcon = (index: number) => trashCanIconContainerRefs.current[index].style.display = 'flex' 
                const hideTrashCanIcon = (index: number) => trashCanIconContainerRefs.current[index].style.display = 'none' 
                const removeMedia = (el: MouseEvent) => {
                    el.stopPropagation()
                    const filteredMedia = state.media.filter(media => media.name !== uploadedMediaContainer.id)
                    console.log(filteredMedia)
                    setState(prevState => {return {...prevState, media: filteredMedia}})
                }

                const showTrashCanIconHandler = () => showTrashCanIcon(index)
                const hideTrashCanIconHandler = () => hideTrashCanIcon(index)

                uploadedMediaContainer.addEventListener('mouseover', showTrashCanIconHandler)
                uploadedMediaContainer.addEventListener('mouseleave', hideTrashCanIconHandler)
                trashCanIconContainerRefs.current[index].addEventListener('click', removeMedia)

                eventListenerFunctions.current[index] = [showTrashCanIconHandler, hideTrashCanIconHandler, removeMedia]
                uploadedMediaContainer.dataset.listeners = "true"
            } 
        })

        return () => {
            uploadedMediaContainerRefs.current.forEach((uploadedMediaContainer, index) => {
                // If container exists and there are already listeners attached, remove them
                if (uploadedMediaContainer && uploadedMediaContainer.dataset.listeners === "true") {
                    uploadedMediaContainer.removeEventListener('mouseover', eventListenerFunctions.current[index][0])
                    uploadedMediaContainer.removeEventListener('mouseleave', eventListenerFunctions.current[index][1])
                    trashCanIconContainerRefs.current[index].removeEventListener('click', eventListenerFunctions.current[index][2])
                    uploadedMediaContainer.dataset.listeners = "false"
                }
            }
        )}

    }, [state.media])

    const isStateClean = JSON.stringify(state) === JSON.stringify(cleanState)

    const handleSave = () => {
        const formData = new FormData()
        Object.keys(state).forEach((key) => {
            if (key !== "media") {
                formData.append(key, state[key as keyof ProductReview].toString())
            } else {
                state.media.forEach((media) => {
                    if (media.file && !media.url) {
                        formData.append('newFiles', media.file)
                    } else {
                        formData.append('currentFileKeys', media.url.split('.com/')[1])
                    }
                })
            }
        })
        
        submit(formData, {method: 'POST', encType: 'multipart/form-data'})
        setCleanState(state)
    }

    const handleDrop = (files: File[], acceptedFiles: File[], rejectedFiles: File[]) => {
        const currentUploadedFileNames = state.media.map(file => file.name)
        const newUploadedFiles = acceptedFiles.filter(file => !currentUploadedFileNames.includes(file.name))
        const newUploadedFileObjects = newUploadedFiles.map(file => {return {name: file.name, url: '', file}})
        setState(prevState => {return {...prevState, media: [...state.media, ...newUploadedFileObjects]}})
    }

    const uploadedFileMarkup = state.media.map((file, index) => {
        return (
            <div ref={(el: HTMLDivElement) => uploadedMediaContainerRefs.current[index] = el} id={file.name} className={styles.uploadedMedia} key={index}>
                <BlockStack gap={'200'} inlineAlign="center">
                    <Thumbnail
                    source={file.file ? window.URL.createObjectURL(file.file) : file.url}
                    alt={file.name}
                    />
                    <Text as="p">{file.name}</Text>
                </BlockStack>
                <div ref={(el: HTMLDivElement) => trashCanIconContainerRefs.current[index] = el} className={styles.trashCanIconContainer}> 
                    <FontAwesomeIcon icon={faTrashCan} color="white" size="3x" />
                </div>
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
            <button onClick={() => setState(cleanState)}></button>
        </SaveBar>
        <Layout>
            <Layout.Section variant="oneHalf">
                <Card>
                    <BlockStack gap={'200'}>
                        <BlockStack gap='200'>
                            <TextField 
                            value={state.firstName} 
                            onChange={value => setState(prevState => {return {...prevState, name: value}})}
                            placeholder="Reviewer Name" 
                            autoComplete="off" 
                            label="Reviewer Name" 
                            disabled
                            />
                            <TextField 
                            value={state.rating} 
                            type="integer"
                            onChange={value => setState(prevState => {return {...prevState, rating: value}})}
                            placeholder="Star Rating" 
                            label="Star Rating" 
                            autoComplete="off"
                            disabled
                            />
                            <TextField 
                            value={state.title} 
                            onChange={value => setState(prevState => {return {...prevState, title: value}})}
                            placeholder="Review Title" 
                            autoComplete="off" 
                            label="Review Title" 
                            disabled
                            />
                            <TextField
                            multiline 
                            value={state.body} 
                            onChange={value => setState(prevState => {return {...prevState, body: value}})}
                            placeholder="Review Body" 
                            autoComplete="off" 
                            label="Review Body" 
                            disabled
                            />
                        </BlockStack>
                        <Text as="p" variant="bodyXs">Due to consumer transparency policies, customer reviews are uneditable</Text>
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
                        id='fileInput'
                        accept="image/*,video/*"
                        onDrop={handleDrop}
                        disabled={true}
                        >
                            <div style={{padding: '10px 5px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <InlineStack 
                                align="center"   
                                gap={'500'}
                                >
                                {uploadedFileMarkup}
                                </InlineStack>
                            </div>
                        </DropZone>
                    </BlockStack>
                </Card>
            </Layout.Section>
        </Layout>
    </Page>
  )
}