import { ActionFunctionArgs, json } from "@remix-run/node"
import { authenticate } from "~/shopify.server"
import db from '../db.server'

export async function action({ request } : ActionFunctionArgs) {

    try {            
            const { session, admin } = await authenticate.public.appProxy(request)
        
            if (session && admin) {
                const data = await request.json()
                
                const customQuestionData = {...data.customQuestionAnswers}
                delete data['customQuestionAnswers']
                
                const answerChoiceSets = Object.keys(customQuestionData)
                    .filter(key => customQuestionData[key].type === 'radio')
                    .map(key =>  customQuestionData[key].value)
                
                const answerChoiceIds: string[] = []
                answerChoiceSets.forEach(set => {
                    set.forEach((answerId: string) => {
                        answerChoiceIds.push(answerId)
                    })
                })
                
                await db.productReview.create({data: {...data, store: session.shop, date: new Date(), isPublished: false, customQuestionAnswers: {connect: answerChoiceIds.map(id => ({id: parseInt(id)}))}}})

                return json({status: 'success'}, {status: 200})
            } 
        
    } catch (error) {
        
        console.log(error)

        return new Response(JSON.stringify({status: 'review verification failed'}), {status: 400})


    }
}
