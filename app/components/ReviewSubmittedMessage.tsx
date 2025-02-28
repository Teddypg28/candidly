
const ReviewSubmittedMessage = () => {
  return (
    <div style={
        {
            position: 'fixed', 
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
        <h1>Thank you for your review!</h1>
        <img 
        src="/green-checkmark.webp" 
        height={'150px'}
        style={{zIndex: 100}}
        />
    </div>
  )
}

export default ReviewSubmittedMessage
