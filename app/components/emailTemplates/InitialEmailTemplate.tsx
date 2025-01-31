
function InitialEmailTemplate({ companyName } : {companyName?: string}) {
  return (
    <p>
        We hope you’re absolutely loving your [product name]!
        <br />
        <br />
        We’d be so grateful if you could take a moment to share your experience. Your feedback not only helps us improve but also guides others in making confident choices.
        <br />
        <br />
        As a special thank-you, we’re offering a reward of up to [max reward] when you offer a quick rating. It’ll only take a minute of your time—and it would mean the world to us!
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
        Thanks a ton for being a part of our journey. We can’t wait to hear what you think!
        <br />
        <br />
        - {companyName}
    </p>
  )
}

export default InitialEmailTemplate
