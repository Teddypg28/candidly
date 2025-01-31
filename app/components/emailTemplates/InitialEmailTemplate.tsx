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
        Thanks a ton for being a part of our journey. We can’t wait to hear what you think!
        <br />
        <br />
        - {companyName}
    </p>
  )
}

export default InitialEmailTemplate
