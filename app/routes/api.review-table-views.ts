import { ActionFunctionArgs } from "@remix-run/node"

import { authenticate } from "~/shopify.server"

import db from '../db.server'
import { json } from "@remix-run/node"
import stringsToArrays from "~/helpers/stringsToArrays"

export const action = async ({ request } : ActionFunctionArgs) => {

    const { session } = await authenticate.admin(request)

    const data = await request.json()

    if (data.action === 'rename') {

        return await db.savedReviewsTableViews.update({where: {id: data.id, AND: {store: {equals: session.shop}}}, data: {name: data.name}})

    }

    if (data.action === 'edit') {

        const updatedView = await db.savedReviewsTableViews.update({where: {id: data.id, AND: {store: {equals: session.shop}}}, data: data.updatedData})
        return json({...updatedView, sortSelected: [updatedView.sortSelected]})

    }

    if (data.action === 'delete') {

        return await db.savedReviewsTableViews.delete({where: {id: data.id, AND: {store: {equals: session.shop}}}})
        
    }

    const updatedData =  {
        ...data.data, 
        store: session.shop, 
        sortSelected: data.data.sortSelected?.toString(),
        selectedRatings: data.data.selectedRatings?.toString() || null, 
        selectedProducts: data.data.selectedProducts?.toString() || null
    }

    if (data.data.id !== undefined) {
        
        const rowId = data.data.id

        delete updatedData['id']

        const updatedView = await db.savedReviewsTableViews.update({where: {id: rowId}, omit: {store: true}, data: updatedData})

        return json(stringsToArrays(updatedView))

    }

    delete data.data['id']

    const newView = await db.savedReviewsTableViews.create({data: updatedData, omit: {store: true}})

    return json(stringsToArrays(newView))

}