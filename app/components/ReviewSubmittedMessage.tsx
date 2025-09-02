import styles from '../styles/ReviewSubmitted.module.css'

const ReviewSubmittedMessage = ({isReward, firstName}: {isReward: boolean, firstName: string}) => {
  return (
    <div className={styles.container}>
        <h1 className={styles.message}>Thank you for your review, {firstName}!</h1>
        {isReward ? <p className={styles.mediaUploadRewardMessage}>Upon successfully verifying your review, we will be emailing you a special discount code!</p> : ""}
        <img 
        src="/green-checkmark.webp" 
        className={styles.greenCheck}
        style={{zIndex: 100}}
        draggable="false"
        />
    </div>
  )
}

export default ReviewSubmittedMessage