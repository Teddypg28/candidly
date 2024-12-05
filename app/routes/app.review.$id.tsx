import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { BlockStack, Card, DropZone, InlineStack, Layout, Page, PageActions, Text, TextField, Thumbnail } from "@shopify/polaris";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' 
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

import db from '../db.server'
import styles from '../styles/Review.module.css'

import { authenticate } from "~/shopify.server";
import { useEffect, useRef, useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";
import { ProductReview } from "~/types/types";

import s3Client from "~/utils/s3Client";

import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'
import uploadImageToS3 from "~/utils/uploadImageToS3";

export const loader = async ({ request, params } : LoaderFunctionArgs) => {

    try {
        const { session } = await authenticate.admin(request)
        const reviewId = params.id

        if (reviewId) {
            const review = await db.productReview.findFirst({where: {store: {equals: session.shop}, AND: {id: {equals: parseInt(reviewId)}}}, include: {media: {select: {url: true, name: true}}}, omit: {id: true}})
            if (review) {
                return json(
                    {
                        title: review.title, 
                        body: review.body, 
                        name: review.name, 
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

export const action = async ({ request, params } : ActionFunctionArgs) => {
    try {
        const allFormData = await request.formData()
        const action = allFormData.get('action')
        if (action === 'delete') {
            // get media s3 bucket keys from db record urls and then remove them from s3 bucket
            const reviewMediaRecords = await db.productReviewMedia.findMany({where: {reviewId: {equals: Number(params.id)}}})
            await Promise.all(reviewMediaRecords.map(async (record) => {
                const bucketKey = record.url.split('.com/')[1]
                const deleteCommand = new DeleteObjectCommand({Bucket: process.env.S3_BUCKET_NAME, Key: bucketKey})
                return await s3Client.send(deleteCommand)
            }))
            // delete the review
            await db.productReview.delete({where: {id: Number(params.id)}})
            return redirect('/app/reviews')
        } 

        const newFileData = allFormData.getAll('newFiles')
        const currentFileData = allFormData.getAll('currentFileKeys')
        allFormData.delete('currentFileKeys')
        allFormData.delete('newFiles')
        allFormData.delete('id')
    
        // update product review data first, then media
        const updatedData = Object.fromEntries(allFormData)
        const updatedProductReview = await db.productReview.update({where: {id: Number(params.id)}, data: {...updatedData, rating: parseInt(allFormData.get('rating') as string)}})

        const updateCurrentFiles = async () => {
            const command = new ListObjectsV2Command({Bucket: process.env.S3_BUCKET_NAME})
            const data = await s3Client.send(command)
            const storedFiles = data.Contents || []
            const filesToRemove = storedFiles.filter(file => !currentFileData.includes(file.Key as string))
            if (filesToRemove.length > 0) {
                // remove objects from s3 bucket
                // remove media records from db table
                await Promise.all(filesToRemove.map(async (file) => {
                    const deleteCommand = new DeleteObjectCommand({Bucket: process.env.S3_BUCKET_NAME, Key: file.Key as string})
                    await s3Client.send(deleteCommand)
                    const productReviewMedia = await db.productReviewMedia.findMany({where: {url: {contains: file.Key as string}}})
                    await db.productReviewMedia.delete({where: {id: productReviewMedia[0].id}})
                }))
            }
        }

        await updateCurrentFiles()

        if (newFileData.length > 0) {
            // upload each new file logic
            const results = await Promise.all(newFileData.map(async (file) => {
                return await uploadImageToS3(file as File)
            }))   
            
            await Promise.all(results.map(async (result) => {
                if (result.$metadata.httpStatusCode === 200) {
                    // create new product review media record
                        await db.productReviewMedia.create({data: 
                            {
                                name: result.Location?.split('.com/')[1].split('-timestamp-separator-')[1] as string,
                                url: result.Location as string,
                                reviewId: updatedProductReview.id
                            }
                    })
                }
            }))
        }

        return json('success', {status: 200})
        
    } catch (error) {
        console.log(error)
        return json({error}, {status: 400}) 
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

    const deleteReview = () => {
        submit({action: 'delete'}, {method: 'POST'})
    }

    const fileUploadBtn = !state.media.length && <DropZone.FileUpload actionTitle="Upload Images/Videos" />

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
                    <BlockStack gap='200'>
                        <TextField 
                        value={state.name} 
                        onChange={value => setState(prevState => {return {...prevState, name: value}})}
                        placeholder="Reviewer Name" 
                        autoComplete="off" 
                        label="Reviewer Name" />
                        <TextField 
                        value={state.rating} 
                        type="integer"
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
                        id='fileInput'
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
                                {fileUploadBtn}
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