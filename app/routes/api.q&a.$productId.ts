import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

import db from '../db.server'

export async function loader({request, params} : LoaderFunctionArgs) {

    const { session } = await authenticate.public.appProxy(request)

    if (session && params.productId) {
        try {
            const questionsWithAnswers = await db.customerQuestion.findMany({where: {store: {equals: session.shop}, productId: {equals: `gid://shopify/Product/${params.productId}`}}, include: {answer: true}, omit: {productId: true}})
            const data = {
                questions: questionsWithAnswers
            }
            if (questionsWithAnswers) {
                return new Response(JSON.stringify(data), {status: 200})
            } else {
                return new Response('[]', {status: 200})
            }
        } catch (error) {
            console.log(error)
            return new Response(JSON.stringify(error), {status: 500})
        }
    }
}