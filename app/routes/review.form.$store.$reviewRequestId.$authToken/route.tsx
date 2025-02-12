import { LoaderFunctionArgs, redirect } from "@remix-run/node";

import db from '../../db.server'
import { useLoaderData } from "@remix-run/react";

import styles from '../../styles/ReviewPreview.module.css'
import { useEffect, useRef, useState } from "react";
import { ReviewFormSettings } from "@prisma/client";
import fetchRewardTiers from "~/helpers/fetchRewardTiers";

export const loader = async ({ params } : LoaderFunctionArgs) => {

    const store = params.store as string
    const reviewRequestId = params.reviewRequestId as string
    const authToken = params.authToken as string

    const reviewRequest = await db.reviewRequest.findFirst({where: {id: {equals: parseInt(reviewRequestId)}, AND: {store: {equals: store}, authToken: {equals: authToken}}}})

    if (!reviewRequest) return redirect('/')
    
    const formSettings = await db.reviewFormSettings.findFirst({where: {store: {equals: `${store}.myshopify.com`}}, omit: {id: true}}) as ReviewFormSettings
    const rewardsTiers = await fetchRewardTiers(`${store}.myshopify.com`) as string[]

    return {formSettings, rewardsTiers}
}

export default function ReviewForm() {

    const data = useLoaderData<typeof loader>()

    // state to track customer input
    const [firstName, setFirstName] = useState('Teddy')
    const [email, setEmail] = useState('teddypg02@gmail.com')
    const [reviewBody, setReviewBody] = useState('')
    const [reviewHeadline, setReviewHeadline] = useState('')
    const [uploadedMedia, setUploadedMedia] = useState<any>([])

    const rating = useRef(5)
    const uploadedMediaRef = useRef<any>([])

    const [uploadMediaError, setUploadMediaError] = useState('')

    const reviewHeadlineWordList = reviewHeadline.trim().split(/\s+/).filter(word => word !== "")
    let reviewHeadlineTier
    let reviewHeadlineStatusColor

    if (reviewHeadlineWordList.length <= 3) {
        reviewHeadlineTier = 1
    } else if (reviewHeadlineWordList.length > 3 && reviewHeadlineWordList.length <= 9) {
        reviewHeadlineTier = 2
    } else {
        reviewHeadlineTier = 3
        reviewHeadlineStatusColor = "#67af98"
    }

    const reviewBodyWordList = reviewBody.trim().split(/\s+/).filter(word => word !== "")

    let reviewBodyTier
    let reviewBodyStatusColor = data?.formSettings.primaryFormColor

    if (reviewBodyWordList.length <= 14) {

        reviewBodyTier = 1

    } else if (reviewBodyWordList.length > 14 && reviewBodyWordList.length <= 39) {

        reviewBodyTier = 2

    } else {

        reviewBodyTier = 3
        reviewBodyStatusColor = '#67af98'

    }

    let uploadedMediaTier
    let uploadedMediaStatusColor = data.formSettings.primaryFormColor

    if (uploadedMediaRef.current.length === 0) {
        uploadedMediaTier = 1
    } else if (uploadedMediaRef.current.length > 0 && uploadedMediaRef.current.length <= 1) {
        uploadedMediaTier = 2
    } else {
        uploadedMediaTier = 3
        uploadedMediaStatusColor = "#67af98"
    }

    const reviewScoreTier = Math.floor((reviewHeadlineTier + reviewBodyTier + uploadedMediaTier) / 3)
    const rewards = [data.rewardsTiers[0], data.rewardsTiers[1], data.rewardsTiers[2]]
    const noRewardsConfigured = rewards.every(reward => reward === "No Reward")

    const renderStars = (rating: number) => {
        for (let i = 1; i<=5; i++) {
            if (i <= rating) {
                (document.querySelector(`#star${i}`) as HTMLElement).style.fill = data.formSettings.primaryFormColor
            } else {
                (document.querySelector(`#star${i}`) as HTMLElement).style.fill = '#e8e8e8'
            }
        }
    }

    data !== null && 

        useEffect(() => {
    
            const mouseoverFunction = (e: any) => {
                const rating = parseInt(e.currentTarget.dataset.rating)
                renderStars(rating)
            }
    
            const mouseleaveFunction = () => {
                renderStars(rating.current)
            }
    
            const clickFunction = (e: any) => {
                rating.current = parseInt(e.currentTarget.dataset.rating)
                renderStars(rating.current)
            }
    
            document.querySelectorAll('#reviewFormStar').forEach((star) => {
                star.addEventListener('mouseover', mouseoverFunction)
                star.addEventListener('mouseleave', mouseleaveFunction)
                star.addEventListener('click', clickFunction)
            })
    
            return () => {
    
                document.querySelectorAll('#reviewFormStar').forEach((star) => {
                    star.removeEventListener('mouseover', mouseoverFunction)
                    star.removeEventListener('mouseleave', mouseleaveFunction)
                    star.removeEventListener('click', clickFunction)
                })
            }
    
        }, [data.formSettings.primaryFormColor])

    
        data !== null && useEffect(() => {
            renderStars(rating.current)
        }, [data.formSettings.primaryFormColor])
    
       data !== null && useEffect(() => {
    
            try {
    
                const fontAwesomeScriptTag = document.createElement('link')
                fontAwesomeScriptTag.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
                fontAwesomeScriptTag.rel = "stylesheet"
                document.head.appendChild(fontAwesomeScriptTag)
    
                const uploadMediaBtn = document.querySelector('#uploadMediaBtn') as any
                const uploadedMediaContainer = document.querySelector('#uploadedMediaContainer') as any
    
                const uploadMediaContainer = document.querySelector("#uploadMediaContainer") as any
                uploadMediaContainer.addEventListener('dragover', () => {
                    uploadMediaContainer.style.border = '2px dotted black'
                });
                ['dragleave', 'drop'].forEach(event => {
                    uploadMediaContainer.addEventListener(event, () => {
                        uploadMediaContainer.style.border = '2px dotted lightgray'
                    })
                });
    
                const verifyFileType = (file: any) => {
            
                    if (file.type.split('/')[0] !== 'image' && file.type.split('/')[0] !== 'video') {
                        return setUploadMediaError('Only image or video files are allowed')
                    } 
            
                    setUploadMediaError('')
            
                    // Verify no duplicate files are being added -- uses array to verify since file list changes if multiple drag and drops are used
            
                    if (!uploadedMediaRef.current.find((uploadedFile: any) => uploadedFile.name === file.name)) {
            
                        // Push files to saved uploaded files array and update input element file list
                        // since file list changes if user drags and drops multiple sets of files
    
                        uploadedMediaRef.current = [...uploadedMediaRef.current, file]
                        setUploadedMedia(uploadedMediaRef.current)
            
                        const reader = new FileReader()
            
                        reader.readAsDataURL(file)
            
                        reader.onloadend = () => {
            
                            const imageContainer = document.createElement('figure')
                            imageContainer.className = styles.uploadedImage
            
                            const img = document.createElement('img') as any
                            img.src = reader.result
                            
                            imageContainer.appendChild(img)
                            imageContainer.innerHTML += `<figcaption>${file.name}</figcaption>`
            
                            const removeUploadedMediaContainer = document.createElement('div')
                            removeUploadedMediaContainer.className = styles.removeUploadedMediaContainer
                            removeUploadedMediaContainer.id = 'removeUploadedMediaContainer deleteMedia'
                            removeUploadedMediaContainer.dataset.fileName = file.name
            
                            const trashCanIconContainer = document.createElement('div')
                            trashCanIconContainer.className = styles.removeUploadedMedia
                            trashCanIconContainer.className = styles.hidden
                            trashCanIconContainer.dataset.fileName = file.name
            
                            const trashCanIcon = document.createElement('i')
                            trashCanIcon.className = "fa-solid fa-trash-can fa-2xl"
                            trashCanIcon.id = "deleteMedia"
                            trashCanIcon.dataset.fileName = file.name
                            trashCanIcon.style.color = "#ffffff"
            
                            trashCanIconContainer.appendChild(trashCanIcon)
            
                            removeUploadedMediaContainer.appendChild(trashCanIconContainer)
            
                            removeUploadedMediaContainer.addEventListener('mouseover', () => {
                                
                                removeUploadedMediaContainer.style.backgroundColor = 'rgb(0, 0, 0, 0.6)'
                                trashCanIconContainer.classList.remove(styles.hidden)
            
                            })
            
                            removeUploadedMediaContainer.addEventListener('mouseleave', () => {
                                
                                removeUploadedMediaContainer.style.backgroundColor = 'transparent'
                                trashCanIconContainer.classList.add(styles.hidden)
            
                            })
            
                            removeUploadedMediaContainer.addEventListener('click', (e: any) => {
                                
                                if (e.target.id.includes('deleteMedia')) { 
                                    
                                    // Remove deleted file from file list
                                    
                                    const dt = new DataTransfer()
    
                                    const currentFiles = Array.from(uploadMediaBtn.files)
    
                                    currentFiles.forEach((file: any) => {
                                        if (file.name !== e.target.dataset.fileName) {
                                            dt.items.add(file)
                                        }
                                    })
    
                                    uploadMediaBtn.files = dt.files
            
                                    // Remove deleted files from saved uploaded files array
            
                                    uploadedMediaRef.current = uploadedMediaRef.current.filter((uploadedFile: any) => uploadedFile !== file)
                                    setUploadedMedia(uploadedMediaRef.current)
    
                                    imageContainer.remove()
            
                                }
                            })
            
                            imageContainer.appendChild(removeUploadedMediaContainer)
                            uploadedMediaContainer.appendChild(imageContainer)
            
                        }
                    }
                }
            
                if (uploadMediaBtn) {
                    uploadMediaBtn.addEventListener('change', () => {
                        Array.from(uploadMediaBtn.files).forEach(verifyFileType)
                    })
                }
                
            } catch (error) {
    
                console.log(error)
                
            }
    
        }, [])

    return data !== null ? (
            
                <div className={styles.reviewForm}>
                    <div className={styles.reviewFormHeadingContainer}>
                        <h1 style={{margin: 0, padding: 0, fontSize: '26px'}}>{data.formSettings.heading}</h1>
                        <p style={{margin: 0, padding: 0, marginTop: '10px'}}>{data.formSettings.subheading}</p>
                    </div>
                    <div style={{display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px'}}>
                        <div style={{border: '1px solid black', borderRadius: '10px', width: '75px', height: '75px', overflow: 'hidden'}}>
                            <img src={undefined} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                            <p style={{padding: 0, margin: 0}}>{'Sample Product Title'}</p>
                            <div className={styles.reviewFormStarsContainer} style={{padding: 0, margin: 0}}>
                                <svg id="reviewFormStar" data-rating="1" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                    <path id="star1" fill={data.formSettings.primaryFormColor} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                                </svg>
                                <svg id="reviewFormStar" data-rating="2" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                    <path id="star2" fill={data.formSettings.primaryFormColor} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                                </svg>
                                <svg id="reviewFormStar" data-rating="3" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                    <path id="star3" fill={data.formSettings.primaryFormColor} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                                </svg>
                                <svg id="reviewFormStar" data-rating="4" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                    <path id="star4" fill={data.formSettings.primaryFormColor} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                                </svg>
                                <svg id="reviewFormStar" data-rating="5" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                    <path id="star5" fill={data.formSettings.primaryFormColor} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className={styles.reviewFieldWrapper}>
                        <label> Give it a Headline * </label>
                        <div style={{position: 'relative'}}>
                            <input value={reviewHeadline} onChange={(e) => setReviewHeadline(e.target.value)} name='title' placeholder={data.formSettings.headlinePlaceholder} />
                            {!noRewardsConfigured && reviewHeadlineTier === 3 && 
                            <div className={styles.characterCountContainer} style={{backgroundColor: reviewHeadlineStatusColor}}>
                                <span>Perfect!</span>
                            </div>}
                        </div>
                    </div>
                    <div style={{marginBottom: '10px'}}>
                        <div style={{borderRadius: '5px', width: '100%', height: '17px', backgroundColor: '#e2e2e2', overflow: 'hidden'}}>
                            <div className={styles.progressBar} style={{backgroundColor: reviewHeadlineTier === 3 ? '#67af98' : data.formSettings.primaryFormColor, height: '100%', width: `${Math.round(reviewHeadlineWordList.length / 10 * 100)}%`}}> </div>
                        </div>
                        <p style={{margin: 0, padding: 0, marginTop: 5, fontSize: '14px', color: reviewHeadlineTier == 3 ? reviewHeadlineStatusColor : 'black'}}>{reviewHeadlineTier === 3 ? "You wrote a perfect headline!" : `You are ${Math.round(reviewHeadlineWordList.length / 10 * 100)}% of the way to writing the perfect headline`}</p>
                    </div>
                    <div className={styles.reviewFieldWrapper}>
                        <label>Review *</label>
                        <div style={{position: 'relative'}}>
                            <textarea value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} name='body' className={styles.reviewTextArea} placeholder={data.formSettings.reviewPlaceholder} />
                            {!noRewardsConfigured && reviewBodyTier === 3 && 
                            <div className={styles.characterCountContainer} style={{backgroundColor: reviewBodyStatusColor}}>
                                <span>Perfect!</span>
                            </div>}
                        </div>
                    </div>
                    <div>
                        <div style={{borderRadius: '5px', width: '100%', height: '17px', backgroundColor: '#e2e2e2', overflow: 'hidden'}}>
                            <div className={styles.progressBar} style={{backgroundColor: reviewBodyTier === 3 ? '#67af98' : data.formSettings.primaryFormColor, height: '100%', width: `${Math.round(reviewBodyWordList.length / 40 * 100)}%`}}> </div>
                        </div>
                        <p style={{margin: 0, padding: 0, marginTop: 5, fontSize: '14px', color: reviewBodyTier == 3 ? reviewBodyStatusColor : 'black'}}>{reviewBodyTier !== 3 ? `You are ${Math.round(reviewBodyWordList.length / 40 * 100)}% of the way to writing the perfect body` : "You wrote the perfect body!"}</p>
                    </div>
                    <div className={styles.reviewNameEmailWrapper}>
                        <div className={styles.reviewNameEmailContainer}>
                            <label>Your First Name *</label>
                            <input type='name' name='name' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div className={styles.reviewNameEmailContainer}>
                            <label>Your Email Address *</label>
                            <input type='email' name='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>
                    <div id="uploadMediaContainer" className={styles.uploadMediaContainer}>
                        <label className={styles.uploadMediaLabel}>
                            <p>Upload Media</p>
                            <svg viewBox="0 0 1024 1024" className={styles.uploadIcon} version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M220.5 245.4c-32.8 32.8-55.1 73.2-65.2 117.3h16.5c18.8-75.3 75.1-135.9 148-160.7v-16.9c-37.1 11.6-71 32-99.3 60.3z" fill="#000000"></path><path d="M959.9 540.8c0 113.6-92.1 205.8-205.7 205.9H590.9v-44h163.3c43.2 0 83.8-16.9 114.3-47.4 30.6-30.6 47.4-71.2 47.4-114.5 0-43.2-16.8-83.9-47.4-114.4S797.2 379 754 379c-11.5 0-22.8 1.2-33.8 3.5-15 3.2-29.4 8.4-42.8 15.7-1-15.4-3.3-30.7-6.8-45.6v-0.1c-3.6-15.6-8.6-30.8-14.9-45.7-14.4-33.9-34.9-64.4-61.1-90.6-26.2-26.2-56.6-46.7-90.6-61.1-35.1-14.8-72.4-22.4-110.9-22.4s-75.8 7.5-110.9 22.4c-33.9 14.3-64.4 34.9-90.6 61.1-26.2 26.2-46.7 56.7-61.1 90.6-14.9 35.1-22.4 72.4-22.4 110.9s7.5 75.8 22.4 110.9c14.3 33.9 34.9 64.4 61.1 90.6 26.2 26.2 56.7 46.7 90.6 61.1 35.1 14.8 72.4 22.4 110.9 22.4h39.7v44h-41C210.7 746 64.1 599 64.1 417.7c0-181.7 147.3-329 329-329 154.6 0 284.3 106.6 319.5 250.3v0.1c13.4-2.7 27.2-4.2 41.4-4.2 113.7 0.1 205.9 92.2 205.9 205.9z" fill="#39393A"></path><path d="M692.9 636.1h-22.6L519.8 485.6v449.6h-16V485.8L353.4 636.1h-22.6l181-181z" fill="#000000"></path></g></svg>            
                        </label>
                        <div id="uploadedMediaContainer" className={styles.uploadedMediaContainer}></div>
                        <input type='file' id='uploadMediaBtn' className={styles.uploadMediaBtn} accept='image/*, video/*' multiple />
                        {!noRewardsConfigured && uploadedMediaTier === 3 && 
                        <div className={styles.characterCountContainer} style={{backgroundColor: uploadedMediaStatusColor, bottom: '5px'}}>
                            <span>Perfect!</span>
                        </div>}
                    </div>
                    {uploadMediaError && <p style={{color: 'darkred', padding: 0, margin: 0, fontSize: '14px'}}>{uploadMediaError}</p>}
                    {!noRewardsConfigured && 
                    <>
                        <div>
                            <div style={{borderRadius: '5px', width: '100%', height: '17px', backgroundColor: '#e2e2e2', overflow: 'hidden'}}>
                                <div className={styles.progressBar} style={{backgroundColor: uploadedMediaTier === 3 ? '#67af98' : data.formSettings.primaryFormColor, height: '100%', width: `${Math.round(uploadedMediaRef.current.length / 2 * 100)}%`}}> </div>
                            </div>
                            <p style={{margin: 0, padding: 0, marginTop: 5, fontSize: '14px', color: uploadedMediaTier == 3 ? uploadedMediaStatusColor : 'black'}}>{uploadedMediaTier === 3 ? "You uploaded the perfect amount of media!" : `You are ${Math.round(uploadedMediaRef.current.length / 2 * 100)}% of the way to the perfect media upload`}</p>
                        </div>
                        <hr style={{width: '100%', backgroundColor: 'lightgray', border: 'none', height: '0.20px'}} />
                        <div>
                            <p style={{fontWeight: 'bold', margin: 0}}>Reward Tiers</p>
                            <p style={{margin: 0, marginTop: '3px', fontSize: '14px'}}>The better your review, the better your reward</p>
                        </div>
                        <div>
                            <div className={styles.rewardTiersContainer}>
                                <div className={styles.rewardTierOne} style={{backgroundColor: reviewScoreTier === 1 ? data.formSettings.primaryFormColor : 'lightgray', filter: reviewScoreTier === 1 ? 'none' : "blur(1px)"}}>
                                    <p style={{fontSize: '13px', fontWeight: 'bold'}}>{rewards[0]}</p>
                                </div>
                                <div className={styles.rewardTierTwo} style={{backgroundColor: reviewScoreTier === 2 ? data.formSettings.primaryFormColor : 'lightgray', filter: reviewScoreTier === 2 ? 'none' : "blur(1px)"}}> 
                                    <p style={{fontSize: '13px', fontWeight: 'bold'}}>{rewards[1]}</p>
                                </div>
                                <div className={styles.rewardTierThree} style={{backgroundColor: reviewScoreTier === 3 ? data.formSettings.primaryFormColor : 'lightgray', filter: reviewScoreTier === 3 ? 'none' : "blur(1px)"}}>
                                    <p style={{fontSize: '13px', fontWeight: 'bold'}}>{rewards[2]}</p>
                                </div>
                            </div>
                        </div> 
                    </>
                    }
                    <button className={styles.submitReviewBtn} style={{backgroundColor: data.formSettings.primaryFormColor}}>Submit Review</button>
                </div>
            
        )
        :

        <div>Unauthorized</div>
}