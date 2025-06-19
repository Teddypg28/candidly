import { LoaderFunctionArgs, redirect } from "@remix-run/node";

import db from '../../db.server'
import { useLoaderData } from "@remix-run/react";

import styles from '../../styles/ReviewForm.module.css'
import { useEffect, useRef, useState } from "react";
import { ReviewFormSettings } from "@prisma/client";
import fetchRewardTiers from "~/helpers/rewards/fetchRewardTiers";

import { initialUserReviewFormInputState, UserReviewFormInputState } from "~/types/types";
import calculateCurrentRewardTier from "~/helpers/rewards/calculateCurrentRewardTier";
import ReviewSubmittedMessage from "~/components/ReviewSubmittedMessage";

export const loader = async ({ params, request } : LoaderFunctionArgs) => {

    const store = params.store as string
    const reviewRequestId = params.reviewRequestId as string
    const authToken = params.authToken as string

    // extract search params from the url
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const stars = parseInt(searchParams.get('stars') as string)

    const reviewRequest = await db.reviewRequest.findFirst({where: {id: {equals: reviewRequestId}, AND: {store: {equals: `${store}.myshopify.com`}, authToken: {equals: authToken}}}})
    if (!reviewRequest) return redirect('/')
    
    const matchingProductReviews = await db.productReview.findMany({where: {store: {equals: `${store}.myshopify.com`}, AND: {reviewRequestId: {equals: reviewRequest.id}}}})
    const alreadyReviewedProducts = matchingProductReviews.map(review => review.productId)

    // see how many product ids are included
    const productDataObjects: {id: string, title: string | null, image: string | null}[] = []
    searchParams.forEach((value, key) => {
        if (key.includes('productId') && !alreadyReviewedProducts.includes(`gid://shopify/Product/${value}`)) {
            const num = key.split('Id')[1]
            const data = {
                id: `gid://shopify/Product/${value}`,
                title: searchParams.get(`productTitle${num}`),
                image: searchParams.get(`productImage${num}`)
            }
            productDataObjects.push(data)
        }
    })

    if (productDataObjects.length === 0) return redirect('/')
   
    const productIds = productDataObjects.map(product => product.id)
    const questions = await db.reviewFormQuestion.findMany({where: {store: {equals: `${store}.myshopify.com`}, AND: [{productConfiguration: {equals: ['all']}}, {productIds: {hasSome: productIds}}]}, include: {radioAnswerChoices: true}})

    const formSettings = await db.reviewFormSettings.findFirst({where: {store: {equals: `${store}.myshopify.com`}}, omit: {id: true}}) as ReviewFormSettings
    const rewardsTiers = await fetchRewardTiers(`${store}.myshopify.com`) as string[]

    return {
        formSettings, 
        rewardsTiers, 
        customerData: {firstName: reviewRequest.firstName, email: reviewRequest.email}, 
        reviewData: {reviewRequestId, authToken, store},
        productDataObjects, 
        questions, 
        stars
    }
}

