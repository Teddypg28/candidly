import { ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import db from '../db.server'

export const action = async ({ request } : ActionFunctionArgs) => {

    try {
        
        const { session } = await authenticate.admin(request)
    
        const data = await request.json()

        if (data.action === 'delete') {
           
            return await db.savedCustomQuestionsTableView.delete({where: {id: data.id, AND: {store: {equals: session.shop}}}})

        }

        if (data.action === 'rename') {

            return await db.savedCustomQuestionsTableView.update({where: {id: data.id, AND: {store: {equals: session.shop}}}, data: {name: data.name}})

        }

        if (data.action === 'edit') {

            const updatedView = await db.savedCustomQuestionsTableView.update({where: {id: data.id, AND: {store: {equals: session.shop}}}, data: data.updatedData})
            return json({...updatedView, sortSelected: [updatedView.sortSelected]})

        }
    
        const newView = await db.savedCustomQuestionsTableView.create({data: {...data, store: session.shop}})

        return json({...newView, sortSelected: [newView.sortSelected]})

    } catch (error) {

        return json({message: error}, {status: 400})
        
    }
}