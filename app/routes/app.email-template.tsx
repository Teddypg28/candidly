import { Banner, BlockStack, Button, Card, ChoiceList, DropZone, Image, InlineStack, Label, Layout, Page, Text, Thumbnail } from "@shopify/polaris";
import { useEffect, useRef, useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' 
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { ImageIcon } from '@shopify/polaris-icons';

import db from '../db.server'

import styles from '../styles/EmailTemplate.module.css'
import { authenticate } from "~/shopify.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { defaultReviewRequestEmailSettings, EmailTemplateProductData } from "~/types/types";

export const loader = async ({ request } : LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request)
    const settings = await db.reviewRequestEmailSettings.findFirst({
        where: {store: {equals: session.shop}}, 
        omit: {id: true, store: true}, 
        include: {products: {omit: {id: true, reviewRequestEmailSettingsId: true, productId: true, store: true}}, logo: {omit: {reviewRequestEmailSettingsId: true, id: true}}
    }})
    return settings || defaultReviewRequestEmailSettings
}

export default function EmailTemplate() {

    const settingsData = useLoaderData<typeof loader>()
    const [settings, setSettings] = useState(settingsData)

    const [productData, setProductData] = useState<EmailTemplateProductData[]>([])

    const [color, setColor] = useColor('black')
    const [file, setFile] = useState<File>()

    const selectedFileContainerRef = useRef<HTMLDivElement>()
    const trashCanIconContainerRef = useRef<HTMLDivElement>()

    const submit = useSubmit()

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

    const selectProducts = async () => {
        const products = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
            multiple: true
        })
        if (products) {
            const productIds = products.map((product) => product.id)
            setSettings(prevSettings => {return {...prevSettings, productIds}})
            const productData: EmailTemplateProductData[] = products.map(product => {
                return {
                    title: product.title,
                    image: product.images.length > 0 ? product.images[0].originalSrc : null
                }
            })
            setProductData(productData)
        } else {
            setSettings(prevSettings => {return {...prevSettings, productIds: []}})
            setProductData([])
        }
    }

    const displaySelectedProducts = () => {
        return productData.map((product, index) => {
            return (
                <InlineStack blockAlign="center" gap={'200'} key={index}>
                    <Thumbnail source={product.image || ImageIcon} alt={product.title} />
                    <Text as="p">{product.title}</Text>
                </InlineStack>
            )
         })  
    }

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
                            <ChoiceList 
                            title=''
                            onChange={(productDisplay) => setSettings(prevSettings => {return {...prevSettings, productDisplay}})}
                            selected={settings.productDisplay}
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
                                    label: 'Select Products',
                                    value: 'select',
                                    renderChildren: (isSelected) => {
                                        return isSelected && (
                                            <InlineStack gap={'200'} blockAlign="center">
                                                <Button onClick={selectProducts}>{productData.length > 0 ? 'Change Products' : 'Select Products'}</Button> 
                                                <Text as="p" fontWeight="bold">{productData.length}/5 Select Products</Text>
                                            </InlineStack>
                                        )
                                    },
                                }
                            ]}
                            />
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneHalf">
                    <Card>
                        <BlockStack gap={'200'}>
                            <h2 style={{fontWeight: 'bold'}}>Email Preview</h2>
                            <BlockStack gap='300'>
                                <div className={styles.emailHeaderContainer} style={{backgroundColor: color.hex}}>
                                    <div className={styles.logoContainer}>
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
                                {
                                    settings.productDisplay[0] !== 'disabled' && 
                                    <>
                                        <hr className={styles.separator} />
                                        <h2 style={{fontWeight: 'bold', fontSize: '18px'}}>Top Picks for You</h2>
                                        {settings.productDisplay[0] === 'random' ?
                                        <Banner tone="info">
                                            5 random products will be displayed here
                                        </Banner>
                                        :
                                        <InlineStack gap={'600'}>
                                            {productData.map((product, index) => {
                                                return (
                                                    <div key={index} style={{width: '100px'}}>
                                                        <div className={styles.imageContainer}>
                                                            {product.image ? <img style={{objectFit: 'cover'}} height={'100%'} width={'100%'} src={product.image} /> : <ImageIcon height={'100%'} width={'100%'} />}
                                                        </div>
                                                        <p style={{fontSize: '10px', textAlign: 'center', fontWeight: 'bold'}}>{product.title}</p>
                                                        <button className={styles.shopNowBtn}>Shop Now</button>
                                                    </div>
                                                )
                                            })}
                                        </InlineStack>
                                        }
                                    </>
                                }
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>

    )

}