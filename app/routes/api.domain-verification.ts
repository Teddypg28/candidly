import { ActionFunctionArgs } from "@remix-run/node";
import { fetchCnames } from "~/helpers/domainVerification/fetchCnames";

export const action = async ({ request } : ActionFunctionArgs) => {
    try {
        const data = await request.json()
        return await fetchCnames(data.domain)
    } catch (error) {
        return new Response(JSON.stringify({error}), {status: 400})
    }
}