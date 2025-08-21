import { generateRandomDiscountCode } from "./generateRandomDiscountCode"
import db from '../../../db.server'

// generates a free shipping discount
export default async function createFreeShippingDiscount(rewardSettingsId: string, store: string) {

    const reward = await db.rewardSetting.findFirst({where: {id: {equals: rewardSettingsId}}, include: {eligibleCollections: true, eligibleProducts: true}})
    const storeSession = await db.session.findFirst({where: {shop: {equals: store}}})
    
    if (reward && storeSession) {

        const accessToken = storeSession.accessToken
        
        const mutation = `
        mutation discountCodeFreeShippingCreate($freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
            discountCodeFreeShippingCreate(freeShippingCodeDiscount: $freeShippingCodeDiscount) {
              codeDiscountNode {
                id
                codeDiscount {
                  ... on DiscountCodeFreeShipping {
                    title
                    startsAt
                    endsAt
                    usageLimit
                    maximumShippingPrice {
                      amount
                    }
                    customerSelection {
                      ... on DiscountCustomerAll {
                        allCustomers
                      }
                    }
                    destinationSelection {
                      ... on DiscountCountryAll {
                        allCountries
                      }
                    }
                    minimumRequirement {
                      ... on DiscountMinimumSubtotal {
                        greaterThanOrEqualToSubtotal {
                          amount
                        }
                      }
                    }
                    codes(first: 2) {
                      nodes {
                        code
                      }
                    }
                  }
                }
              }
              userErrors {
                field
                code
                message
              }
            }
          }`
    
        const randomDiscountCode = generateRandomDiscountCode()
        const variables = {
            freeShippingCodeDiscount: {
              startsAt: new Date(),
              appliesOncePerCustomer: true,
              customerSelection: {
                all: true
              },
              usageLimit: 1,
              title: "Free Shipping Coupon",
              code: randomDiscountCode,
              minimumRequirement: reward?.minPurchaseType === "dollars" ? {
                subtotal: {
                  greaterThanOrEqualToSubtotal: reward.minPurchaseDollarValue
                }
              } : reward?.minPurchaseType === "quantity" ? {
                quantity: {greaterThanOrEqualToQuantity: reward.minPurchaseQuantityValue.toString()}
              } : 
              {},
              destination: {
                all: true
              }
            }
          }
    
        const res = await fetch(`https://${store}/admin/api/2024-01/graphql.json`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            body: JSON.stringify({query: mutation, variables})
        })
        const data = await res.json()
        const errors = data.data.discountCodeFreeShippingCreate.userErrors

        if (errors.length > 0) return null

        return randomDiscountCode
    }

    return null
}