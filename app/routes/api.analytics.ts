import { ActionFunctionArgs } from "@remix-run/node";
import getAnalyticsData from "~/helpers/getAnalyticsData";
import { authenticate } from "~/shopify.server";

export async function action({request} : ActionFunctionArgs) {
    const { session, admin } = await authenticate.admin(request)

    const data = await request.json()
    const dateRange = data.dateRange

    return await getAnalyticsData(session, admin, dateRange)
}