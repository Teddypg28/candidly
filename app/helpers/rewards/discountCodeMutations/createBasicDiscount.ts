import { generateRandomDiscountCode } from "./generateRandomDiscountCode"
import db from '../../../db.server'

// generates a percent off or dollar off discount depedning on reward setting
export default async function createBasicDiscount(rewardSettingsId: string, store: string) {

    const reward = await db.rewardSetting.findFirst({where: {id: {equals: rewardSettingsId}}, include: {eligibleCollections: true, eligibleProducts: true}})
    const storeSession = await db.session.findFirst({where: {shop: {equals: store}}})
    
    if (reward && storeSession) {

        const accessToken = storeSession.accessToken
    
        let rewardTitle = ""
            
        if (reward?.selectedRewardType === "dollar") {
            rewardTitle = `$${reward.dollarAmount} Off Coupon`
        } else if (reward?.selectedRewardType === "percent") {
            rewardTitle = `${reward.percentageAmount}% Off Coupon`
        }
    
        const mutation = `
        mutation CreateDiscountCode($basicCodeDiscount: DiscountCodeBasicInput!) {
            discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
              codeDiscountNode {
                id
                codeDiscount {
                  ... on DiscountCodeBasic {
                    title
                    startsAt
                    endsAt
                    customerSelection {
                      ... on DiscountCustomers {
                        customers {
                          id
                        }
                      }
                    }
                    customerGets {
                      value {
                        ... on DiscountPercentage {
                          percentage
                        }
                      }
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }`
    
        const variables = {
            basicCodeDiscount: {
              title: rewardTitle,
              code: generateRandomDiscountCode(),
              startsAt: new Date(),
              endsAt: null,
              customerSelection: {
                all: true
              },
              customerGets: {
                value: 
                  reward?.selectedRewardType === "percent" ? { percentage: reward.percentageAmount } : {discountAmount: {amount: reward?.dollarAmount}},
                items: {
                  all: reward?.productCollectionConfiguration === "all",
                  products: {
                    productsToAdd: reward?.productCollectionConfiguration === "all" ? [] : reward?.eligibleProducts.map(product => product.productId)
                  },
                  collections: {
                    add: reward?.productCollectionConfiguration === "all" ? [] : reward?.eligibleCollections.map(product => product.collectionId)
                  }
                }
              },
              minimumRequirement: reward?.minPurchaseType === "dollars" ? {
                subtotal: {
                  greaterThanOrEqualToSubtotal: reward.minPurchaseDollarValue
                }
              } : reward?.minPurchaseType === "quantity" ? {
                quantity: {greaterThanOrEqualToQuantity: reward.minPurchaseQuantityValue}
              } : 
              {},
              usageLimit: 1,
              appliesOncePerCustomer: true
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
        console.log(data.data.discountCodeBasicCreate.userErrors)
    }
}