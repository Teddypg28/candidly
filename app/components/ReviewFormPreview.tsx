import { Card, Pagination } from "@shopify/polaris"

import styles from '../styles/ReviewForm.module.css'
import { useCallback, useEffect, useRef, useState } from "react"
import { initialUserReviewFormInputState, UserReviewFormInputState } from "~/types/types";
import fetchRewardTiersScore from "~/helpers/rewards/fetchRewardTiersScore";

interface Props {
    starRatingHeading: string;
    titleHeading: string;
    titlePlaceholder: string;
    customQuestionsHeading: string;
    bodyHeading: string;
    bodyPlaceholder: string;
    mediaHeading: string;
    rewardNames: string[]
}

const ReviewFormPreview = ( { starRatingHeading, titleHeading, titlePlaceholder, bodyHeading, bodyPlaceholder, mediaHeading, customQuestionsHeading, rewardNames } : Props ) => {

    const [currentStep, setCurrentStep] = useState<number>(1)

    const [userInputState, setUserInputState] = useState<UserReviewFormInputState>({
        ...initialUserReviewFormInputState, 
        firstName: "",
        email: ""
    })

    const uploadedMediaRef = useRef([])

    const reviewScore = fetchRewardTiersScore(userInputState.title, userInputState.body, uploadedMediaRef)

    const steps = [
        {
            title: starRatingHeading, 
            markup: <div id="reviewFormStarsContainer" className={styles.reviewFormStarsContainer}></div>, 
            key: "rating"
        }, 
        {
            title: titleHeading, 
            markup: 
                <input 
                className={styles.formQuestionInput}
                style={{width: '100%'}} 
                value={userInputState["title"]} 
                onChange={e => setUserInputState(prevState => {return {...prevState, title: e.target.value}})} 
                id='reviewHeadline' 
                name='title' 
                placeholder={titlePlaceholder} 
                />, 
            key: 'title'
        }, 
        {
            title: bodyHeading,
            markup: 
                <textarea 
                style={{width: '100%'}}
                className={styles.formQuestionInput} 
                value={userInputState["body"]}
                onChange={e => setUserInputState(prevState => {return {...prevState, body: e.target.value}})}
                name='body' 
                id='reviewTextArea' 
                placeholder={bodyPlaceholder}>
                </textarea>,
            key: 'body'
        },
        {
            title: mediaHeading, 
            markup: 
            <div>
                <div id="uploadMediaContainer" className={styles.uploadMediaContainer}>
                    <label id="uploadMediaLabel" className={styles.uploadMediaLabel} htmlFor='uploadMediaBtn'>
                        <p className={styles.uploadMediaText}>Upload Media</p>
                        <i className="fa-solid fa-upload"></i>
                    </label>
                    <div id="uploadedMediaContainer" className={styles.uploadedMediaContainer}></div>
                    <input disabled type='file' id='uploadMediaBtn' className={styles.uploadMediaBtn} accept='image/png, image/jpg, image/jpeg, video/*' multiple />
                </div>
                <p style={{fontStyle: 'italic'}}>media upload container disabled on preview</p>
            </div>, 
            key: 'uploadedMedia'},
        {title: customQuestionsHeading, markup: <div className={styles.customQuestionsContainer}>If you have custom questions configured, they will be displayed here on the real form</div>, key: 'customQuestions'}
    ]

    const currentStarRating = useRef(5)

    useEffect(() => {
        const linkTag = document.createElement('link')
        linkTag.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        linkTag.rel = "stylesheet"
        document.head.appendChild(linkTag)
    }, [])

    useEffect(() => {
        if (steps[currentStep-1].key === "rating") renderStars(currentStarRating.current)
    }, [currentStep])

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
                setCurrentStep(2)
            })
        })
    }, [])

    const progressMessageType = ["title", "body"].includes(steps[currentStep-1].key) ? `writing the perfect ${steps[currentStep-1].key}` : "uploading the perfect amount of media"
    const perfectedMessageType = ["title", "body"].includes(steps[currentStep-1].key) ? `wrote the perfect ${steps[currentStep-1].key}!` : 'uploaded the perfect amount of media!'
    const progressMessage = ["title", "body", "uploadedMedia"].includes(steps[currentStep-1].key) && reviewScore.tiers[steps[currentStep-1].key as keyof typeof reviewScore.tiers].score !== 3 ? `You are ${Math.round(reviewScore.tiers[steps[currentStep-1].key as keyof typeof reviewScore.tiers].length / reviewScore.tiers[steps[currentStep-1].key as keyof typeof reviewScore.tiers].perfectLength * 100)}% of the way to ${progressMessageType}` : `You ${perfectedMessageType}`

  return (
        <Card>
            <Pagination 
            hasNext={currentStep!==steps.length}
            hasPrevious={currentStep!==1}
            onNext={() => setCurrentStep(currentStep+1)}
            onPrevious={() => setCurrentStep(currentStep-1)}
            />
            <div style={{height: '80vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div id="writeReviewForm" className={styles.writeReviewForm} style={{width: '100%'}}>
                    <div>
                        <h1 className={styles.reviewFormStepTitle} style={{fontSize: '30px', lineHeight: '25px'}}>{steps[currentStep-1].title}</h1>
                        {steps[currentStep-1].key === "uploadedMedia" && <p style={{marginTop: '10px'}}>(Add at least 1 to perfect your review)</p>}
                    </div>
                    <div className={styles.inputContainer}>
                        {steps[currentStep-1].markup}
                        {["title", "body"].includes(steps[currentStep-1].key) && 
                        <div style={{width: "100%", textAlign: "left"}}>
                            <div style={{borderRadius: "5px", width: "100%", height: "17px", backgroundColor: "#e2e2e2", overflow: "hidden"}}>
                                <div className={styles.progressBar} style={{backgroundColor: reviewScore.tiers[steps[currentStep-1].key as keyof typeof reviewScore.tiers].score === 3 ? '#67af98' : 'black', height: "100%", width: `${Math.round(reviewScore.tiers[steps[currentStep-1].key as keyof typeof reviewScore.tiers].length / reviewScore.tiers[steps[currentStep-1].key as keyof typeof reviewScore.tiers].perfectLength * 100)}%`}}> </div>
                            </div>
                            <p style={{margin: "0px", padding: "0px", marginTop: "5px", fontSize: "14px", fontWeight: reviewScore.tiers[steps[currentStep-1].key as keyof typeof reviewScore.tiers].score === 3 ? 'bolder' : 'normal', color: reviewScore.tiers[steps[currentStep-1].key as keyof typeof reviewScore.tiers].score == 3 ? '#67af98' : 'black'}}>{progressMessage}</p>
                        </div>}
                    </div>
                </div>
            </div>
            <div>
                <div className={styles.rewardTiersContainer}>
                    <div className={styles.rewardTierOne} style={{backgroundColor: reviewScore.totalScore === 1 ? "black" : 'lightgray', filter: reviewScore.totalScore === 1 ? 'none' : "blur(1px)"}}>
                        <p style={{fontSize: '13px', fontWeight: 'bold'}}>{rewardNames[0]}</p>
                    </div>
                    <div className={styles.rewardTierTwo} style={{backgroundColor: reviewScore.totalScore === 2 ? "black" : 'lightgray', filter: reviewScore.totalScore === 2 ? 'none' : "blur(1px)"}}> 
                        <p style={{fontSize: '13px', fontWeight: 'bold'}}>{rewardNames[1]}</p>
                    </div>
                    <div className={styles.rewardTierThree} style={{backgroundColor: reviewScore.totalScore === 3 ? "black" : 'lightgray', filter: reviewScore.totalScore === 3 ? 'none' : "blur(1px)"}}>
                        <p style={{fontSize: '13px', fontWeight: 'bold'}}>{rewardNames[2]}</p>
                    </div>
                </div>
            </div>
        </Card>
  )
}

export default ReviewFormPreview