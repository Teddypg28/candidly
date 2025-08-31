import { Session } from "@prisma/client";

export default async function createRatingCountMetafield(productIdNumber: number, totalReviews: number, session: Session) {
    const { shop, accessToken } = session;
  
    if (!accessToken) {
      throw new Error('Missing access token in session');
    }
  
    const url = `https://${shop}/admin/api/2024-07/metafields.json`;
  
    const payload = {
      metafield: {
        namespace: "reviews",
        key: "rating_count",
        type: "number_integer",
        value: totalReviews.toString(),
        owner_resource: "product",
        owner_id: productIdNumber
      }
    };
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify(payload)
    });
  
    if (!response.ok) {
      throw new Error(`Failed to create rating_count metafield: ${response.statusText}`);
    }
  
    return await response.json();
  };
  