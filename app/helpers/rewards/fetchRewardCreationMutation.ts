import { generateRandomDiscountCode } from "./generateRandomDiscountCode"

export const fetchRewardCreationMutation = (type: "percent" | "dollar" | "free-shipping" | "bogo", value?: number, minRequirementData?: {type: "quantity" | "subtotal", value: number}, bogoData?: {buyAmount: number, getAmount: number, value: {percentage?: number, amount?: number}}) => {

    if (type === "percent") {
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
                }

        `
        const variables = {
            "basicCodeDiscount": {
              "title": `Earn ${value}% Off`,
              "code": generateRandomDiscountCode(),
              "startsAt": new Date(),
              "customerGets": {
                "value": {
                  "percentage": value
                },
                "items": {
                  "all": true
                }
              },
              "customerSelection": {
                "all": true
              },
              "minimumRequirement": {
                "subtotal": {
                  "greaterThanOrEqualToSubtotal": minRequirementData?.type === "subtotal" ? minRequirementData.value : null
                },
                "quantity": {
                  "greaterThanOrEqualToQuantity": minRequirementData?.type === "quantity" ? minRequirementData.value : null
                }
              },
              "usageLimit": 1,
              "appliesOncePerCustomer": true
            }
        }
        return {mutation, variables}
    }

    if (type === "dollar") {
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
                            ... on DiscountAmount {
                              amount {
                                amount
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
            "basicCodeDiscount": {
                "title": `Earn $${value} Off`,
                "code": generateRandomDiscountCode(),
                "startsAt": new Date(),
                "customerGets": {
                    "value": {
                        "discountAmount": {
                            "amount": value
                        },
                    "items": {
                    "all": true
                    }
                },
                "customerSelection": {
                    "all": true
                },
                "minimumRequirement": {
                    "subtotal": {
                    "greaterThanOrEqualToSubtotal": minRequirementData?.type === "subtotal" ? minRequirementData.value : null
                    },
                    "quantity": {
                    "greaterThanOrEqualToQuantity": minRequirementData?.type === "quantity" ? minRequirementData.value : null
                    }
                },
                "usageLimit": 1,
                "appliesOncePerCustomer": true
                }
            }
        }
        return {mutation, variables}
    }

    if (type === "free-shipping") {
        const mutation = `mutation discountCodeFreeShippingCreate($freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
            discountCodeFreeShippingCreate(freeShippingCodeDiscount: $freeShippingCodeDiscount) {
            codeDiscountNode {
                id
                codeDiscount {
                ... on DiscountCodeFreeShipping {
                    title
                    startsAt
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
        const variables = {
        "freeShippingCodeDiscount": {
            "startsAt": new Date(),
            "appliesOncePerCustomer": true,
            "title": "Free Shipping",
            "code": generateRandomDiscountCode(),
            "minimumRequirement": {
                "subtotal": {
                  "greaterThanOrEqualToSubtotal": minRequirementData?.type === "subtotal" ? minRequirementData.value : null
                },
                "quantity": {
                  "greaterThanOrEqualToQuantity": minRequirementData?.type === "quantity" ? minRequirementData.value : null
                }
              },
            "customerSelection": {
                "all": true
            },
            "destination": {
                "all": true
            }
            }
        }
        return {mutation, variables}
    }

    if (type === "bogo") {
        const mutation = `mutation discountCodeBxgyCreate($bxgyCodeDiscount: DiscountCodeBxgyInput!) {
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
                    }
                    value {
                        ... on DiscountQuantity {
                        quantity
                        }
                    }
                    }
                    customerGets {
                    appliesOnOneTimePurchase
                    appliesOnSubscription
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
        }`
  
        const variables = {
        "bxgyCodeDiscount": {
            "code": generateRandomDiscountCode(),
            "customerBuys": {
            "items": {
                "collections": {
                "add": [
                    "gid://shopify/Collection/1007901140"
                ]
                }
            },
            "value": {
                "quantity": bogoData?.buyAmount
            }
            },
            "customerGets": {
            "items": {
                "collections": {
                "add": [
                    "gid://shopify/Collection/711838235"
                ]
                }
            },
            "value": {
                "discountOnQuantity": {
                "effect": {
                    "percentage": bogoData?.value.percentage,
                    "amount": bogoData?.value.amount
                },
                "quantity": bogoData?.getAmount
                }
            }
            },
            "customerSelection": {
                "all": true
            },
            "startsAt": new Date(),
            "title": `Buy ${bogoData?.buyAmount} Get ${bogoData?.getAmount} ${bogoData?.value.amount && '$'}${bogoData?.value.percentage || bogoData?.value.amount}${bogoData?.value.amount && '%'} Off`,
            "usesPerOrderLimit": 1
        }
        }
    }
}

