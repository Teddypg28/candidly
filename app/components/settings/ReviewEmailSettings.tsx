import { BlockStack, Button, Card, ChoiceList, Image, InlineStack, Text } from "@shopify/polaris";
import { SettingsPageProps } from "~/types/types";

import { ImageIcon } from "@shopify/polaris-icons";

export default function ReviewEmailSettings({state, setState} : SettingsPageProps) {

    const selectProducts = async () => {
        const products = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
            multiple: true
        })

        if (products) {

            setState({...state, displayProducts: products.map(product => { 
                return {
                    productId: product.id, 
                    title: product.title,
                    imageUrl: product.images.length > 0 ? product.images[0].originalSrc : null,
                }
            })})

        }

    }

  return (
    <Card>
        <BlockStack gap={'300'}>
            <BlockStack gap="050">
                <Text as="h2" fontWeight="bold" id="productSelections">Product Selections Section</Text>
                <Text as="p" variant="bodySm">
                    These will appear on the bottom of each review request email to showcase more products to your customers.
                    You may also choose to disable this feature. 
                </Text>
            </BlockStack>
            <ChoiceList 
            title=''
            onChange={(value) => setState({...state, reviewRequestEmailProductDisplay: value})}
            selected={state.reviewRequestEmailProductDisplay}
            choices={[
                {
                    label: 'Disable',
                    value: 'disabled'
                },
                {
                    label: 'Random Products',
                    value: 'random'
                }, 
                {
                    label: 'Selected Products',
                    value: 'select'
                }
            ]}
            />
            {state.reviewRequestEmailProductDisplay[0] === 'select' && 
            
            <InlineStack blockAlign="center" gap={'200'}>
                <Button onClick={selectProducts}>Select Products</Button>
                <Text fontWeight="bold" as="p">{state.displayProducts.length}/3 products</Text>
            </InlineStack>            
            }
            {state.displayProducts.length > 0 && 
            <InlineStack gap={'500'}>
                {state.displayProducts.map(product => {
                    return (
                        <BlockStack>
                            {product.imageUrl ? 
                            <div style={{overflow: 'hidden', height: 100, width: 100, borderRadius: 10}}>
                                <img style={{objectFit: 'cover'}} height={'100%'} width={'100%'} src={product.imageUrl} alt={product.title} />
                            </div> :
                            <ImageIcon height={100} width={100} />
                            }
                            <p style={{textAlign: 'center', width: '100px', margin: 'auto'}}>{product.title}</p>
                        </BlockStack>
                    )
                })}
            </InlineStack>
            }
        </BlockStack>
    </Card>
  )
}
