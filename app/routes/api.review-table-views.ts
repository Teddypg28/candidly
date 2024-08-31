import { ActionFunctionArgs } from "@remix-run/node"

import { authenticate } from "~/shopify.server"

import db from '../db.server'
import { json } from "@remix-run/node"
import stringsToArrays from "~/helpers/stringsToArrays"

export const action = async ({ request } : ActionFunctionArgs) => {

    const { session } = await authenticate.admin(request)

    const req = await request.json()

    if (req.action === 'delete') {

        const { id, name } = req.data

        if (req.data.id) {

            return await db.savedReviewsTableViews.delete({where: {id}})

        }

        const viewToDelete = await db.savedReviewsTableViews.findFirst({where: {store: {equals: session.shop}, AND: {name: {equals: name}}}})

        if (viewToDelete) {

            return await db.savedReviewsTableViews.delete({where: {id: viewToDelete.id}})

        }
    }

    const updatedData =  {
        ...req.data, 
        store: session.shop, 
        sortSelected: req.data.sortSelected?.toString(),
        selectedRatings: req.data.selectedRatings?.toString() || null, 
        selectedProducts: req.data.selectedProducts?.toString() || null
    }

    if (req.data.id !== undefined) {
        
        const rowId = req.data.id

        delete updatedData['id']

        const updatedView = await db.savedReviewsTableViews.update({where: {id: rowId}, omit: {store: true}, data: updatedData})

        return json(stringsToArrays(updatedView))

    }

    delete req.data['id']

    const newView = await db.savedReviewsTableViews.create({data: updatedData, omit: {store: true}})

    return json(stringsToArrays(newView))

}