import { Upload } from "@aws-sdk/lib-storage"
import s3Client from "./s3Client"

export default async function uploadImageToS3(file: File) {
    const uploadParams = {
        client: s3Client,
        params: {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${Date.now()}-timestamp-separator-${file.name}`,
            Body: file.stream()
        }
    }
    const upload = new Upload(uploadParams)
    const result = await upload.done()
    return result
}
