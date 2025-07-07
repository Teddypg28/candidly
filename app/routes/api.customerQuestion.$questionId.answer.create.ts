import { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

import db from '../db.server'

export async function action({ request, params } : ActionFunctionArgs) {
    try {
        const { session } = await authenticate.admin(request)
    
        const questionId = params.questionId as string
        const payload = await request.json()
        const { answerBody } = payload
    
        const question = await db.customerQuestion.findFirst({where: {id: {equals: questionId}}})
        if (!question) {
            return new Response(JSON.stringify({message: "Error creating answer. There is no question matching the ID provided."}), {status: 400})
        }
    
        return await db.customerQuestionAnswer.create({data: {store: session.shop, questionId, body: answerBody}})
    } catch (error) {
        return new Response(JSON.stringify({error}), {status: 500})
    }
}