import { Banner, BlockStack, Button, Card, DropZone, Image, Label, Layout, Link, Page, Text, Thumbnail } from "@shopify/polaris";
import { useEffect, useRef, useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' 
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

import styles from '../styles/EmailTemplate.module.css'

export default function EmailTemplate() {

    const [color, setColor] = useColor('black')
    const [file, setFile] = useState<File>()

    const selectedFileContainerRef = useRef<HTMLDivElement>()
    const trashCanIconContainerRef = useRef<HTMLDivElement>()

    const handleDrop = (files: File[], acceptedFiles: File[], rejectedFiles: File[]) => {
        setFile(acceptedFiles[0])
    }

    useEffect(() => {
        if (selectedFileContainerRef.current) {
            selectedFileContainerRef.current.addEventListener('click', () => setFile(undefined))
            selectedFileContainerRef.current.addEventListener('mouseover', () => (trashCanIconContainerRef.current as HTMLDivElement).style.display = 'flex')
            selectedFileContainerRef.current.addEventListener('mouseleave', () => (trashCanIconContainerRef.current as HTMLDivElement).style.display = 'none')
        }
    }, [file])

    const fileUploadBtn = !file && <DropZone.FileUpload actionTitle="Upload Your Logo" />

    return (

        <Page
        secondaryActions={[{content: 'Send Test Email'}]}
        >
            <Layout>
                <Layout.Section variant="oneThird">
                    <Card>
                        <BlockStack gap='300'>
                            <DropZone 
                            onDrop={handleDrop} 
                            allowMultiple={false} 
                            id="bannerLogo" 
                            accept="image/*" 
                            label='Banner Logo' 
                            overlayText="Drop to Upload">
                                {file ? 
                                <div ref={(element: HTMLDivElement) => selectedFileContainerRef.current = element} className={styles.uploadedMedia}>
                                    <Thumbnail
                                    size="medium"
                                    alt={file.name}
                                    source={window.URL.createObjectURL(file)}
                                    />
                                    <BlockStack gap='100'>
                                        <Text as="h1" variant="headingMd">{file.name}</Text>
                                        <Text as="p" variant="bodyXs">{file.size} bytes</Text>
                                    </BlockStack>
                                    <div ref={(element: HTMLDivElement) => trashCanIconContainerRef.current = element} className={styles.trashCanIconContainer}> 
                                        <FontAwesomeIcon icon={faTrashCan} color="white" size="3x" />
                                    </div>
                                </div> 
                                :
                                fileUploadBtn  
                            }
                            </DropZone>
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
                                        {file && 
                                            <Image 
                                            height={50} 
                                            width={50} 
                                            source={window.URL.createObjectURL(file)} 
                                            alt={file.name} 
                                            />
                                        }
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