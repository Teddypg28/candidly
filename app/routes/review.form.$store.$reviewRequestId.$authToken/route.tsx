import { LoaderFunctionArgs, redirect } from "@remix-run/node";

import db from '../../db.server'
import { useLoaderData } from "@remix-run/react";

import styles from '../../styles/ReviewForm.module.css'
import { useCallback, useEffect, useRef, useState } from "react";
import { ReviewFormSettings } from "@prisma/client";

import { initialUserReviewFormInputState, UserReviewFormInputState } from "~/types/types";
import ReviewSubmittedMessage from "~/components/ReviewSubmittedMessage";

export const loader = async ({ params, request } : LoaderFunctionArgs) => {

    const store = params.store as string
    const reviewRequestId = params.reviewRequestId as string
    const authToken = params.authToken as string

    // extract search params from the url
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const stars = parseInt(searchParams.get('stars') as string)

    const reviewRequest = await db.reviewRequest.findFirst({where: {id: {equals: reviewRequestId}, AND: {store: {equals: `${store}.myshopify.com`}, authToken: {equals: authToken}}, isComplete: false}})
    if (!reviewRequest) return redirect(`/404`)
    
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

    const questions = await Promise.all(productIds.map(async (id, index) => {
        const numConfigProductQuestions = parseInt(searchParams.get(`numProduct${index+1}Questions`) as string)
        if (numConfigProductQuestions > 0) {
            const questionId = searchParams.get(`product${index+1}Question${index+1}Id`) as string
            return await db.reviewFormQuestion.findFirst({where: {id: {equals: questionId}}, include: {radioAnswerChoices: true}}) || null
        }
        return null
    })).then(res => res.flatMap(q => q ? [q] : []))

    const formSettings = await db.reviewFormSettings.findFirst({where: {store: {equals: `${store}.myshopify.com`}}, omit: {id: true}}) as ReviewFormSettings

    return {
        formSettings, 
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
    const [uploadMediaError, setUploadMediaError] = useState('')
    const uploadedMediaRef = useRef<any>([])
    
    const [errors, setErrors] = useState<{[key: string]: boolean}>({})

    const currentStarRating = useRef(data.stars)

    const customDropdownQuestions = useRef<any>({})

    const [currentStep, setCurrentStep] = useState<number>(1)

    const steps = [
        {title: data.formSettings.starRatingHeading, markup: <div id="reviewFormStarsContainer" className={styles.reviewFormStarsContainer}></div>, key: "rating"}, 
        {title: data.formSettings.titleHeading, markup: <input id="formQuestionInput" className={styles.formQuestionInput} name='title' placeholder={data.formSettings.titlePlaceholder} />, key: 'title'}, 
        {title: data.formSettings.bodyHeading, markup: <textarea  id='formQuestionInput' className={styles.formQuestionInput} name='body' placeholder={data.formSettings.bodyPlaceholder}></textarea>, key: 'body'},
        {title: data.formSettings.customQuestionsHeading, markup: <div id="customQuestionsContainer" className={styles.customQuestionsContainer}></div>, key: 'customQuestions'},
        {title: data.formSettings.mediaHeading, markup: 
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
        {title: 'What is Your First Name?', markup: <input name="firstName" id="formQuestionInput" className={styles.formQuestionInput} placeholder="Enter your first name" />, key: 'firstName'}, 
    ]

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
        renderSteps(steps.length)

        if (steps[currentStep-1].key === "rating") {
            renderStars(currentStarRating.current)
        }

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

        if (steps[currentStep-1].key === "customQuestions") {
            renderQuestions()
        }

    }, [currentStep])

    const conditionallyRenderUploadMediaLabel = useCallback(() => {
        if (uploadedMediaRef.current.length > 0) {
            (document.querySelector('#uploadMediaLabel') as any).style.display = "none"
        } else {
            (document.querySelector('#uploadMediaLabel') as any).style.display ="flex"
        }
    }, [uploadedMediaRef.current])

    const insertCustomQuestion = (question: any) => {
        const customQuestionsContainer = document.querySelector('#customQuestionsContainer')
    
        let questionMarkup = `<div style="display: flex; flex-direction: column" id="customQuestion-${question.id}" class="${styles.customQuestionRadio}"></div>`   
        if(customQuestionsContainer) {
            customQuestionsContainer.innerHTML += questionMarkup
            const questionMarkupContainer = document.querySelector(`#customQuestion-${question.id}`)
            if (questionMarkupContainer) {
                if (question.radioAllowMultipleAnswers[0] === 'true') {
                    const renderChoices = () => {
                        return question.radioAnswerChoices.map((choice: any, index: number) => {
                            return (
                                    `<div key=${index} class="${styles.dropdownItem}" id="dropdownQuestion${question.id}Item">
                                        ${choice.value}
                                        <div id="checkbox" class="${styles.checkbox}" data-name="${choice.value}" data-id="${choice.id}"> </div>
                                    </div>`
                            )
                    }).join('')}
                    questionMarkupContainer.innerHTML+= `
                        <label for='multipleChoicesContainer-${question.id}' class=${styles.customQuestionTitle}>${question.title} ${question.isRequired[0] === "true" ? '*' : ''}</label>
                        <div id='multipleChoicesContainer-${question.id}' class=${styles.multipleChoicesContainer}>
                            <div class=${styles.dropdownTop} id="dropdownTop-${question.id}">
                                <p class="${styles.selectedOptionsContainer}" id="selectedOptionsContainer-${question.id}">Select</p>
                                <span class="${styles.chevronContainer}" id='chevronContainer-${question.id}'> 
                                    <svg width="17px" height="17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10L12 15L17 10" stroke="#000000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg> 
                                </span>
                            </div>
                            <div class="${styles.dropdownItemsContainer}" id="dropdownItemsContainer-${question.id}">
                                ${renderChoices()}
                            </div>
                        </div>
                        <p class="${styles.reviewFormValidationError}" id='customQuestion-${question.id}Error'>This field is required</p>`                  
                } else {
                    questionMarkupContainer.innerHTML+= `
                        <label for='answerChoicesContainer-${question.id}' class="${styles.customQuestionTitle}">${question.title} ${question.isRequired[0] === "true" ? '*' : ''}</label>
                        <select data-name="customQuestion-${question.id}" class="${styles.customQuestionDropdown}" id='answerChoicesContainer-${question.id}'>
                            <option value="">Select one</option>
                        </select>
                        <p class="${styles.reviewFormValidationError}" id='customQuestion-${question.id}Error'>This field is required</p>
                    `
                    const answerChoicesContainer = document.getElementById(`answerChoicesContainer-${question.id}`)
                    if (answerChoicesContainer) {
                        question.radioAnswerChoices.forEach((choice: any) => {
                            answerChoicesContainer.innerHTML += `<option value="${choice.id}">${choice.value}</option>`
                        })
                    }
                }
            
                if (!userInputState["customQuestionAnswers"][`customQuestion-${question.id}`]) {
                    userInputState['customQuestionAnswers'][`customQuestion-${question.id}`] = {value: [''], type: 'radio', isRequired: question.isRequired[0]}
                }
            }       
        }
    }

    const renderQuestions = useCallback(() => {
        if (data.questions.length > 0) {
            data.questions.forEach((question) => {
                insertCustomQuestion(question)
            })
            const customQuestionDropdowns = document.querySelectorAll('.customQuestionDropdown')
            const customQuestionMultipleChoices = document.querySelectorAll('.multipleChoicesContainer')
            // add event listeners to single choice dropdowns
            customQuestionDropdowns.forEach((dropdown: any) => {    
                dropdown.value = userInputState['customQuestionAnswers'][dropdown.getAttribute("data-name")].value[0]          
                dropdown.addEventListener('change', (e: any) => {
                    userInputState['customQuestionAnswers'][e.target.dataset.name] = {...userInputState['customQuestionAnswers'][e.target.dataset.name], value: [e.target.value]}
                })
            })
            // add event listeners to multiple choice dropdowns
            if (customQuestionMultipleChoices.length > 0) {
    
                // fill in saved selected answer choice(s)
                const selectedOptionsContainers = document.querySelectorAll(`.selectedOptionsContainer`)
                selectedOptionsContainers.forEach(container => {
                    const questionId = container.id.split("selectedOptionsContainer-")[1]
                    const checkedNames: string[] = []
                    document.querySelectorAll(`#checkbox`).forEach((checkbox: any) => {
                        if (userInputState['customQuestionAnswers'][ `customQuestion-${questionId}`].value.includes(checkbox.dataset.id)) {
                            checkbox.classList.add(`checked-${questionId}`)
                            checkbox.textContent = '•'
                            checkedNames.push(checkbox.dataset.name)
                        }
                    })
                    container.textContent = userInputState['customQuestionAnswers'][ `customQuestion-${questionId}`].value[0] === "" ? "Select" : checkedNames.join(", ")   
                })
    
                customQuestionMultipleChoices.forEach(dropdown => {
                    const questionId = dropdown.id.split('multipleChoicesContainer-')[1]
                    const dropdownTop = document.querySelector(`#dropdownTop-${questionId}`)
                    const selectedOptionsContainer = document.querySelector(`#selectedOptionsContainer-${questionId}`)
    
                    const chevronContainer = document.querySelector(`#chevronContainer-${questionId}`)
                    let isDropdownOpen = false
                    dropdownTop?.addEventListener('click', () => {
                        isDropdownOpen = !isDropdownOpen
                        const closeDropdown = (e: any) => {
                            if (e.target.id.contains("checkbox") === false && e.target.classList.contains('dropdownItem') === false) {
                                dropdownItemsContainer?.classList.add('hidden')
                                if (chevronContainer) chevronContainer.innerHTML = '<svg width="17px" height="17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10L12 15L17 10" stroke="#000000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'
                                isDropdownOpen = false
                                document.removeEventListener('click', closeDropdown)
                            }
                        }
                        const dropdownItemsContainer = document.querySelector(`#dropdownItemsContainer-${questionId}`)
                        if (dropdownItemsContainer?.classList.contains('hidden')) {
                            dropdownItemsContainer.classList.remove('hidden')
                            if (chevronContainer) chevronContainer.innerHTML = '<svg width="17px" height="17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10L12 15L17 10" stroke="#000000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'                              
                        } else {                              
                            dropdownItemsContainer?.classList.add('hidden')
                            if (chevronContainer) chevronContainer.innerHTML = '<svg width="17px" height="17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10L12 15L17 10" stroke="#000000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'
                        }
    
                        if (isDropdownOpen) {
                            setTimeout(() => document.addEventListener('click', closeDropdown), 100)
                        }
                    })
                    document.querySelectorAll(`#dropdownQuestion${questionId}Item`).forEach(element => {
                        element.addEventListener('click', (e: any) => {
                            if (e.target.id === `dropdownQuestion${questionId}Item`) {
                                if (e.target.children[0].classList.contains(`checked-${questionId}`)) {
                                    e.target.children[0].textContent = ' '
                                    e.target.children[0].classList.remove(`checked-${questionId}`)
                                } else {
                                    e.target.children[0].textContent = '•'
                                    e.target.children[0].classList.add(`checked-${questionId}`)
                                }
                            } else {
                                if (e.target.classList.contains(`checked-${questionId}`)) {
                                    e.target.textContent = ' '
                                    e.target.classList.remove(`checked-${questionId}`)
                                } else {
                                    e.target.textContent = '•'
                                    e.target.classList.add(`checked-${questionId}`)
                                }
                            }
                            const checkedNames: string[] = []
                            const checkedAnswerIds: [string] = ['']
                            document.querySelectorAll(`.checked-${questionId}`).forEach((checkedElement: any) => {
                                checkedNames.push(checkedElement.dataset.name)
                                checkedAnswerIds.push(checkedElement.dataset.id)
                            })
                            const selectedAnswers = checkedNames.join(', ')
                            if (checkedNames.length === 0) {
                                if (selectedOptionsContainer) selectedOptionsContainer.textContent = 'Select'                             
                            } else {
                                if (selectedOptionsContainer) selectedOptionsContainer.textContent = selectedAnswers
                            }
                            userInputState['customQuestionAnswers'][`customQuestion-${questionId}`] = {...userInputState['customQuestionAnswers'][`customQuestion-${questionId}`], value: checkedAnswerIds.length > 0 ? checkedAnswerIds : ['']}
                        })
                    })
                })
            }
        }
    }, [])

    const renderStars = useCallback((rating: number) => {
        const htmlMarkup = []
        for (let i = 1; i<6; i++) {
            if (i <= rating) {
                htmlMarkup.push(
                    `<svg id="reviewFormStar" class=${styles.reviewFormStar} data-rating=${i} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="star-${i}" d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" fill="#ffcd1a"></path> </g></svg>`
                )
            } else {
                htmlMarkup.push(
                    `<svg id="reviewFormStar" class=${styles.reviewFormStar} data-rating=${i} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="star-${i}" d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" fill="#e6e6e6"></path> </g></svg>`
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

    const validateFormFields = () => {
        if (["title", "body", "firstName"].includes(steps[currentStep-1].key)) {
            const formInput = document.querySelector('#formQuestionInput') as any
            const formInputValue = formInput.value as any
            if (formInputValue.trim() === "") {
                const reviewFormValidationError = document.querySelector('.reviewFormValidationError')
                if (reviewFormValidationError) reviewFormValidationError.textContent = "This field is required"
                return true
            }
        } else if (steps[currentStep-1].key === "customQuestions") {
            let errors = false
            Object.keys(userInputState["customQuestionAnswers"]).forEach(key => {
                const questionId = key.split('customQuestion-')[1]
                document.querySelector(`#customQuestion-${questionId}Error`)?.classList.add('hidden')
                if (userInputState["customQuestionAnswers"][key].value[0] === '' && userInputState["customQuestionAnswers"][key].isRequired[0] === "true") {
                    document.querySelector(`#customQuestion-${questionId}Error`)?.classList.remove('hidden')
                    errors = true
                }
            })
            if (errors) return true
        }
    }

    const nextQuestion = useCallback(() => {
         // first, check if there are required questions unanswered
         const errors = validateFormFields()
         if (errors) return

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
    
        }})

        // reset input state whenever user navigates to a different review form
        setUserInputState(defaultState)
        setErrors({})

    }, [productsToReview])
    
    return (
        <div style={{backgroundColor: 'rgb(244, 244, 244)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
        </div>
    )
}