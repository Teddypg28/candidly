import { Card, BlockStack, TextField, InlineStack, Text, ColorPicker,  } from "@shopify/polaris";

import { SettingsPageProps } from "~/types/types";

export default function ReviewFormSettings({state, setState}: SettingsPageProps) {

    return (

        <Card>
              <BlockStack gap='500'>
                <BlockStack gap='200'>
                    <BlockStack gap='200'>
                        <TextField 
                        value={state.formHeading} 
                        onChange={(value) => setState({...state, formHeading: value})}
                        label='Review Form Heading' 
                        autoComplete="off" />
                        <TextField 
                        value={state.formSubheading} 
                        onChange={(value) => setState({...state, formSubheading: value})} 
                        label='Review Form Subheading' 
                        autoComplete="off" />
                    </BlockStack>
                    <InlineStack gap='1000'>
                        <BlockStack gap='200'>
                            <BlockStack gap='100'>
                                <Text as="h1">Primary Brand Color</Text>
                                {/* <ColorPicker color={JSON.parse(state.primaryColor)} /> */}
                            </BlockStack>
                            {/* <InlineStack blockAlign="end" gap='200'>
                                <TextField value={state.reviewFormHexColor} onChange={(value) => convertToHsb(value, 'reviewPrimary')} label="Primary Brand Color" placeholder="Enter color code here" autoComplete="off" />
                                <div style={{backgroundColor: reviewFormHexColor, height: '32px', width: '32px', borderRadius: '5px'}}></div>
                            </InlineStack> */}
                        </BlockStack>
                        <BlockStack gap='200'>
                            <BlockStack gap='100'>
                                <Text as="h1">Widget Background Color</Text>
                                {/* <ColorPicker color={JSON.parse(state.backgroundColor)} onChange={(value) => handleColorPickerChange(JSON.stringify(value), 'reviewBackground')} /> */}
                            </BlockStack>
                            <InlineStack blockAlign="end" gap='200'>
                                {/* <TextField value={backgroundHexColor} onChange={(value) => convertToHsb(value, 'reviewBackground')} label="Widget Background Color" placeholder="Enter color code here" autoComplete="off" />
                                <div style={{backgroundColor: backgroundHexColor, height: '32px', width: '32px', borderRadius: '5px', border: '2px solid white'}}></div> */}
                            </InlineStack>
                        </BlockStack>
                    </InlineStack>
                </BlockStack>
            </BlockStack>
        </Card>

    )

}