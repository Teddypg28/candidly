import { Banner, BlockStack, Button, Card, ChoiceList, DropZone, Image, InlineError, InlineStack, Label, Layout, Page, Text, Thumbnail } from "@shopify/polaris";
import { useEffect, useRef, useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' 
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { ImageIcon } from '@shopify/polaris-icons';

import db from '../db.server'
import styles from '../styles/EmailTemplate.module.css'

import { authenticate } from "~/shopify.server";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { defaultReviewRequestEmailSettings, ReviewRequestEmailProductData, ReviewRequestEmailSettings } from "~/types/types";
import { SaveBar } from "@shopify/app-bridge-react";

import deleteLogo from "~/utils/deleteLogo";
import uploadLogo from "~/utils/uploadLogo";

export const action = async ({ request } : ActionFunctionArgs) => {
    try {
        const { session } = await authenticate.admin(request)
        const formData = await request.formData()
        // convert form data to regular javascript object
        const data: any = Object.fromEntries(formData)
        // convert strings to array of strings to match db shape
        Object.keys(data).forEach(key => {
            if (key === "productDisplay") {
                data[key] = [data[key]]
            } else if (key === "productIds") {
                data[key] = data[key].split(',')
            }
        })
        const newLogo = data.newLogo
        const logoDeleted = !data.currentLogo
        // remove logo properties from object to properly update/create records
        delete data['newLogo']
        delete data['currentLogo']
        // see if settings already exist -- determines whether update or create is needed
        let settingsId
        const currentSettings = await db.reviewRequestEmailSettings.findFirst({where: {store: {equals: session.shop}}})
        if (currentSettings) {
            await db.reviewRequestEmailSettings.update({where: {id: currentSettings.id}, data})
            settingsId = currentSettings.id
        } else {
            const newSettings = await db.reviewRequestEmailSettings.create({data})
            settingsId = newSettings.id
        }
        const currentLogo = await db.reviewRequestEmailLogo.findFirst({where: {reviewRequestEmailSettingsId: {equals: settingsId}}})
        // check if there is a new logo image
        if (newLogo) {
            // if so, delete the currently stored image from the s3 bucket (if it exists)
            if (currentLogo) {
                // first...remove current file from bucket and db
                await deleteLogo(currentLogo)
            }
            // now...add new file to bucket and db
            await uploadLogo(newLogo, settingsId)
        } else if (currentLogo && logoDeleted) {
            // if there is a current logo stored in db, yet there is no logo in the form data, delete the current logo
            await deleteLogo(currentLogo)
        }
        return json({status: 'success'}, {status: 200})
    } catch (error) {
        return json({status: error}, {status: 400})
    }
}

export const loader = async ({ request } : LoaderFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request)
    const settings = await db.reviewRequestEmailSettings.findFirst({
        where: {store: {equals: session.shop}}, 
        omit: {id: true}, 
        include: {logo: {omit: {reviewRequestEmailSettingsId: true, id: true}}}
    })
    if (settings) {
        const productData = await Promise.all(settings.productIds.map(async (productId) => {
            const query = `query getProductData($id: ID!) {
                product(id: $id) {
                  handle
                  title
                  featuredMedia {
                    preview {
                      image {
                        url
                      }
                    }
                  }
                }
              }`
            const result = await admin.graphql(query, {variables: {id: productId}})
            const data = await result.json()
            return {
                title: data.data.product.title as string,
                image: data.data.product.featuredMedia ? data.data.product.featuredMedia.preview.image.url as string : null,
                handle: data.data.product.handle as string
            }
        }))        
        return json({settings, productData})
    }
    return json({settings: {...defaultReviewRequestEmailSettings, store: session.shop}, productData: [] as ReviewRequestEmailProductData[]})
}

