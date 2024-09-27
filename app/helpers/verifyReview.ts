export default async function verifyReview(graphql: any, reviewerEmail: string, productId: number) {

    const productNameQuery = `query getProductTitle($id: ID!) {
        product(id: $id) {
          title
          }
    }`

    const fullProductId = `gid://shopify/Product/${productId}`

    const productNameQueryResult = await graphql(productNameQuery, {variables: {id: fullProductId}})

    const productName = await (await productNameQueryResult.json()).data.product.title

    // ------------------------------

    const initialQuery = `
    query customerOrders {
 
        orders(first: 250) {
          nodes {
            email
            lineItems(first:150) {
              nodes {
                title
              }
            }
          }
          pageInfo {
            hasNextPage,
            endCursor
          }
        }
        
      }
    `

    const verify = async (query: string) => {

        const queryResult = await (await graphql(query)).json()

        const orders = queryResult.data.orders.nodes

        let result = false

        for (let i = 0; i<orders.length; i++) {

            if (orders[i].email === reviewerEmail) {

                const lineItems = orders[i].lineItems.nodes
                
                let productNameExists: boolean = false

                for (let x = 0; x<lineItems.length; i++) {
                    if (lineItems[x].title === productName) {
                        return productNameExists = true
                    }
                }

                if (productNameExists) {
                    return result = true
                }

            }

        }

        if (!result && queryResult.data.orders.pageInfo.hasNextPage) {

            const query = `query customerOrders {
 
                orders(first: 250, last: ${queryResult.data.orders.pageInfo.endCursor}) {
                  nodes {
                    email
                    lineItems(first:150) {
                      nodes {
                        title
                      }
                    }
                  }
                  pageInfo {
                    hasNextPage,
                    endCursor
                  }
                }
                
              }`

            return verify(query)

        } else {

            return result

        }

    }
    
    return await verify(initialQuery)

}