import uploadImageToS3 from "./uploadImageToS3"
import db from '../db.server'

export default async function uploadLogo(newLogo: File, settingsId: string) {
    const result = await uploadImageToS3(newLogo)
    return await db.reviewRequestEmailLogo.create({data: 
        {
            name: (result.Location as string).split('.com/')[1].split('-timestamp-separator-')[1] as string, 
            url: result.Location as string,
            reviewRequestEmailSettingsId: settingsId
        }
    })
}