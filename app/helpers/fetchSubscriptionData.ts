export default async function fetchSubscriptionData(subscriptionId: string, store: string, accessToken: string) {
 
    const subscriptionDataQuery = `
    query {
        node(id: "${subscriptionId}") {
          ...on AppSubscription {
            createdAt
            currentPeriodEnd
            id
            name
            status
            test
            lineItems {
              id
              plan {
                pricingDetails {
                  ...on AppRecurringPricing {
                    interval
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const res = await fetch(`https://${store}/admin/api/2024-01/graphql.json`, {
          method: 'POST', 
          headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': accessToken,
          },
          body: JSON.stringify({query: subscriptionDataQuery})
      })

    const data = await res.json()
    if (data.data.node === null) return null

    const price = parseFloat(data.data.node.lineItems[0].plan.pricingDetails.price.amount)
    const endsAt = data.data.node.currentPeriodEnd

    return { price, endsAt }

}