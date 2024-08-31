import { Card } from "@shopify/polaris"

import styles from '../styles/ReviewPreview.module.css'

interface Props {
    formHeading: string,
    formSubheading: string,
    primaryColor: string
}

const ReviewFormPreview = ( {formHeading, formSubheading, primaryColor } : Props ) => {
  return (
    <Card>
        <form className={styles.reviewForm}>
            <div className={styles.reviewFormHeadingContainer}>
                <h1>{formHeading}</h1>
                <h3>{formSubheading}</h3>
                <div className={styles.reviewFormStarsContainer}>
                    <svg className={styles.reviewFormStar} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" fill="#000000" stroke={primaryColor}><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M62 25.154H39.082L32 3l-7.082 22.154H2l18.541 13.693L13.459 61L32 47.309L50.541 61l-7.082-22.152L62 25.154z" fill={primaryColor}></path></g></svg>
                    <svg className={styles.reviewFormStar} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" fill="#000000" stroke={primaryColor}><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M62 25.154H39.082L32 3l-7.082 22.154H2l18.541 13.693L13.459 61L32 47.309L50.541 61l-7.082-22.152L62 25.154z" fill={primaryColor}></path></g></svg>
                    <svg className={styles.reviewFormStar} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" fill="#000000" stroke={primaryColor}><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M62 25.154H39.082L32 3l-7.082 22.154H2l18.541 13.693L13.459 61L32 47.309L50.541 61l-7.082-22.152L62 25.154z" fill={primaryColor}></path></g></svg>
                    <svg className={styles.reviewFormStar} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" fill="#000000" stroke={primaryColor}><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M62 25.154H39.082L32 3l-7.082 22.154H2l18.541 13.693L13.459 61L32 47.309L50.541 61l-7.082-22.152L62 25.154z" fill={primaryColor}></path></g></svg>
                    <svg className={styles.reviewFormStar} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" fill="#000000" stroke={primaryColor}><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M62 25.154H39.082L32 3l-7.082 22.154H2l18.541 13.693L13.459 61L32 47.309L50.541 61l-7.082-22.152L62 25.154z" fill={primaryColor}></path></g></svg>
                </div>
            </div>
            <div className={styles.reviewFieldWrapper}>
                <label> Give it a Headline * </label>
                <input disabled name='title' placeholder='Sum up your experience in a few short words' />
            </div>
            <div className={styles.reviewFieldWrapper}>
                <label>Review *</label>
                <textarea disabled name='body' className={styles.reviewTextArea} placeholder='What did you like or not like?'></textarea>
            </div>
            <div className={styles.reviewNameEmailWrapper}>
                <div className={styles.reviewNameEmailContainer}>
                    <label>Your First Name *</label>
                    <input disabled type='name' name='name' />
                </div>
                <div className={styles.reviewNameEmailContainer}>
                    <label>Your Email Address *</label>
                    <input disabled type='email' name='email' />
                </div>
            </div>
            <div className={styles.uploadMediaContainer}>
                <input disabled type='file' className={styles.uploadMediaBtn} accept='image/*, video/*' multiple />
                <label htmlFor='uploadMediaBtn'>
                    <p>Upload Media</p>
                    <svg viewBox="0 0 1024 1024" className={styles.uploadIcon} version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M220.5 245.4c-32.8 32.8-55.1 73.2-65.2 117.3h16.5c18.8-75.3 75.1-135.9 148-160.7v-16.9c-37.1 11.6-71 32-99.3 60.3z" fill="#000000"></path><path d="M959.9 540.8c0 113.6-92.1 205.8-205.7 205.9H590.9v-44h163.3c43.2 0 83.8-16.9 114.3-47.4 30.6-30.6 47.4-71.2 47.4-114.5 0-43.2-16.8-83.9-47.4-114.4S797.2 379 754 379c-11.5 0-22.8 1.2-33.8 3.5-15 3.2-29.4 8.4-42.8 15.7-1-15.4-3.3-30.7-6.8-45.6v-0.1c-3.6-15.6-8.6-30.8-14.9-45.7-14.4-33.9-34.9-64.4-61.1-90.6-26.2-26.2-56.6-46.7-90.6-61.1-35.1-14.8-72.4-22.4-110.9-22.4s-75.8 7.5-110.9 22.4c-33.9 14.3-64.4 34.9-90.6 61.1-26.2 26.2-46.7 56.7-61.1 90.6-14.9 35.1-22.4 72.4-22.4 110.9s7.5 75.8 22.4 110.9c14.3 33.9 34.9 64.4 61.1 90.6 26.2 26.2 56.7 46.7 90.6 61.1 35.1 14.8 72.4 22.4 110.9 22.4h39.7v44h-41C210.7 746 64.1 599 64.1 417.7c0-181.7 147.3-329 329-329 154.6 0 284.3 106.6 319.5 250.3v0.1c13.4-2.7 27.2-4.2 41.4-4.2 113.7 0.1 205.9 92.2 205.9 205.9z" fill="#39393A"></path><path d="M692.9 636.1h-22.6L519.8 485.6v449.6h-16V485.8L353.4 636.1h-22.6l181-181z" fill="#000000"></path></g></svg>            
                </label>
                <div className={styles.uploadedMediaContainer}></div>
            </div>
            <button disabled className={styles.submitReviewBtn} style={{backgroundColor: primaryColor}}>Submit Review</button>
        </form>
    </Card>
  )
}

export default ReviewFormPreview
