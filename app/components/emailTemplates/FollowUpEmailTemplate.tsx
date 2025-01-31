
function FollowUpEmailTemplate({ companyName } : {companyName?: string}) {
  return (
    <p>
        We hope you’re doing well! We wanted to follow up on our previous email about your [product name] experience. Your thoughts are incredibly important to us, and we’d truly value hearing your feedback.
        <br />
        <br />
        Remember: Completing the quick review form takes just a minute, and as a thank-you, you’ll be eligible for a reward of up to [max reward]!
        <br />
        <br />
        <svg style={{height: '40px', width: '40px', cursor: 'pointer'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path id="star1" d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
        </svg>
        <svg style={{height: '40px', width: '40px', cursor: 'pointer'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path id="star2" d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
        </svg>
        <svg style={{height: '40px', width: '40px', cursor: 'pointer'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path id="star3" d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
        </svg>
        <svg style={{height: '40px', width: '40px', cursor: 'pointer'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path id="star4" d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
        </svg>
        <svg style={{height: '40px', width: '40px', cursor: 'pointer'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path id="star5" d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>
        </svg>  
        <br />
        <br />
        Thank you so much for your time and for being a valued part of our community.
        <br />
        <br />
        - {companyName}
    </p>
  )
}

export default FollowUpEmailTemplate
