import styles from '../styles/ReviewSubmitted.module.css'

const ReviewSubmittedMessage = () => {
  return (
    <div className={styles.container}>
        <h1 className={styles.message}>Thank you for your review!</h1>
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
