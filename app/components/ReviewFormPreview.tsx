import { Banner, BlockStack, Card, ProgressBar, Text } from "@shopify/polaris"

import styles from '../styles/ReviewPreview.module.css'
import { useCallback, useEffect, useRef, useState } from "react"

interface Props {
    heading: string,
    subheading: string,
    headlinePlaceholder: string,
    reviewPlaceholder: string,
    primaryColor: string
}

const ReviewFormPreview = ( {heading, subheading, headlinePlaceholder, reviewPlaceholder, primaryColor } : Props ) => {

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
  let reviewBodyStatusColor = primaryColor

  if (reviewBodyWordList.length <= 14) {

    reviewBodyTier = 1

  } else if (reviewBodyWordList.length > 14 && reviewBodyWordList.length <= 39) {

    reviewBodyTier = 2

  } else {

    reviewBodyTier = 3
    reviewBodyStatusColor = '#67af98'

  }

  let uploadedMediaTier
  let uploadedMediaStatusColor = primaryColor

  if (uploadedMediaRef.current.length === 0) {
    uploadedMediaTier = 1
  } else if (uploadedMediaRef.current.length > 0 && uploadedMediaRef.current.length <= 1) {
    uploadedMediaTier = 2
  } else {
    uploadedMediaTier = 3
    uploadedMediaStatusColor = "#67af98"
  }

  const reviewScoreTier = Math.floor((reviewHeadlineTier + reviewBodyTier + uploadedMediaTier) / 3)
  const rewards = ['No Reward', '40% Off', 'Buy 2, Get 1 Free!']

  const renderStars = (rating: number) => {
      for (let i = 1; i<=5; i++) {
          if (i <= rating) {
              (document.querySelector(`#star${i}`) as HTMLElement).style.fill = primaryColor
          } else {
              (document.querySelector(`#star${i}`) as HTMLElement).style.fill = '#e8e8e8'
          }
      }
  }

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

  }, [primaryColor])

  useEffect(() => {
    renderStars(rating.current)
  }, [primaryColor])

  useEffect(() => {

    try {

        const fontAwesomeScriptTag = document.createElement('link')
        fontAwesomeScriptTag.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        fontAwesomeScriptTag.rel = "stylesheet"
        document.head.appendChild(fontAwesomeScriptTag)

        const uploadMediaBtn = document.querySelector('#uploadMediaBtn') as any
        const uploadedMediaContainer = document.querySelector('#uploadedMediaContainer') as any

        const verifyFileType = (file: any) => {
    
            if (file.type.split('/')[0] !== 'image' && file.type.split('/')[0] !== 'video') {
                setUploadMediaError('Only image or video files are allowed')
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

  return (
            <Card>
                <Banner>This preview displays example rewards</Banner>
                <div style={{width: 'fit-content', margin: 'auto'}}>
                    <div className={styles.reviewForm} style={{width: 'fit-content', padding: '10px'}}>
                        <div className={styles.reviewFormHeadingContainer}>
                            <h1>{heading}</h1>
                            <p>{subheading}</p>
                        </div>
                        <div className={styles.reviewFormStarsContainer}>
                            <svg id="reviewFormStar" data-rating="1" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path id="star1" fill={primaryColor} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                            </svg>
                            <svg id="reviewFormStar" data-rating="2" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path id="star2" fill={primaryColor} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                            </svg>
                            <svg id="reviewFormStar" data-rating="3" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path id="star3" fill={primaryColor} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                            </svg>
                            <svg id="reviewFormStar" data-rating="4" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path id="star4" fill={primaryColor} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                            </svg>
                            <svg id="reviewFormStar" data-rating="5" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path id="star5" fill={primaryColor} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                            </svg>
                        </div>
                        <div className={styles.reviewFieldWrapper}>
                            <label> Give it a Headline * </label>
                            <div style={{position: 'relative'}}>
                                <input value={reviewHeadline} onChange={(e) => setReviewHeadline(e.target.value)} name='title' placeholder={headlinePlaceholder} />
                                {reviewHeadlineTier === 3 && 
                                <div className={styles.characterCountContainer} style={{backgroundColor: reviewHeadlineStatusColor}}>
                                    <span>Perfect!</span>
                                </div>}
                            </div>
                        </div>
                        <BlockStack gap={'100'}>
                            <ProgressBar tone={reviewHeadlineTier === 3 ? "success" : "primary"} progress={Math.round(reviewHeadlineWordList.length / 10 * 100)} />
                            <Text as="p" tone={reviewHeadlineTier === 3 ? "success" : "base"} variant="bodySm">{reviewHeadlineTier === 3 ? "You wrote a perfect headline!" : `You are ${Math.round(reviewHeadlineWordList.length / 10 * 100)}% of the way to writing the perfect headline`}</Text>
                        </BlockStack>
                        <div className={styles.reviewFieldWrapper}>
                            <label>Review *</label>
                            <div style={{position: 'relative'}}>
                                <textarea value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} name='body' className={styles.reviewTextArea} placeholder={reviewPlaceholder} />
                                {reviewBodyTier === 3 && 
                                <div className={styles.characterCountContainer} style={{backgroundColor: reviewBodyStatusColor}}>
                                    <span>Perfect!</span>
                                </div>}
                            </div>
                        </div>
                        <BlockStack gap={'100'}>
                            <ProgressBar tone={reviewBodyTier === 3 ? "success" : "primary"} progress={Math.round(reviewBodyWordList.length / 40 * 100)} />
                            <Text as="p" tone={reviewBodyTier === 3 ? "success" : "base"} variant="bodySm">{reviewBodyTier !== 3 ? `You are ${Math.round(reviewBodyWordList.length / 40 * 100)}% of the way to writing the perfect body` : "You wrote the perfect body!"}</Text>
                        </BlockStack>
                        <div className={styles.reviewNameEmailWrapper}>
                            <div className={styles.reviewNameEmailContainer}>
                                <label>Your First Name *</label>
                                <input type='name' name='name' />
                            </div>
                            <div className={styles.reviewNameEmailContainer}>
                                <label>Your Email Address *</label>
                                <input type='email' name='email' />
                            </div>
                        </div>
                        <div className={styles.uploadMediaContainer}>
                            <label className={styles.uploadMediaLabel}>
                                <p>Upload Media</p>
                                <svg viewBox="0 0 1024 1024" className={styles.uploadIcon} version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M220.5 245.4c-32.8 32.8-55.1 73.2-65.2 117.3h16.5c18.8-75.3 75.1-135.9 148-160.7v-16.9c-37.1 11.6-71 32-99.3 60.3z" fill="#000000"></path><path d="M959.9 540.8c0 113.6-92.1 205.8-205.7 205.9H590.9v-44h163.3c43.2 0 83.8-16.9 114.3-47.4 30.6-30.6 47.4-71.2 47.4-114.5 0-43.2-16.8-83.9-47.4-114.4S797.2 379 754 379c-11.5 0-22.8 1.2-33.8 3.5-15 3.2-29.4 8.4-42.8 15.7-1-15.4-3.3-30.7-6.8-45.6v-0.1c-3.6-15.6-8.6-30.8-14.9-45.7-14.4-33.9-34.9-64.4-61.1-90.6-26.2-26.2-56.6-46.7-90.6-61.1-35.1-14.8-72.4-22.4-110.9-22.4s-75.8 7.5-110.9 22.4c-33.9 14.3-64.4 34.9-90.6 61.1-26.2 26.2-46.7 56.7-61.1 90.6-14.9 35.1-22.4 72.4-22.4 110.9s7.5 75.8 22.4 110.9c14.3 33.9 34.9 64.4 61.1 90.6 26.2 26.2 56.7 46.7 90.6 61.1 35.1 14.8 72.4 22.4 110.9 22.4h39.7v44h-41C210.7 746 64.1 599 64.1 417.7c0-181.7 147.3-329 329-329 154.6 0 284.3 106.6 319.5 250.3v0.1c13.4-2.7 27.2-4.2 41.4-4.2 113.7 0.1 205.9 92.2 205.9 205.9z" fill="#39393A"></path><path d="M692.9 636.1h-22.6L519.8 485.6v449.6h-16V485.8L353.4 636.1h-22.6l181-181z" fill="#000000"></path></g></svg>            
                            </label>
                            <div id="uploadedMediaContainer" className={styles.uploadedMediaContainer}></div>
                            <input type='file' id='uploadMediaBtn' className={styles.uploadMediaBtn} accept='image/*, video/*' multiple />
                            {uploadedMediaTier === 3 && 
                            <div className={styles.characterCountContainer} style={{backgroundColor: uploadedMediaStatusColor, bottom: '5px'}}>
                                <span>Perfect!</span>
                            </div>}
                        </div>
                        <BlockStack gap={'100'}>
                            <ProgressBar tone={uploadedMediaTier === 3 ? "success" : "primary"} progress={Math.round(uploadedMediaRef.current.length / 2 * 100)} />
                            <Text as="p" tone={uploadedMediaTier === 3 ? "success" : "base"} variant="bodySm">{uploadedMediaTier === 3 ? "You uploaded the perfect amount of media!" : `You are ${Math.round(uploadedMediaRef.current.length / 2 * 100)}% of the way to the perfect media upload`}</Text>
                        </BlockStack>
                        {uploadMediaError && <p style={{color: 'darkred'}}>{uploadMediaError}</p>}
                        <hr style={{width: '100%', backgroundColor: 'lightgray', border: 'none', height: '0.20px'}} />
                        <BlockStack>
                            <Text as="h3" fontWeight="bold">Reward Tiers</Text>
                            <Text as="p" variant="bodySm">The better your review, the better your reward</Text>
                        </BlockStack>
                        <div>
                            <div className={styles.rewardTiersContainer}>
                                <div className={styles.rewardTierOne} style={{backgroundColor: reviewScoreTier === 1 ? primaryColor : 'lightgray', filter: reviewScoreTier === 1 ? 'none' : "blur(1px)"}}>
                                    <Text as="p" fontWeight="bold">{rewards[0]}</Text>
                                </div>
                                <div className={styles.rewardTierTwo} style={{backgroundColor: reviewScoreTier === 2 ? primaryColor : 'lightgray', filter: reviewScoreTier === 2 ? 'none' : "blur(1px)"}}> 
                                    <Text as="p" fontWeight="bold">{rewards[1]}</Text>
                                </div>
                                <div className={styles.rewardTierThree} style={{backgroundColor: reviewScoreTier === 3 ? primaryColor : 'lightgray', filter: reviewScoreTier === 3 ? 'none' : "blur(1px)"}}>
                                    <Text as="p" fontWeight="bold">{rewards[2]}</Text>
                                </div>
                            </div>
                        </div>
                        <button className={styles.submitReviewBtn} style={{backgroundColor: primaryColor}}>Submit Review</button>
                    </div>
                </div>
            </Card>
  )
}

export default ReviewFormPreview
