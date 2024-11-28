import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { BlockStack, Card, DropZone, InlineStack, Layout, Page, PageActions, Text, TextField, Thumbnail } from "@shopify/polaris";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' 
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

import db from '../db.server'
import styles from '../styles/Review.module.css'

import { authenticate } from "~/shopify.server";
import { useEffect, useRef, useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";
import { ProductReview } from "~/types/types";

import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

export const loader = async ({ request, params } : LoaderFunctionArgs) => {
    try {

        const { session } = await authenticate.admin(request)

        const reviewId = params.id

        if (reviewId) {
            const review = await db.productReview.findFirst({where: {store: {equals: session.shop}, AND: {id: {equals: parseInt(reviewId)}}}, include: {media: {select: {url: true, name: true}}}})
            if (review) {
                return json(
                    {
                        id: review.id, 
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
        
    }
}

export const action = async ({ request, params } : ActionFunctionArgs) => {
    try {
        const {session} = await authenticate.admin(request)

        const allFormData = await request.formData()
        const newFileData = allFormData.getAll('newFiles')
        const currentFileData = allFormData.getAll('currentFileKeys')
    
        allFormData.delete('currentFileKeys')
        allFormData.delete('newFiles')
        allFormData.delete('id')
    
        const updatedData = Object.fromEntries(allFormData)
        const updatedProductReview = await db.productReview.update({where: {id: Number(params.id)}, data: {...updatedData, rating: parseInt(allFormData.get('rating') as string)}})
    
        if (newFileData.length > 0) {
            // initialize s3Client
            const s3Client = new S3Client({
                region: process.env.AWS_REGION as string,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
                }
            })
        
            // function to upload file using Upload class
            const uploadFileToS3 = async (file: File) => {
                const uploadParams = {
                    client: s3Client,
                    params: {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: `${Date.now()}-${file.name}`,
                        Body: file.stream()
                    }
                }
                const upload = new Upload(uploadParams)
                const result = await upload.done()
                return result
            }
        
            // upload each file logic
            const results = await Promise.all(newFileData.map(async (file) => {
                return await uploadFileToS3(file as File)
            }))   
            
            await Promise.all(results.map(async (result) => {
                if (result.$metadata.httpStatusCode === 200) {
                    const currentMedia = await db.productReviewMedia.findMany({where: {reviewId: {equals: Number(params.id)}}})
                    if (currentMedia.length > 0) {
                        // handle current media logic here
                    } else {
                    // create new product review media record
                        await db.productReviewMedia.create({data: 
                            {
                                store: session.id, 
                                name: result.Location?.split('.com/')[1].split('-')[1] as string,
                                url: result.Location as string,
                                reviewId: updatedProductReview.id
                            }
                    })
                    }
                }
            }))
        }

        return json('success', {status: 200})
        
    } catch (error) {
        return json({error}, {status: 400}) 
    }
}

export default function Review() {

    const review = useLoaderData<typeof loader>()

    const navigate = useNavigate()
    const submit = useSubmit()

    const [state, setState] = useState<ProductReview>(review)
    const [cleanState, setCleanState] = useState(review)

    const uploadedMediaContainerRefs = useRef<HTMLDivElement[]>([])
    const trashCanIconContainerRefs = useRef<HTMLDivElement[]>([])
    const eventListenerFunctions = useRef<any[]>([])

    useEffect(() => {
        uploadedMediaContainerRefs.current.forEach((uploadedMediaContainer, index) => {
            // Check if uploaded media container exists and not null
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
            if (key !== "media") {
                formData.append(key, state[key as keyof ProductReview].toString())
            } else {
                state.media.forEach((media) => {
                    if (media.file) {
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
        submit(JSON.stringify({ids: [review.id]}), {method: 'POST', encType: 'application/json', action: '/api/reviews/admin/delete', navigate: false})
        navigate('/app')
    }

    const fileUpload = !state.media.length && <DropZone.FileUpload actionTitle="Upload Images/Videos" />

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