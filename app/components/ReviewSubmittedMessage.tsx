import styles from '../styles/ReviewSubmitted.module.css'

const ReviewSubmittedMessage = ({isReward, firstName}: {isReward: boolean, firstName: string}) => {
  return (
    <div className={styles.container}>
        <h1 className={styles.message}>Thank you for your review, {firstName}!</h1>
        {isReward ? <p className={styles.mediaUploadRewardMessage}>Check your email for a special discount code.</p> : ""}
        <img 
        src="/green-checkmark.webp" 
        height={'150px'}
        style={{zIndex: 100}}
        draggable="false"
        />
    </div>
  )
}

export default ReviewSubmittedMessage