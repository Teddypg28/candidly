import { SESClient } from "@aws-sdk/client-ses"

export default new SESClient({
    region: process.env.SES_AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
    }
})
