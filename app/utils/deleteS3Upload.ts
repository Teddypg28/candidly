import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import s3Client from './s3Client'

export default async function deleteS3Upload(mediaRecord: any) {
    const bucketKey = mediaRecord.url.split('.com/')[1]
    const deleteCommand = new DeleteObjectCommand({Bucket: process.env.S3_BUCKET_NAME, Key: bucketKey})
    await s3Client.send(deleteCommand)
}