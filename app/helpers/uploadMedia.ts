import uploadImageToS3 from "~/utils/uploadImageToS3"
import db from '../db.server'

export default async function uploadMedia(uploadedMedia: File[], reviewId: number) {
    // upload each new file to s3
    const results = await Promise.all(uploadedMedia.map(async (file: File) => {
        return await uploadImageToS3(file as File)
    }))   
    await Promise.all(results.map(async (result) => {
        if (result.$metadata.httpStatusCode === 200) {
            // create new product review media db record
                await db.productReviewMedia.create({data: 
                    {
                        name: result.Location?.split('.com/')[1].split('-timestamp-separator-')[1] as string,
                        url: result.Location as string,
                        reviewId
                    }
            })
        }
    }))
}