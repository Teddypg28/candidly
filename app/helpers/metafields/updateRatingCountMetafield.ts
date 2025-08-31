import { Session } from "@prisma/client";

export default async function updateRatingCountMetafield(ratingMetafieldId: string, productIdNumber: number, totalReviews: number, session: Session){
    const { shop, accessToken } = session;
  
    if (!accessToken) {
      throw new Error('Missing access token in session');
    }
  
    const url = `https://${shop}/admin/api/2024-07/metafields/${ratingMetafieldId}.json`;
  
    const payload = {
      metafield: {
        id: ratingMetafieldId,
        namespace: "reviews",
        key: "rating_count",
        type: "number_integer",
        value: totalReviews.toString(),
        owner_resource: "product",
        owner_id: productIdNumber
      }
    };
  
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify(payload)
    });
  
    if (!response.ok) {
      throw new Error(`Failed to update rating count metafield: ${response.statusText}`);
    }
  
    return await response.json();
  };
  