export default function ReviewForm() {
    
    const data = useLoaderData<typeof loader>()
    
    const defaultState = {
        ...initialUserReviewFormInputState, 
        firstName: data.customerData.firstName,
        email: data.customerData.email
    }

    const [reviewSuccessfullySubmited, setReviewSuccessfullySubmitted] = useState(false)
    const [productsToReview, setProductsToReview] = useState(data.productDataObjects)

    const [userInputState, setUserInputState] = useState<UserReviewFormInputState>({
        ...initialUserReviewFormInputState, 
        firstName: data.customerData.firstName,
        email: data.customerData.email
    })

    const [uploadedMedia, setUploadedMedia] = useState<File[]>([])

    const [errors, setErrors] = useState<{[key: string]: boolean}>({})

    const rating = useRef(data.stars)
    const uploadedMediaRef = useRef<File[]>([])

    const [uploadMediaError, setUploadMediaError] = useState('')

    const tierData = calculateCurrentRewardTier(userInputState.title, userInputState.body, uploadedMediaRef, data.formSettings.primaryFormColor)

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

    
    useEffect(() => {
        renderStars(rating.current)
    }, [data.formSettings.primaryFormColor])

    useEffect(() => {

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
        
                // verify no duplicate files are being added -- uses array to verify since file list changes if multiple drag and drops are used
                if (!uploadedMediaRef.current.find((uploadedFile: File) => uploadedFile.name === file.name)) {

                    // push files to saved uploaded files array and update input element file list since file list changes if user drags and drops multiple sets of files
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
                                // remove deleted file from file list
                                const dt = new DataTransfer()
                                const currentFiles = Array.from(uploadMediaBtn.files)
                                currentFiles.forEach((file: any) => {
                                    if (file.name !== e.target.dataset.fileName) {
                                        dt.items.add(file)
                                    }
                                })
                                uploadMediaBtn.files = dt.files
        
                                // remove deleted files from saved uploaded files array
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

    const customDropdownQuestions = useRef<any>({})

    useEffect(() => {
        // attach event listeners for toggling chevron direction + dropdown open/closed state
        data.questions.forEach(question => {
            const dropdownItemsContainer = document.querySelector(`#dropdownItemsContainer-${question.id}`) as HTMLBodyElement
            const customQuestionDropdown = document.querySelector(`#dropdownTop-${question.id}`) as HTMLBodyElement
            const chevronIconContainer = document.querySelector(`#chevronContainer-${question.id}`)

            if (!customDropdownQuestions.current[question.id]) {
                customQuestionDropdown?.addEventListener('click', () => {
                    if (customQuestionDropdown.dataset.status === "closed" && chevronIconContainer) {
                        chevronIconContainer.innerHTML = `<i class="fa-solid fa-chevron-up" style="color: black"> </i>`
                        customQuestionDropdown.dataset.status = "open"
                        dropdownItemsContainer.style.display = "block"
                    } else if (customQuestionDropdown.dataset.status === "open" && chevronIconContainer) {
                        chevronIconContainer.innerHTML = `<i class="fa-solid fa-chevron-down" style="color: black"> </i>`
                        customQuestionDropdown.dataset.status = "closed"
                        dropdownItemsContainer.style.display = "none"
                    }
                })
    
                // attach event listeners for tracking which answer choice was clicked
                question.radioAnswerChoices.forEach(answerChoice => {
                        const answerChoiceItemElements = document.querySelectorAll(`div[data-choiceid="${answerChoice.id}"]`)
                        answerChoiceItemElements.forEach(item => {
                            item.addEventListener('click', (e: any) => {
                                const target = e.target.closest('div[data-choiceid]')
                                const isClicked = target.dataset.clicked
                                const checkbox = document.querySelector(`div[data-choiceidcheckbox="${answerChoice.id}"]`)
    
                                if (!checkbox) return 
    
                                if (isClicked === "true") {                      
                                    target.dataset.clicked = "false"
                                    checkbox.textContent = ''
                                    setUserInputState(prevUserInputState => {return {...prevUserInputState, selectedAnswerChoices: {...prevUserInputState['selectedAnswerChoices'], [question.id]: prevUserInputState['selectedAnswerChoices'][question.id].filter(choice => choice.value !== target.dataset.answerchoicevalue)}}})
                                } else {
                                    target.dataset.clicked = "true"
                                    checkbox.textContent = '•'
                                    setUserInputState(prevUserInputState => {return {...prevUserInputState, selectedAnswerChoices: {...prevUserInputState['selectedAnswerChoices'], [question.id]: [...(prevUserInputState['selectedAnswerChoices'][question.id] || []), {id: answerChoice.id, value: target.dataset.answerchoicevalue}]}}})
                                }
                            })
                        })
                })
            }
            customDropdownQuestions.current[question.id] = true
        })

        // reset input state whenever user navigates to a different review form
        setUserInputState(defaultState)
        setErrors({})

    }, [productsToReview])

    // check for review form errors
    const isErrors = () => {
        const errors: {[key: string]: boolean} = {}
        Object.keys(userInputState).forEach(key => {
            if (key !== "selectedAnswerChoices" && userInputState[key as keyof typeof userInputState] === "") {
                errors[key] = true
            } else {
                const requiredQuestions = data.questions.filter(question => question.productIds.includes(productsToReview[0].id) || question.productConfiguration[0] === 'all' && question.isRequired[0] === "true")
                const requiredQuestionIds = requiredQuestions.map(question => question.id)
                requiredQuestionIds.forEach(questionId => {
                    if (!userInputState["selectedAnswerChoices"][questionId] || userInputState["selectedAnswerChoices"][questionId].length === 0) {
                        errors[questionId] = true
                    }
                })
            }
        })
        return Object.keys(errors).length > 0 ? errors : false
    }

    const submitReview = async () => {
        // reset errors after every submission
        setErrors({})

        const errors = isErrors()
        if (errors) {
            return setErrors(errors)
        } else {
            const reviewFormData = new FormData()
            Object.entries(userInputState).forEach(([key, value]) => {
                if (key === "selectedAnswerChoices") {
                    reviewFormData.append(key, JSON.stringify(value))
                } else {
                    reviewFormData.append(key, value)
                }
            })

            reviewFormData.append('authToken', data.reviewData.authToken)
            reviewFormData.append('store', data.reviewData.store)
            reviewFormData.append('reviewRequestId', data.reviewData.reviewRequestId)
            reviewFormData.append('productId', productsToReview[0].id)
            reviewFormData.append('rating', rating.current.toString())
            reviewFormData.append('store', data.reviewData.store)

            uploadedMedia.forEach(file => reviewFormData.append("media", file))

            const res = await fetch('/api/review/request/create', {method: 'POST', body: reviewFormData})
            if (res.status !== 200) {
                setErrors({'submission': true})
            } else {
                setReviewSuccessfullySubmitted(true)
                const productsLeftToReview = productsToReview.filter(product => product.id !== productsToReview[0].id)
                if (productsLeftToReview.length > 0) {
                    setTimeout(() => {
                        setProductsToReview(productsLeftToReview)
                        setReviewSuccessfullySubmitted(false)
                    }, 1500)
                }
            }
        }
    }

    const CustomQuestionMarkup  = data.questions.map((question, index) => {
        if (question.productConfiguration[0] === "all" || question.productIds.includes(productsToReview[0]?.id)) {
            if (question.radioAllowMultipleAnswers[0] === 'true') {
                const Markup = (
                    <div key={index} style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        <label htmlFor={`multipleChoicesContainer-${question.id}`} className={styles.customQuestionTitle}>{question.title} {question.isRequired[0] === "true" ? '*' : ''}</label>
                        <div id={`multipleChoicesContainer-${question.id}`} className={styles.multipleChoicesContainer}>
                            <div data-status="closed" className={styles.dropdownTop} id={`dropdownTop-${question.id}`}>
                                <p className={styles.selectedOptionsContainer} id={`selectedOptionsContainer-${question.id}`}>{userInputState.selectedAnswerChoices[question.id]?.length > 0 ? userInputState.selectedAnswerChoices[question.id].map(choice => choice.value).join(', ') : 'Select'}</p>
                                <span id={`chevronContainer-${question.id}`}> 
                                    <i className="fa-solid fa-chevron-down" style={{ color: "black" }}> </i>
                                </span>
                            </div>
                            <div className={styles.dropdownItemsContainer} style={{display: 'none'}} id={`dropdownItemsContainer-${question.id}`}>
                                {question.radioAnswerChoices.map((choice, index) => {
                                    return (
                                        <div key={index} data-answerchoicevalue={choice.value} data-clicked="false" data-choiceid={choice.id} className={styles.dropdownItem} id={`dropdownQuestion${question.id}Item`}>
                                            {choice.value}
                                            <div className={styles.checkbox} data-choiceidcheckbox={choice.id}></div>
                                        </div>
                                    )})
                                }
                            </div>
                        </div>
                        {errors[question.id] && <p style={{backgroundColor: 'rgb(240, 220, 220)', borderRadius: '0.25rem', textAlign: 'left', color: 'darkred', padding: '10px 5px', margin: 0, fontSize: '14px', marginTop: '5px'}}>This question is required</p>}
                    </div>
                )
                return Markup
            } else {
                const Markup = (
                    <div key={index} style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        <label htmlFor={`answerChoicesContainer-${question.id}`} className={styles.customQuestionTitle}>{question.title} {question.isRequired[0] === "true" ? '*' : ''}</label>
                        <select 
                        key={index}
                        onChange={(e: any) => setUserInputState({...userInputState, selectedAnswerChoices: {...userInputState['selectedAnswerChoices'], [question.id]: e.target.value}})} 
                        data-name={`customQuestion-${question.id}`} 
                        className={styles.customQuestionDropdown} 
                        id={`answerChoicesContainer-${question.id}`}>
                            <option value="">Select one</option>
                            {question.radioAnswerChoices.map((choice, index) => {
                                return <option key={index} value={choice.id}>{choice.value}</option>
                            })}
                        </select>
                        {errors[question.id] && <p style={{backgroundColor: 'rgb(240, 220, 220)', borderRadius: '0.25rem', textAlign: 'left', color: 'darkred', padding: '10px 5px', margin: 0, fontSize: '14px', marginTop: '5px'}}>This question is required</p>}
                    </div>
                )
                return Markup
            }
        }
    })
    
    return (
        <div style={{width: '100%', height: '100%'}}>
            {reviewSuccessfullySubmited && <ReviewSubmittedMessage />}
            <div className={styles.reviewForm}>
                <div className={styles.reviewFormHeadingContainer}>
                    <h1 style={{margin: 0, padding: 0, fontSize: '26px'}}>{data.formSettings.heading}</h1>
                    <p style={{margin: 0, padding: 0, marginTop: '10px'}}>{data.formSettings.subheading}</p>
                </div>
                <div style={{display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px'}}>
                    <div style={{border: '1px solid lightgray', borderRadius: '10px', width: '75px', height: '75px', overflow: 'hidden'}}>
                        <img src={productsToReview[0]?.image || undefined} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        <p style={{padding: 0, margin: 0}}>{productsToReview[0]?.title || ''}</p>
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
                        <input value={userInputState.title} onChange={(e) => setUserInputState({...userInputState, title: e.target.value})} name='title' placeholder={data.formSettings.headlinePlaceholder} />
                        {!noRewardsConfigured && tierData.headline.tier === 3 && 
                        <div className={styles.characterCountContainer} style={{backgroundColor: tierData.headline.color, padding: '5px 10px'}}>
                            <span>Perfect!</span>
                        </div>}
                    </div>
                    {errors['title'] && <p style={{backgroundColor: 'rgb(240, 220, 220)', borderRadius: '0.25rem', textAlign: 'left', color: 'darkred', padding: '10px 5px', margin: 0, fontSize: '14px', marginTop: '5px'}}>Headline is required</p>}
                </div>
                {!noRewardsConfigured &&
                <div style={{marginBottom: '10px'}}>
                    <div style={{borderRadius: '5px', width: '100%', height: '17px', backgroundColor: '#e2e2e2', overflow: 'hidden'}}>
                        <div className={styles.progressBar} style={{backgroundColor: tierData.headline.tier === 3 ? '#67af98' : data.formSettings.primaryFormColor, height: '100%', width: `${Math.round(tierData.headline.wordlist.length / 10 * 100)}%`}}> </div>
                    </div>
                    <p style={{margin: 0, padding: 0, marginTop: 5, fontSize: '14px', color: tierData.headline.tier == 3 ? tierData.headline.color : 'black'}}>{tierData.headline.tier === 3 ? "You wrote a perfect headline!" : `You are ${Math.round(tierData.headline.wordlist.length / 10 * 100)}% of the way to writing the perfect headline`}</p>
                </div>
                }
                <div className={styles.reviewFieldWrapper}>
                    <label>Review *</label>
                    <div style={{position: 'relative'}}>
                        <textarea value={userInputState.body} onChange={(e) => setUserInputState({...userInputState, body: e.target.value})} name='body' className={styles.reviewTextArea} placeholder={data.formSettings.reviewPlaceholder} />
                        {!noRewardsConfigured && tierData.body.tier === 3 && 
                        <div className={styles.characterCountContainer} style={{backgroundColor: tierData.body.color, padding: '5px 10px'}}>
                            <span>Perfect!</span>
                        </div>}
                    </div>
                    {errors['body'] && <p style={{backgroundColor: 'rgb(240, 220, 220)', borderRadius: '0.25rem', textAlign: 'left', color: 'darkred', padding: '10px 5px', margin: 0, fontSize: '14px', marginTop: '5px'}}>Review is required</p>}
                </div>
                {!noRewardsConfigured &&
                <div>
                    <div style={{borderRadius: '5px', width: '100%', height: '17px', backgroundColor: '#e2e2e2', overflow: 'hidden'}}>
                        <div className={styles.progressBar} style={{backgroundColor: tierData.body.tier === 3 ? '#67af98' : data.formSettings.primaryFormColor, height: '100%', width: `${Math.round(tierData.body.wordList.length / 40 * 100)}%`}}> </div>
                    </div>
                    <p style={{margin: 0, padding: 0, marginTop: 5, fontSize: '14px', color: tierData.body.tier == 3 ? tierData.body.color : 'black'}}>{tierData.body.tier !== 3 ? `You are ${Math.round(tierData.body.wordList.length / 40 * 100)}% of the way to writing the perfect body` : "You wrote the perfect body!"}</p>
                </div>
                }
                {CustomQuestionMarkup}
                <div className={styles.reviewNameEmailWrapper}>
                    <div className={styles.reviewNameEmailContainer}>
                        <label>Your First Name *</label>
                        <input type='name' name='name' value={userInputState.firstName || ""} onChange={(e) => setUserInputState({...userInputState, firstName: e.target.value})} />
                        {errors['firstName'] && <p style={{backgroundColor: 'rgb(240, 220, 220)', borderRadius: '0.25rem', textAlign: 'left', color: 'darkred', padding: '10px 5px', margin: 0, fontSize: '14px', marginTop: '5px'}}>First name is required</p>}
                    </div>
                    <div className={styles.reviewNameEmailContainer}>
                        <label>Your Email Address *</label>
                        <input type='email' name='email' value={userInputState.email || ""} onChange={(e) => setUserInputState({...userInputState, email: e.target.value})} />
                        {errors['email'] && <p style={{backgroundColor: 'rgb(240, 220, 220)', borderRadius: '0.25rem', textAlign: 'left', color: 'darkred', padding: '10px 5px', margin: 0, fontSize: '14px', marginTop: '5px'}}>Email is required</p>}
                    </div>
                </div>
                <div id="uploadMediaContainer" className={styles.uploadMediaContainer}>
                    <label className={styles.uploadMediaLabel}>
                        <p>Upload Media</p>
                        <i className="fa-solid fa-upload"></i>            
                    </label>
                    <div id="uploadedMediaContainer" className={styles.uploadedMediaContainer}></div>
                    <input type='file' id='uploadMediaBtn' className={styles.uploadMediaBtn}accept='image/png, image/jpg, image/jpeg, video/*' multiple />
                    {!noRewardsConfigured && tierData.media.tier === 3 && 
                    <div className={styles.characterCountContainer} style={{backgroundColor: tierData.media.color, bottom: '5px', padding: '5px 10px'}}>
                        <span>Perfect!</span>
                    </div>}
                </div>
                {uploadMediaError && <p style={{backgroundColor: 'rgb(240, 220, 220)', borderRadius: '0.25rem', textAlign: 'left', color: 'darkred', padding: '10px 5px', margin: 0, fontSize: '14px', marginTop: '5px'}}>{uploadMediaError}</p>}
                {!noRewardsConfigured && 
                <>
                    <div>
                        <div style={{borderRadius: '5px', width: '100%', height: '17px', backgroundColor: '#e2e2e2', overflow: 'hidden'}}>
                            <div className={styles.progressBar} style={{backgroundColor: tierData.media.tier === 3 ? '#67af98' : data.formSettings.primaryFormColor, height: '100%', width: `${Math.round(uploadedMediaRef.current.length / 2 * 100)}%`}}> </div>
                        </div>
                        <p style={{margin: 0, padding: 0, marginTop: 5, fontSize: '14px', color: tierData.media.tier == 3 ? tierData.media.color : 'black'}}>{tierData.media.tier === 3 ? "You uploaded the perfect amount of media!" : `You are ${Math.round(uploadedMediaRef.current.length / 2 * 100)}% of the way to the perfect media upload`}</p>
                    </div>
                    <hr style={{width: '100%', backgroundColor: 'lightgray', border: 'none', height: '0.20px'}} />
                    <div>
                        <p style={{fontWeight: 'bold', margin: 0}}>Reward Tiers</p>
                        <p style={{margin: 0, marginTop: '3px', fontSize: '14px'}}>The better your review, the better your reward</p>
                    </div>
                    <div>
                        <div className={styles.rewardTiersContainer}>
                            <div className={styles.rewardTierOne} style={{backgroundColor: tierData.score === 1 ? data.formSettings.primaryFormColor : 'lightgray', filter: tierData.score === 1 ? 'none' : "blur(1px)"}}>
                                <p className={styles.rewardTierText}>{rewards[0]}</p>
                            </div>
                            <div className={styles.rewardTierTwo} style={{backgroundColor: tierData.score === 2 ? data.formSettings.primaryFormColor : 'lightgray', filter: tierData.score === 2 ? 'none' : "blur(1px)"}}> 
                                <p className={styles.rewardTierText}>{rewards[1]}</p>
                            </div>
                            <div className={styles.rewardTierThree} style={{backgroundColor: tierData.score === 3 ? data.formSettings.primaryFormColor : 'lightgray', filter: tierData.score === 3 ? 'none' : "blur(1px)"}}>
                                <p className={styles.rewardTierText}>{rewards[2]}</p>
                            </div>
                        </div>
                    </div> 
                </>
                }
                <button 
                onClick={submitReview} 
                className={styles.submitReviewBtn} 
                style={{backgroundColor: data.formSettings.primaryFormColor}}>
                    Submit Review
                </button>
                {errors['submission'] && <p style={{backgroundColor: 'rgb(240, 220, 220)', borderRadius: '0.25rem', textAlign: 'left', color: 'darkred', padding: '10px 5px', margin: 0, fontSize: '14px', marginTop: '5px'}}>Error submitting review</p>}
            </div>
        </div>
    )
}