export default function EmailTemplate() {

    const data = useLoaderData<typeof loader>()

    const [settings, setSettings] = useState<ReviewRequestEmailSettings>(data.settings)
    const [productData, setProductData] = useState<ReviewRequestEmailProductData[]>(data.productData)
    const [productSelectionError, setProductSelectionError] = useState(false)
    const [color, setColor] = useColor('black')

    const cleanSettings = data.settings
    const cleanProductData = data.productData

    const isFormDirty = JSON.stringify(settings) !== JSON.stringify(cleanSettings)
    
    const selectedFileContainerRef = useRef<HTMLDivElement>()
    const trashCanIconContainerRef = useRef<HTMLDivElement>()

    const submit = useSubmit()

    const handleDrop = (files: File[], acceptedFiles: File[], rejectedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const acceptedFile = acceptedFiles[0]
            setSettings(prevSettings => {return {...prevSettings, logo: {name: acceptedFile.name, url: window.URL.createObjectURL(acceptedFile), file: acceptedFile}}})
        }
    }

    const handleSave = () => { 
        if (settings.productDisplay[0] === 'select' && settings.productIds.length === 0) {
            return setProductSelectionError(true)
        }
        const formData = new FormData()
        Object.keys(settings).forEach(key => {
            if (key === "productDisplay" || key === "productIds") {
                formData.append(key, settings[key].toString())
            } else if (key === "logo") {
                // check if logo upload exists
                if (settings[key]) {
                    // if there's a file property, there's a new uploaded logo
                    if (settings[key].file) {
                        formData.append('newLogo', settings[key].file)
                    } else {
                        // otherwise, there's no change
                        formData.append('currentLogo', settings[key].url)
                    }
                } else {
                    // logo was removed
                    return
                }
            } else {
                formData.append(key, settings[key as keyof typeof settings] as string)
            }
        })
        submit(formData, {method: 'POST', encType: 'multipart/form-data'})
    }

    useEffect(() => {
        if (selectedFileContainerRef.current) {
            selectedFileContainerRef.current.addEventListener('click', () => { setSettings(prevSettings => {return {...prevSettings, logo: null}}); console.log('clicked!') })
            selectedFileContainerRef.current.addEventListener('mouseover', () => (trashCanIconContainerRef.current as HTMLDivElement).style.display = 'flex')
            selectedFileContainerRef.current.addEventListener('mouseleave', () => (trashCanIconContainerRef.current as HTMLDivElement).style.display = 'none')
        }
    }, [settings.logo])

    useEffect(() => {
        setSettings(data.settings)
    }, [data.settings.logo])

    const fileUploadBtn = !settings.logo && <DropZone.FileUpload actionTitle="Upload Your Logo" />

    const selectProducts = async () => {
        const products = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
            multiple: true
        })
        if (products) {
            const productIds = products.map((product) => product.id).filter((id, index) => index <= 3-1)
            setSettings(prevSettings => {return {...prevSettings, productIds}})
            const productData: ReviewRequestEmailProductData[] = products
                .map((product) => {
                    return {
                        title: product.title,
                        image: product.images.length > 0 ? product.images[0].originalSrc : null,
                        handle: product.handle
                    }
                })
                .filter((product, index) => index <= 3-1)
            setProductData(productData)
        } else {
            setSettings(prevSettings => {return {...prevSettings, productIds: []}})
            setProductData([])
        }
    }

    return (
        <Page
        secondaryActions={[{content: 'Send Test Email'}]}
        >
            <SaveBar open={isFormDirty}>
                <button variant="primary" onClick={handleSave}></button>
                <button onClick={() => { setSettings(cleanSettings); setProductData(cleanProductData); setProductSelectionError(false) }}></button>
            </SaveBar>
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
                                {settings.logo ? 
                                <div ref={(element: HTMLDivElement) => selectedFileContainerRef.current = element} className={styles.uploadedMedia}>
                                    <Thumbnail
                                    size="medium"
                                    alt={settings.logo.name}
                                    source={settings.logo.url}
                                    />
                                    <BlockStack gap='100'>
                                        <Text as="h1" variant="headingMd">{settings.logo.name}</Text>
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
                                onChange={(color) => { setSettings(prevSettings => {return {...prevSettings, bannerBgColor: color.hex}}); setColor(color) }} 
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
                                                <Text as="p" fontWeight="bold">{productData.length}/3 Products</Text>
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
                                        {settings.logo && 
                                            <Image 
                                            height={50} 
                                            width={50} 
                                            source={settings.logo.url} 
                                            alt={settings.logo.name} 
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
                                            {
                                            productData.length > 0 ? productData.map((product, index) => {
                                                return (
                                                    <div key={index} style={{width: '100px'}}>
                                                        <div className={styles.productImageContainer}>
                                                            {product.image ? <img style={{objectFit: 'cover'}} height={'100%'} width={'100%'} src={product.image} /> : <ImageIcon height={'100%'} width={'100%'} />}
                                                        </div>
                                                        <p style={{fontSize: '10px', textAlign: 'center'}}>{product.title}</p>
                                                        <button onClick={() => window.open(`https://${settings.store}/products/${product.handle}`)} className={styles.shopNowBtn}>Shop Now</button>
                                                    </div>
                                                )
                                            })
                                            :
                                                <BlockStack>
                                                    <div id="productSelection">Select which products to display</div>
                                                    {productSelectionError && <InlineError fieldID="productSelection" message="Please select at least 1 product" />}
                                                </BlockStack>
                                            }
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