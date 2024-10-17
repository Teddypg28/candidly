import { SessionData } from "@remix-run/node";

import db from '../db.server'

export default async function publishReviews(session: SessionData, reviewIds: any[]) {

    try {

        await Promise.all(reviewIds.map(async (id) => {

            return await db.productReview.update({where: {id: parseInt(id), AND: {store: {equals: session.shop}}}, data: {isPublished: true}})
    
        }))

        return {success: true}
        
    } catch (error) {
        
        return {success: false}
        
    }


}