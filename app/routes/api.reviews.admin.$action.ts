import { ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

import deleteReviews from "~/reviewsActionFunctions/deleteReviews";
import importCsvFile from "~/reviewsActionFunctions/importCsvFile";
import scraperRouter from "~/scrapers/scraperRouter";
import publishReviews from "~/reviewsActionFunctions/publishReviews";

export const action = async ({ request, params } : ActionFunctionArgs)  => {

    const { session, admin } = await authenticate.admin(request)

    try {

        const contentType = request.headers.get('content-type')

        if (contentType?.includes('application/json')) {
    
            const data = await request.json()

            if (params.action === 'delete') {
    
                await deleteReviews(session, admin, data.ids)
    
                return json({success: true}, {status: 200})
    
            }

            if (params.action === 'import') {

                const result = await scraperRouter(data)

                console.log(result.reviews)

                return json({success: true}, {status: 200})

            }

            if (params.action === 'publish') {

                await publishReviews(session, admin, data.ids)

                return json({success: true}, {status: 200})

            }     

        }

        const data = await request.formData()

        await importCsvFile(session, data)

        return json({success: true}, {status: 200})
        
    } catch (error) {

        console.log(error)

        return json({success: false}, {status: 400})
        
    }
}