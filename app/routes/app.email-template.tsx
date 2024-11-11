import { Banner, BlockStack, Button, Card, DropZone, Image, InlineError, InlineStack, Label, Layout, Link, Page, Text, Thumbnail } from "@shopify/polaris";
import { useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";

export default function EmailTemplate() {

    const [color, setColor] = useColor('black')
    const [files, setFiles] = useState<File[]>([])
    const [rejectedFiles, setRejectedFiles] = useState<File[]>([])
    const isUploadError = rejectedFiles.length > 0 && files.length === 0

    const handleDrop = (files: File[], acceptedFiles: File[], rejectedFiles: File[]) => {

        setFiles(acceptedFiles)
        setRejectedFiles(rejectedFiles)

    }

    return (

        <Page
        secondaryActions={[{content: 'Send Test Email'}]}
        >
            <Layout>
                <Layout.Section variant="oneThird">
                    <Card>
                        <BlockStack gap='300'>
                            <DropZone onDrop={handleDrop} allowMultiple={false} id="bannerLogo" accept="image/*" label='Banner Logo' overlayText="Drop to Upload">
                                 <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                {files.length === 0 ?
                                    <Button>Upload Logo</Button>
                                    :
                                    <InlineStack gap='100' blockAlign="center">
                                        <Thumbnail
                                        size="medium"
                                        alt={files[0].name}
                                        source={window.URL.createObjectURL(files[0])}
                                        />
                                        <BlockStack gap='100'>
                                            <Text as="h1" variant="headingMd">{files[0].name}</Text>
                                            <Text as="p" variant="bodyXs">{files[0].size} bytes</Text>
                                        </BlockStack>
                                    </InlineStack>
                                }
                                 </div>
                            </DropZone>
                            {isUploadError && <InlineError fieldID="bannerLogo" message="Only Image Files are Accepted" />}
                            <BlockStack gap='100'>
                                <Label id="colorPicker">Banner Background Color</Label>
                                <ColorPicker
                                key='colorPicker'
                                height={150}
                                color={color} 
                                onChange={setColor} 
                                />
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneHalf">
                    <Card>
                        <BlockStack gap={'200'}>
                            <BlockStack>
                                <Banner>To edit product selections, go to <Link url="/app/settings/email">email settings</Link></Banner>
                            </BlockStack>
                            <h2 style={{fontWeight: 'bold'}}>Email Preview</h2>
                            <BlockStack gap='300'>
                                <div style={{backgroundColor: color.hex, height:'70px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <div style={{color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        {files.length > 0 && <Image height={50} width={50} source={window.URL.createObjectURL(files[0])} alt={files[0].name} />}
                                    </div>
                                </div>
                                <BlockStack gap={'300'}>
                                    <Text alignment="center" variant="headingLg" as="p">Hey [name],</Text>
                                    <Text alignment="center" variant="headingXl" as="p">So...What do you think?</Text>
                                </BlockStack>
                                <Text as="p" variant="bodyLg" alignment="center">
                                    We hope you’re enjoying your [product name]! We’d love to hear your thoughts—your feedback helps us improve and helps others make confident decisions. 
                                    <br />
                                    <br />
                                    As a thank-you, we’re offering a reward of up to [max reward] if you fill out this review form. It only takes a minute, and it means a lot to us!
                                    <br />
                                    <br />
                                    [Link to review form]
                                    <br />
                                    <br />
                                    Thank you for your support!
                                </Text>
                                <hr style={{width: '100%', border: 'none', height: '0.10px', backgroundColor: 'lightgray'}} />
                                <h2 style={{fontWeight: 'bold', fontSize: '18px'}}>Top Picks for You</h2>
                                <div style={{display: 'flex', alignItems: 'center', gap: '60px'}}>
                                    <div style={{border: '2px solid lightgray', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Product #1</div>
                                    <div style={{border: '2px solid lightgray', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Product #2</div>
                                    <div style={{border: '2px solid lightgray', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Product #3</div>
                                </div>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>

    )

}