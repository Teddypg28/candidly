function FollowUpEmailTemplate({ companyName } : {companyName?: string}) {
  return (
    <p>
        We hope you’re doing well! We wanted to follow up on our previous email about your [product name] experience. Your thoughts are incredibly important to us, and we’d truly value hearing your feedback.
        <br />
        <br />
        Remember: Completing the quick review form takes just a minute, and as a thank-you, you’ll be eligible for a reward of up to [max reward]!
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