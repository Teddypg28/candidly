import { Banner, Card } from "@shopify/polaris"

import styles from '../styles/ReviewPreview.module.css'
import { IColor } from "react-color-palette"
import { useEffect, useRef, useState } from "react"

interface Props {
    heading: string,
    subheading: string,
    headlinePlaceholder: string,
    reviewPlaceholder: string,
    primaryColor: IColor
}

const ReviewFormPreview = ( {heading, subheading, headlinePlaceholder, reviewPlaceholder, primaryColor } : Props ) => {

  const [currentRating, setCurrentRating] = useState(5)
  const [reviewBody, setReviewBody] = useState('')
  const [reviewHeadline, setReviewHeadline] = useState('')
  const [uploadedMedia, setUploadedMedia] = useState<any>([])

  const uploadedMediaRef = useRef<any>([])

  const [uploadMediaError, setUploadMediaError] = useState('')

  const reviewHeadlineWordList = reviewHeadline.trim().split(/\s+/)
  const reviewBodyWordList = reviewBody.trim().split(/\s+/)

  let reviewBodyTier
  let reviewBodyStatusColor

  if (reviewBodyWordList.length <= 14) {

    reviewBodyTier = 1,
    reviewBodyStatusColor = '#ee9595'

  } else if (reviewBodyWordList.length > 14 && reviewBodyWordList.length <= 39) {

    reviewBodyTier = 2
    reviewBodyStatusColor = '#e7e253'

  } else {

    reviewBodyTier = 3
    reviewBodyStatusColor = '#67af98'

  }

  let reviewHeadlineTier
  let reviewHeadlineStatusColor

  if (reviewHeadlineWordList.length <= 3) {

    reviewHeadlineTier = 1
    reviewHeadlineStatusColor = '#ee9595'

  } else if (reviewHeadlineWordList.length > 3 && reviewHeadlineWordList.length <= 9) {

    reviewHeadlineTier = 2
    reviewHeadlineStatusColor = '#e7e253'

  } else {

    reviewHeadlineTier = 3
    reviewHeadlineStatusColor = '#67af98'

  }

  let uploadedMediaTier
  let uploadedMediaStatusColor

  if (uploadedMediaRef.current.length === 0) {
    uploadedMediaTier = 1
    uploadedMediaStatusColor = '#ee9595'
  } else if (uploadedMediaRef.current.length > 0 && uploadedMediaRef.current.length <= 1) {
    uploadedMediaTier = 2
    uploadedMediaStatusColor = '#e7e253'
  } else {
    uploadedMediaTier = 3
    uploadedMediaStatusColor = '#67af98'
  }

  const reviewScoreTier = Math.floor((reviewHeadlineTier + reviewBodyTier + uploadedMediaTier) / 3)
  const rewards = ['No rewards', '40% off coupon', 'Buy 1 get 2 free coupon']

  useEffect(() => {

    document.querySelectorAll('#reviewFormStar').forEach((star) => {

        const renderStars = (rating: number) => {
            for (let i = 1; i<=5; i++) {

                if (i <= rating) {
                    (document.querySelector(`#star${i}`) as HTMLElement).style.fill = primaryColor.hex
                } else {
                    (document.querySelector(`#star${i}`) as HTMLElement).style.fill = '#e8e8e8'
                }

            }
        }

        star.addEventListener('mouseover', (e: any) => {
            const rating = parseInt(e.currentTarget.dataset.rating)
            renderStars(rating)
        })

        star.addEventListener('mouseleave', () => {
            renderStars(currentRating)
        })

        star.addEventListener('click', (e: any) => {
            setCurrentRating(e.currentTarget.dataset.rating)
        })

    })

  }, [currentRating])

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

  }, [uploadedMedia])

  return (
            <Card>
                <Banner>This preview displays example rewards</Banner>
                <div style={{width: 'fit-content', margin: 'auto'}}>
                    <div className={styles.reviewForm} style={{width: '500px'}}>
                        <div className={styles.reviewFormHeadingContainer}>
                            <h1>{heading}</h1>
                            <p>{subheading}</p>
                        </div>
                        <div className={styles.reviewFormStarsContainer}>
                            <svg id="reviewFormStar" data-rating="1" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path id="star1" fill={primaryColor.hex} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                            </svg>
                            <svg id="reviewFormStar" data-rating="2" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path id="star2" fill={primaryColor.hex} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                            </svg>
                            <svg id="reviewFormStar" data-rating="3" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path id="star3" fill={primaryColor.hex} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                            </svg>
                            <svg id="reviewFormStar" data-rating="4" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path id="star4" fill={primaryColor.hex} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                            </svg>
                            <svg id="reviewFormStar" data-rating="5" className={styles.reviewFormStar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path id="star5" fill={primaryColor.hex} d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                            </svg>
                        </div>
                        <div className={styles.reviewFieldWrapper}>
                            <label> Give it a Headline * </label>
                            <div style={{position: 'relative'}}>
                                <input value={reviewHeadline} onChange={(e) => setReviewHeadline(e.target.value)} name='title' placeholder={headlinePlaceholder} />
                                <div className={styles.characterCountContainer} style={{backgroundColor: reviewHeadlineStatusColor}}>
                                    <span>
                                        {reviewHeadlineWordList[0] === '' ? 0 : reviewHeadlineTier !== 3 && reviewHeadlineWordList.length} {reviewHeadlineTier === 3 ? '' : reviewHeadlineWordList[0] === '' ? 'words' : reviewHeadlineWordList.length === 1 ? 'word' : 'words'} {reviewHeadlineTier === 3 && 'Perfect!'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.reviewFieldWrapper}>
                            <label>Review *</label>
                            <div style={{position: 'relative'}}>
                                <textarea value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} name='body' className={styles.reviewTextArea} placeholder={reviewPlaceholder} />
                                <div className={styles.characterCountContainer} style={{backgroundColor: reviewBodyStatusColor}}>
                                    <span>
                                    {reviewBodyWordList[0] === '' ? 0 : reviewBodyTier !== 3 && reviewBodyWordList.length} {reviewBodyTier === 3 ? '' : reviewBodyWordList[0] === '' ? 'words' : reviewBodyWordList.length === 1 ? 'word' : 'words'} {reviewBodyTier === 3 && 'Perfect!'}
                                    </span>
                                </div>
                            </div>
                        </div>
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
                            <div className={styles.characterCountContainer} style={{backgroundColor: uploadedMediaStatusColor, bottom: '5px'}}>
                            {uploadedMediaTier !== 3 ? `${uploadedMediaRef.current.length} Uploaded Media` : 'Perfect!'}
                            </div>
                        </div>
                        {uploadMediaError && <p style={{color: 'darkred'}}>{uploadMediaError}</p>}
                        <div>
                            <p>Current Review Reward: <strong>{rewards[reviewScoreTier-1]}</strong></p>
                            {reviewScoreTier === 3 ? <p>Congrats! You just wrote a perfect review!</p> : <p>Spice it up a bit more to achieve a: <strong>{rewards[reviewScoreTier]}</strong></p>}
                        </div>
                        <button className={styles.submitReviewBtn} style={{backgroundColor: primaryColor.hex}}>Submit Review</button>
                    </div>
                </div>
            </Card>
  )
}

export default ReviewFormPreview
