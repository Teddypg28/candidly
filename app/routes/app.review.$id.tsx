import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Banner, BlockStack, Card, DropZone, InlineStack, Layout, Page, Text, TextField, Thumbnail } from "@shopify/polaris";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' 
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

import db from '../db.server'
import styles from '../styles/Review.module.css'

import { authenticate } from "~/shopify.server";
import { useEffect, useRef, useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";
import { ProductReview } from "~/types/types";
import notifyCustomerReviewEdits from "~/helpers/email/notifyCustomerReviewEdits";
import { verifyRecords } from "~/helpers/domainVerification/verifyRecords";
import s3Client from "~/utils/s3Client";
import { DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import uploadMedia from "~/helpers/uploadMedia";


export const action = async ({ request, params } : ActionFunctionArgs) => {
    try {
        
        const allFormData = await request.formData()        
        const data = Object.fromEntries(allFormData)

        const productReview = await db.productReview.findFirst({where: {id: {equals: params.id}}})

        if (!productReview) return json('product review not found', {status: 400})

        const charactersUsed = Math.abs(productReview.body.length - (data.body as string).length) + Math.abs(productReview.title.length - (data.title as string).length)

        if (charactersUsed > productReview.characterEditsLeft) {
            return json('not enough character edits left', {status: 400})
        }

        const newFileData = allFormData.getAll('newFiles')
        const currentFileData = allFormData.getAll('currentFileKeys')
        allFormData.delete('currentFileKeys')
        allFormData.delete('newFiles')
        allFormData.delete('id')

        const updatedProductReview = await db.productReview.update({where: {id: params.id}, data: {title: data.title as string, body: data.body as string, characterEditsLeft: productReview.characterEditsLeft - charactersUsed}})
        
        let mediaEdited: null | "both" | "added" | "removed" = null
        // update current file records
        const updateCurrentFiles = async () => {
            const storedFiles = await db.productReviewMedia.findMany({where: {reviewId: {equals: params.id}}})
            const storedFileKeys = storedFiles.map(file => file.url.split('.com/')[1])
            const fileKeysToRemove = storedFileKeys.filter(key => !currentFileData.includes(key as string))
            if (fileKeysToRemove.length > 0) {
                mediaEdited = "removed"
                // remove objects from s3 bucket
                // remove media records from db table
                await Promise.all(fileKeysToRemove.map(async (key) => {
                    const deleteCommand = new DeleteObjectCommand({Bucket: process.env.S3_BUCKET_NAME, Key: key as string})
                    await s3Client.send(deleteCommand)
                    await db.productReviewMedia.deleteMany({where: {url: {endsWith: key as string}}})
                }))
            }
        }
        await updateCurrentFiles()

        // create new file records
        if (newFileData.length > 0) {
            mediaEdited = mediaEdited === "removed" ? "both" : "added"
            uploadMedia(newFileData as File[], updatedProductReview.id)
        }
        
        // send customer a review edit notification email
        const appSettings = await db.appSettings.findFirst({where: {store: {equals: updatedProductReview.store}}})
        let fromAddress = "reviews@trycandidly.app"
        const currentDomain = appSettings?.domain
        if (currentDomain) {
          const verificationStatus = await verifyRecords(currentDomain)
          if (verificationStatus === "Success") fromAddress = `reviews@${currentDomain}`
        }

        const emailData = {
            title: updatedProductReview.title,
            body: updatedProductReview.body,
            customerName: updatedProductReview.firstName,
            customerEmail: updatedProductReview.email,
            storeName: appSettings?.companyName,
            fromAddress,
            mediaEdited
        }
        
        await notifyCustomerReviewEdits(emailData)

        return json('success', {status: 200})
        
    } catch (error) {
        console.log(error)
        return json({error}, {status: 400}) 
    }
}

export const loader = async ({ request, params } : LoaderFunctionArgs) => {
    try {
        const { session } = await authenticate.admin(request)
        const reviewId = params.id

        if (reviewId) {
            const review = await db.productReview.findFirst({where: {store: {equals: session.shop}, AND: {id: {equals: reviewId}}}, include: {media: {select: {url: true, name: true}}}, omit: {id: true}})
            if (review) {
                return json(
                    {
                        originalState: {
                            title: review.title, 
                            body: review.body, 
                            firstName: review.firstName, 
                            rating: review.rating, 
                            media: review.media,
                            characterEditsLeft: review.characterEditsLeft
                        },
                        date: review.date
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

    const [state, setState] = useState<ProductReview>(review.originalState)
    const [cleanState, setCleanState] = useState(review.originalState)

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
            if (key.includes("title") || key.includes("body")) {
                formData.append(key, state[key as keyof ProductReview].toString())
            } else if (key.includes("media")) {
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

    const handleReviewEdit = (value: string, property: string) => {
        if (state.characterEditsLeft > 0) {
            const currentValue = state[property as keyof typeof state] as string;
            
            const changeSize = Math.abs(currentValue.length - value.length);

            if (changeSize > state.characterEditsLeft) return;

            setState(prevState => {
                const prevValue = prevState[property as keyof typeof prevState] as string;
        
                const updatedCharacterEditsLeft = prevState.characterEditsLeft - Math.abs(prevValue.length - value.length);
        
                return {
                    ...prevState,
                    [property]: value,
                    characterEditsLeft: updatedCharacterEditsLeft
                };
            });
        }
    }

    useEffect(() => {
        if (state.body === cleanState.body && state.title === cleanState.title) {
            setState(prevState => {return {...prevState, characterEditsLeft: cleanState.characterEditsLeft}})
        }
    })

  return (
    <Page
    title="Review"
    backAction={{url: '/app/reviews'}}
    >
        <SaveBar open={!isStateClean}>
            <button variant='primary' onClick={handleSave}></button>
            <button onClick={() => setState(cleanState)}></button>
        </SaveBar>
        <BlockStack gap='200'>
            <Banner title="Editing Reviews">To comply with consumer transparency policies, you are able to edit reviews with a few restrictions. When a review is edited, an email will be sent to the original reviewer and you can only change 30 characters total, including spaces and deletions.</Banner>
            <Layout>
                <Layout.Section variant="oneHalf">
                    <Card>
                        <BlockStack gap={'200'}>
                            <BlockStack gap='200'>
                                <TextField 
                                value={new Date(review.date).toLocaleDateString()} 
                                autoComplete="off" 
                                label="Date Submitted" 
                                disabled
                                />
                                <TextField 
                                value={state.firstName} 
                                placeholder="Reviewer Name" 
                                autoComplete="off" 
                                label="Reviewer Name" 
                                disabled
                                />
                                <TextField 
                                value={state.rating.toString()} 
                                type="integer"
                                placeholder="Star Rating" 
                                label="Star Rating" 
                                autoComplete="off"
                                disabled
                                />
                                <TextField 
                                value={state.title} 
                                placeholder="Review Title" 
                                onChange={value => handleReviewEdit(value, "title")}
                                autoComplete="off" 
                                label="Review Title" 
                                />
                                <TextField
                                multiline 
                                value={state.body} 
                                onChange={value => handleReviewEdit(value, "body")}
                                placeholder="Review Body" 
                                autoComplete="off" 
                                label="Review Body" 
                                />
                            </BlockStack>
                            <Text tone="caution" as="p" variant="bodySm">You currently have {state.characterEditsLeft} character edits left</Text>
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
            </Layout>
        </BlockStack>
    </Page>
  )
}