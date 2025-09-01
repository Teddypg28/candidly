import { Session } from "@prisma/client";

export default async function updateRatingMetafield(ratingMetafieldId: string, rating: string, productIdNumber: number, session: Session) {
    const { shop, accessToken } = session;
  
    if (!accessToken) {
      throw new Error('Missing access token in session');
    }
  
    const url = `https://${shop}/admin/api/2024-07/metafields/${ratingMetafieldId}.json`;
  
    const payload = {
      metafield: {
        id: ratingMetafieldId,
        type: "rating",
        value: JSON.stringify({
          value: parseFloat(rating),
          scale_min: 1.0,
          scale_max: 5.0
        }),
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
      throw new Error(`Failed to update rating metafield: ${response.statusText}`);
    }
  
    return await response.json();
  };
  