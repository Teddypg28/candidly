import { Session } from "@shopify/shopify-app-remix/server";

export default async function deleteMetafield (metafieldId: string, shop: string, accessToken: string) {
   
    if (!accessToken) throw new Error("invalid access token")
  
    const url = `https://${shop}/admin/api/2024-07/metafields/${metafieldId}.json`;
  
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
      }
    });
  
    if (!response.ok) {
      throw new Error(`Failed to delete metafield ${metafieldId}: ${response.statusText}`);
    }
  };