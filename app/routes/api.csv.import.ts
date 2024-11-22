import { ActionFunctionArgs, json } from "@remix-run/node";
import importCsvFile from "~/helpers/importCsvFile";
import { authenticate } from "~/shopify.server";

export const action = async ({request} : ActionFunctionArgs) => {

    try {

        const { session } = await authenticate.admin(request)
        const csvFileData = await request.formData()
        await importCsvFile(session, csvFileData)
        return json({ok: true}, {status: 200})

    } catch (error) {

        return json({ok: false, error}, {status: 400})

    }

}