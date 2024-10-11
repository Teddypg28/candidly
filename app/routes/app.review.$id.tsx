import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { BlockStack, Card, Layout, Page, PageActions, Text, TextField } from "@shopify/polaris";

import db from '../db.server'
import { authenticate } from "~/shopify.server";
import { useEffect, useRef, useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";

import styles from '../styles/ImportMedia.module.css'

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

    useEffect(() => {

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css'

        document.body.appendChild(link)

        const uploadMediaContainer = document.querySelector('#uploadMediaContainer') as HTMLElement

        const active = () => uploadMediaContainer.style.border = '2px dotted darkgray'
        const inactive = () => uploadMediaContainer.style.border = '2px dotted lightgray'

        uploadMediaContainer.addEventListener('dragover', active)

        const leaveEvents = ['mouseleave', 'dragleave', 'drop']

        leaveEvents.forEach(event => {
            uploadMediaContainer.addEventListener(event, inactive)
        })

        return () => {
            
            leaveEvents.forEach(event => {
                uploadMediaContainer.removeEventListener(event, inactive)
            })

            uploadMediaContainer.removeEventListener('dragover', active)

            document.body.removeChild(link)

        }

    }, [])

    const review = useLoaderData<typeof loader>()

    const navigate = useNavigate()

    const [state, setState] = useState(review)
    const [cleanState, setCleanState] = useState(review)
    const [uploadState, setUploadState] = useState({errors: false, files: null as File[] | null})
    const [filesToSave, setFilesToSave] = useState<File[]>([])

    const filesToSaveRef = useRef<File[]>([])

    const truncateFileName = (name: string) => {

        if (name.length <= 13) {
            return name
        }

        return name.slice(0, 10) + '...'

    }

    useEffect(() => {

            const inputElement = document.querySelector('input[id="uploadMedia"]') as any

            const uploadFiles = async (files: File[]) => {

                await Promise.all(files.map((file: File) => {

                    return new Promise((resolve, reject) => {

                        try {
                            
                            if (!filesToSaveRef.current.find(uploadedFile => uploadedFile.name === file.name)) {

                                // Add file to ref and update file list on input element with all of the files since file list changes
                                // if user drags and drops multiple sets of files

                                filesToSaveRef.current = [...filesToSaveRef.current, file]

                                const dt = new DataTransfer()
                                                                
                                filesToSaveRef.current.forEach((file: File) => {
                        
                                    dt.items.add(file)

                                })
                        
                                inputElement.files = dt.files
                                
                                const reader = new FileReader()
        
                                reader.readAsDataURL(file)

                                reader.onloadend = () => {
                                                                
                                        const uploadedMediaContainer = document.querySelector('#uploadedMedia') as HTMLElement
                        
                                        const figure = document.createElement('figure')
                                        figure.style.height = '60px'
                                        figure.style.width = '60px'
                                        figure.style.margin = '0px'
                                        figure.style.marginBottom = '5px'
                                        figure.style.padding = '0px'
                                        figure.style.border = '1px solid lightgray'
                                        figure.style.borderRadius = '2px'
                                        figure.style.display = 'flex'
                                        figure.style.flexDirection = 'column'
                                        figure.style.alignItems = 'center'
                                        figure.style.cursor = 'pointer'
                                        figure.style.gap = '1px'
                                        figure.style.position = 'relative'
                    
                                        const img = document.createElement('img')
                                        img.src = reader.result as string
                                        img.style.height = '100%'
                                        img.style.width = '100%'
                    
                                        const removeUploadedMediaItemContainer = document.createElement('div')
    
                                        const trashCanIcon = document.createElement('i')
                                        trashCanIcon.className = 'fa-solid fa-trash-can fa-2xl'
                                        trashCanIcon.style.color = 'white'
                                        
                                        removeUploadedMediaItemContainer.appendChild(trashCanIcon)
                            
                                        removeUploadedMediaItemContainer.id = file.name
                                        removeUploadedMediaItemContainer.className = 'removeUploadedMediaItem'
                                        removeUploadedMediaItemContainer.style.position = 'absolute'
                                        removeUploadedMediaItemContainer.style.display = 'none'
                                        removeUploadedMediaItemContainer.style.alignItems = 'center'
                                        removeUploadedMediaItemContainer.style.justifyContent = 'center'
                                        removeUploadedMediaItemContainer.style.height = '100%'
                                        removeUploadedMediaItemContainer.style.width = '100%'
                                        removeUploadedMediaItemContainer.style.backgroundColor = 'rgb(0, 0, 0, 0.7)'
                                
                                        figure.appendChild(img)
                                        figure.appendChild(removeUploadedMediaItemContainer)
                                        figure.innerHTML += `
                                        <figcaption style="font-size: 9px; width: fit-content">${truncateFileName(file.name)}</figcaption>` 
                
                                        uploadedMediaContainer.appendChild(figure)  
                                        uploadedMediaContainer.style.display = 'flex'
                    
                                        const removeUploadedMediaItemContainerEl = document.getElementById(file.name)
                                    
                                        if (removeUploadedMediaItemContainerEl) {
    
                                            removeUploadedMediaItemContainerEl.addEventListener('click', () => {

                                                // Remove deleted file from ref
    
                                                filesToSaveRef.current = filesToSaveRef.current.filter(uploadedFile => uploadedFile !== file)
                                                                                                
                                                setFilesToSave(filesToSaveRef.current)

                                                // Remove deleted file from file list
    
                                                const dt = new DataTransfer()
                                                                                
                                                Array.from(inputElement?.files).forEach((mediaFile: any) => {
                                        
                                                    if (mediaFile.name !== file.name) {
                                                        dt.items.add(mediaFile)
                                                    }
                                                })
                                        
                                                inputElement.files = dt.files

                                                // Remove image from uploadedImageContainer
                                                
                                                figure.remove()
                                        
                                                const uploadedMediaContainer = document.querySelector('#uploadedMedia') as HTMLElement
                                        
                                                if (filesToSaveRef.current.length === 0 && uploadedMediaContainer) {
                                        
                                                    uploadedMediaContainer.style.display = 'none'
                                        
                                                }
    
                                            })
                    
                                            figure.addEventListener('mouseover', () => {
                            
                                                removeUploadedMediaItemContainerEl.style.display = 'flex'
                        
                                            })     
                        
                                            figure.addEventListener('mouseleave', () => {
                        
                                                removeUploadedMediaItemContainerEl.style.display = 'none'
                         
                                            })   
                                        
                                    }    
    
                                    resolve(true)
    
                                }
                            } else {

                                resolve(false)

                            }

                            
                        } catch (error) {

                            reject(error)
                            
                        }

                    })

                }))
            }

            if (uploadState.files) {
                
                uploadFiles(uploadState.files).then(() => {
                    
                    setFilesToSave([...filesToSaveRef.current])

                })

            }

    }, [uploadState.files])

    const isStateClean = JSON.stringify(state) === JSON.stringify(cleanState)

    const submit = useSubmit()

    const handleSave = () => {

        submit(JSON.stringify({state}), {method: 'POST', encType: 'application/json'})

        setCleanState(state)

    }

    const verifyFiles = (files: any[]) => {

        let result = true

        for (let i = 0; i<files.length; i++) {

            if (files[i].type.split('/')[0] !== 'image' && files[i].type.split('/')[0] !== 'video') {
    
                result = false
                break
            
            } 

        }

        return result

    }

    const handleFileUpload = (e: any) => {

        const files: any = Array.from(e.target.files)

        const areFilesReady = verifyFiles(files)

        if (!areFilesReady) {
            
            setUploadState({errors: true, files: null})

        } else {

            setUploadState({errors: false, files})

        }

    }

    const deleteReview = () => {

        submit(JSON.stringify({ids: [review.id]}), {method: 'POST', encType: 'application/json', action: '/api/reviews/admin/delete', navigate: false})
        navigate('/app')

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
                        <TextField 
                        value={state.rating} 
                        onChange={value => setState({...state, rating: value})}
                        placeholder="Star Rating" 
                        label="Star Rating" 
                        autoComplete="off"
                        disabled
                        />
                        <Text as="p" variant="bodyXs">Due to consumer transparency policies, the star rating is uneditable</Text>
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
            <Layout.Section variant="oneThird">
                <Card>
                    <BlockStack gap={'200'}>
                        <Text as="h1" variant="headingLg">Media ({filesToSave.length} / 5)</Text>
                        <div id="uploadMediaContainer" className={styles.container}>
                            <label id="uploadMedia" className={styles.label}>
                                Upload Images or Videos
                                <input disabled={filesToSave.length === 5} onChange={handleFileUpload} className={styles.input} id="uploadMedia" type="file" multiple accept="image/*, video/*" />
                            </label>
                        </div>
                        <div id='uploadedMedia' className={styles.uploadedMedia}></div>
                       {uploadState.errors && <Text as="p" tone="critical">Only Image and Video Files are Accepted</Text>}
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

