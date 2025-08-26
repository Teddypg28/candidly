import { generateRandomDiscountCode } from "./generateRandomDiscountCode"
import db from '../../../db.server'

// generates a buy x, get y discount
export default async function createBxgyDiscount(rewardSettingsId: string, store: string) {
    const reward = await db.rewardSetting.findFirst({where: {id: {equals: rewardSettingsId}}, include: {eligibleCollections: true, eligibleProducts: true}})
    const storeSession = await db.session.findFirst({where: {shop: {equals: store}}})
    
    if (reward && storeSession) {
        const accessToken = storeSession.accessToken

        const discountTitle = `Buy ${reward.bxgyPurchaseAmount} Get ${reward.bxgyReceiveAmount} ${reward.bxgyRewardType === "free" ? "Free" :
        reward.bxgyRewardType === "dollar" ? `$${reward.bxgyDollarAmount}` : `${reward.bxgyPercentageAmount}%`} Off Discount`
        
        const mutation = `
        mutation discountCodeBxgyCreate($bxgyCodeDiscount: DiscountCodeBxgyInput!) {
            discountCodeBxgyCreate(bxgyCodeDiscount: $bxgyCodeDiscount) {
              codeDiscountNode {
                codeDiscount {
                  ... on DiscountCodeBxgy {
                    title
                    codes(first: 10) {
                      nodes {
                        code
                      }
                    }
                    startsAt
                    endsAt
                    customerBuys {
                      items {
                        ...collectionsFragment
                        ...productsFragment
                      }
                      value {
                        ... on DiscountQuantity {
                          quantity
                        }
                      }
                    }
                    customerGets {
                      appliesOnOneTimePurchase
                      value {
                        ... on DiscountOnQuantity {
                          effect {
                            ... on DiscountPercentage {
                              percentage
                            }
                          }
                          quantity {
                            quantity
                          }
                        }
                      }
                      items {
                        ...collectionsFragment
                        ...productsFragment
                      }
                    }
                    customerSelection {
                      ... on DiscountCustomerAll {
                        allCustomers
                      }
                    }
                    appliesOncePerCustomer
                    usesPerOrderLimit
                  }
                }
              }
              userErrors {
                field
                code
                message
              }
            }
          }
          
          fragment collectionsFragment on DiscountCollections {
            collections(first: 10) {
              nodes {
                id
                title
              }
            }
          }
          
          fragment productsFragment on DiscountProducts {
            products(first: 10) {
              nodes {
                id
                title
              }
            }
          }`
    
        const randomDiscountCode = generateRandomDiscountCode()
        const variables = {
            bxgyCodeDiscount: {
              code: randomDiscountCode,
              customerBuys: {
                items: {
                  products: {
                    productsToAdd: [reward.bxgyPurchaseProductId]
                  }
                },
                value: {
                  quantity: reward.bxgyPurchaseAmount.toString()
                }
              },
              customerGets: {
                items: {
                  products: {
                    productsToAdd: [reward.bxgyReceiveProductId]
                  }
                },
                value: {
                  discountOnQuantity: {
                        effect: reward.bxgyRewardType === "dollar" ? {
                            amount: reward.bxgyDollarAmount
                        } : {
                            percentage: reward.bxgyRewardType === "free" ? 100 : reward.bxgyPercentageAmount
                        },
                        quantity: reward.bxgyReceiveAmount.toString()
                    },
                }
            },
            customerSelection: {
                all: true
            },
            startsAt: new Date(),
            title: discountTitle,
            usesPerOrderLimit: 1
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
        const errors = data.data.discountCodeBxgyCreate.userErrors
        
        if (errors.length > 0) return null

        return randomDiscountCode
    }

    return null
}