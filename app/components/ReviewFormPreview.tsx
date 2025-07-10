import { Card } from "@shopify/polaris"

import styles from '../styles/ReviewPreview.module.css'
import { useCallback, useEffect, useRef, useState } from "react"

interface Props {
    starRatingHeading: string;
    titleHeading: string;
    titlePlaceholder: string;
    bodyHeading: string;
    bodyPlaceholder: string;
    mediaHeading: string;
}

const ReviewFormPreview = ( { starRatingHeading, titleHeading, titlePlaceholder, bodyHeading, bodyPlaceholder, mediaHeading } : Props ) => {

    const [currentStep, setCurrentStep] = useState<number>(1)
    const [uploadedMedia, setUploadedMedia] = useState<any>([])

    const steps = [
        {title: starRatingHeading, markup: <div id="reviewFormStarsContainer" className={styles.reviewFormStarsContainer}></div>, key: "rating"}, 
        {title: titleHeading, markup: <input className={styles.formQuestionInput} id='reviewHeadline' name='title' placeholder={titlePlaceholder} />, key: 'title'}, 
        {title: bodyHeading, markup: <textarea className={styles.formQuestionInput} name='body' id='reviewTextArea' placeholder={bodyPlaceholder}></textarea>, key: 'body'},
        {title: mediaHeading, markup: 
        <>
            <div id="uploadMediaContainer" className={styles.uploadMediaContainer}>
                <label id="uploadMediaLabel" className={styles.uploadMediaLabel} htmlFor='uploadMediaBtn'>
                    <p className={styles.uploadMediaText}>Upload Media</p>
                    <i className="fa-solid fa-upload"></i>
                </label>
                <div id="uploadedMediaContainer" className={styles.uploadedMediaContainer}></div>
                <input type='file' id='uploadMediaBtn' className={styles.uploadMediaBtn} accept='image/png, image/jpg, image/jpeg, video/*' multiple />
            </div>
            <p className={styles.uploadError}></p>
        </>, key: 'media'}, 
        {title: 'What is Your First Name?', markup: <input name="firstName" className={styles.formQuestionInput} placeholder="Enter your first name" />, key: 'firstName'}, 
    ]

    const currentStarRating = useRef(5)
    const uploadedMediaRef = useRef<any>([])

    const [uploadMediaError, setUploadMediaError] = useState('')

    useEffect(() => {
        const linkTag = document.createElement('link')
        linkTag.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        linkTag.rel = "stylesheet"
        document.head.appendChild(linkTag)
    }, [])

    useEffect(() => {
        
        if (uploadedMediaRef.current.length > 0) {
            conditionallyRenderUploadMediaLabel()
        }

    }, [uploadedMediaRef.current])

    useEffect(() => {
        if (steps[currentStep-1].key === "rating") {
            renderStars(currentStarRating.current)
        }
        renderSteps(steps.length)

        if (steps[currentStep-1].key === "media") {
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
        
                // verify no duplicate files are being added -- uses array to verify since file list changes if multiple drag and drops are used
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
                                conditionallyRenderUploadMediaLabel()
        
                            }
                        })
        
                        imageContainer.appendChild(removeUploadedMediaContainer)
                        uploadedMediaContainer.appendChild(imageContainer)
                        conditionallyRenderUploadMediaLabel()
        
                    }
                }
            }
        
            if (uploadMediaBtn) {
                uploadMediaBtn.addEventListener('change', () => {
                    Array.from(uploadMediaBtn.files).forEach(verifyFileType)
                })
            }
        }

    }, [currentStep])

    const conditionallyRenderUploadMediaLabel = useCallback(() => {
        if (uploadedMediaRef.current.length > 0) {
            (document.querySelector('#uploadMediaLabel') as any).style.display = "none"
        } else {
            (document.querySelector('#uploadMediaLabel') as any).style.display ="flex"
        }
    }, [uploadedMediaRef.current])

    const renderStars = useCallback((rating: number) => {
        const htmlMarkup = []
        for (let i = 1; i<6; i++) {
            if (i <= rating) {
                htmlMarkup.push(
                    `<svg id="reviewFormStar" class=${styles.reviewFormStar} data-rating=${i} style="height: 60px; width: 60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="star-${i}" d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" fill="#ffcd1a"></path> </g></svg>`
                )
            } else {
                htmlMarkup.push(
                    `<svg id="reviewFormStar" class=${styles.reviewFormStar} data-rating=${i} style="height: 60px; width: 60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="star-${i}" d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" fill="#e6e6e6"></path> </g></svg>`
                )
            }
        }
    
        const reviewFormStarsContainer = document.querySelector('#reviewFormStarsContainer') as any
        reviewFormStarsContainer.innerHTML = htmlMarkup.join('')
    
        const reviewFormStars = document.querySelectorAll('#reviewFormStar') as any
        reviewFormStars.forEach((reviewFormStar: any) => {
            const reviewFormStarRating = reviewFormStar.dataset.rating 
            const fillStars = (maxRating: number) => {
                for (let i = 1; i<6; i++) {
                    if (i<=maxRating) {
                        (document.querySelector(`#star-${i}`) as any).style.fill = '#ffcd1a'
                    } else {
                        (document.querySelector(`#star-${i}`) as any).style.fill = '#e6e6e6'
                    }
                }
            }
            reviewFormStar.addEventListener('mouseover', () => fillStars(reviewFormStarRating))
            reviewFormStar.addEventListener('mouseleave', () => fillStars(rating))
            reviewFormStar.addEventListener('click', () => {
                currentStarRating.current = reviewFormStar.dataset.rating
                renderStars(reviewFormStarRating)
                setCurrentStep(currentStep+1)
            })
        })
    }, [])

    const nextQuestion = useCallback(() => {
        if (currentStep !== steps.length) {
            setCurrentStep(currentStep => {return currentStep + 1})
        }
    }, [currentStep])

    const lastQuestion = useCallback(() => {
        setCurrentStep(currentStep => {return currentStep - 1})
    }, [currentStep])

    // renders the steps helper at the bottom of the form
    const renderSteps = useCallback((numSteps: number) => {
        const markup = []
        for (let i = 1; i<=numSteps; i++) {
            markup.push(`<div class="${styles.reviewFormStep}" style="background-color: ${i <= currentStep ? "black": "#f6f6f6"}"></div>`)
        }
        const stepsContainer = document.querySelector('#stepsContainer')
        if (stepsContainer) {
            stepsContainer.innerHTML = markup.join("")
        }
    }, [currentStep])

  return (
        <Card>
            <div className={styles.writeReviewForm}>
                {currentStep === 1 ? '' : <svg onClick={nextQuestion} className={styles.writeReviewForwardBtn} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6 12H18M18 12L13 7M18 12L13 17" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>}
                {currentStep === 1 ? '' : <svg onClick={lastQuestion} className={styles.writeReviewBackBtn} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6 12H18M6 12L11 7M6 12L11 17" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>}
                <h1 className={styles.reviewFormStepTitle}>{steps[currentStep-1].title}</h1>
                <div className={styles.inputContainer}>
                    {steps[currentStep-1].markup}
                </div>
                <div id="stepsContainer" className={styles.stepsContainer}>
                </div>
            </div>
        </Card>
  )
}

export default ReviewFormPreview
