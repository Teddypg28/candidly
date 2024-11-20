import { ActionFunctionArgs, json } from "@remix-run/node"
import { authenticate } from "~/shopify.server"
import db from '../db.server'

export async function action({ request } : ActionFunctionArgs) {

    try {            
            const { session, admin } = await authenticate.public.appProxy(request)
        
            if (session && admin) {
                const data = await request.json()

                const customQuestionData = {...data.customQuestions}
                delete data['customQuestions']
                
                const customQuestionAnswers = Object.keys(customQuestionData)
                    .filter(key => customQuestionData[key].type === 'radio')
                    .map(key => {
                        return {
                            value: customQuestionData[key].value,
                            label: customQuestionData[key].label,
                            display: customQuestionData[key].display === 'true' ? true : false
                        }
                    })
        
                await db.productReview.create({data: {...data, store: session.shop, date: new Date(), isPublished: false, customQuestionAnswers: {createMany: {data: customQuestionAnswers}}}})
        
                return json({status: 'success'}, {status: 200})
            } 
        
    } catch (error) {
        
        console.log(error)

        return new Response(JSON.stringify({status: 'review verification failed'}), {status: 400})


    }
}
