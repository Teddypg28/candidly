import crypto from 'crypto'

export default async function generateReviewRequestHash() {
    return crypto.randomBytes(32).toString('hex')
}
