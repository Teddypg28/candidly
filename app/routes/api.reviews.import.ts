import { ActionFunctionArgs, json } from "@remix-run/node"

import scraperRouter from "../scrapers/scraperRouter";

export const action = async ({ request } : ActionFunctionArgs) => {

    const data = await request.json()

    try {
        
        const reviews = await scraperRouter(data)

        console.log(reviews)

        return reviews
    
    } catch (error) {

        console.log(error)
        
        return json({message: 'There was an error while processing. Please double check your product link.'}, {"status": 400})
    
    }

}
