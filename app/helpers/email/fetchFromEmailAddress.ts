import db from '../../db.server'
import { verifyRecords } from '../domainVerification/verifyRecords'

// verify that we are able to send emails on behalf of the store's domain
export const fetchFromEmailAddress = async (store: string, type: "reviews" | "questions") => {
    const appSettings = await db.appSettings.findFirst({where: {store: {equals: store}}})
    const currentDomain = appSettings?.domain
    if (currentDomain) {
        const verificationStatus = await verifyRecords(currentDomain)
        if (verificationStatus === "Success") return `${type}@${currentDomain}` 
    }
    return `${type}@trycandidly.app`
}