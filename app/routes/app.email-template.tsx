import { Banner, BlockStack, Button, Card, DropZone, Image, InlineError, InlineStack, Label, Layout, Modal, Page, Pagination, Text, Thumbnail } from "@shopify/polaris";
import { useEffect, useRef, useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' 
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { ImageIcon } from '@shopify/polaris-icons';

import { HexColorPicker, HexColorInput } from 'react-colorful'

import db from '../db.server'
import styles from '../styles/EmailTemplate.module.css'

import { authenticate } from "~/shopify.server";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { defaultReviewRequestEmailSettings, ReviewRequestEmailProductData, ReviewRequestEmailSettings } from "~/types/types";
import { SaveBar } from "@shopify/app-bridge-react";

import deleteLogo from "~/utils/deleteLogo";
import uploadLogo from "~/utils/uploadLogo";

import standardizeLineBreaks from "~/helpers/standardizeLineBreaks";
import generateEmailBody from "~/helpers/email/generateEmailBody";
import fetchMaxReward from "~/helpers/fetchMaxReward.server";

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
                data[key] = data[key] === '' ? [] : data[key].split(',')
            }
        })
        const newLogo = data.newLogo
        const logoDeleted = !data.currentLogo
        // remove logo properties from object to properly update/create records
        delete data['newLogo']
        delete data['currentLogo']
        delete data['companyName']
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
        const currentlyStoredLogo = await db.reviewRequestEmailLogo.findFirst({where: {reviewRequestEmailSettingsId: {equals: settingsId}}})
        // check if there is a new logo image
        if (newLogo) {
            // if so, delete the currently stored image from the s3 bucket (if it exists)
            if (currentlyStoredLogo) {
                // first...remove current file from bucket and db
                await deleteLogo(currentlyStoredLogo)
            }
            // now...add new file to bucket and db
            await uploadLogo(newLogo, settingsId)
        } else if (currentlyStoredLogo && logoDeleted) {
            // if there is a current logo stored in db, yet there is no logo in the form data, delete the current logo
            await deleteLogo(currentlyStoredLogo)
        }
        return json({status: 'success'}, {status: 200})
    } catch (error) {
        console.log(error)
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
    const appSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}})
    const companyName = appSettings?.companyName

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
        
        // convert each email body to consistent line break format
        standardizeLineBreaks(settings)
        return json({settings: {...settings, companyName}, productData, maxReward: await fetchMaxReward(settings.store)})
    }
    const defaultSettings = await db.reviewRequestEmailSettings.create({data: {...defaultReviewRequestEmailSettings, logo: undefined, store: session.shop}, include: {logo: {omit: {id: true, reviewRequestEmailSettingsId: true}}}})
    // convert each email body to consistent line break format
    standardizeLineBreaks(defaultSettings)
    return json({settings: {...defaultSettings, companyName}, productData: [] as ReviewRequestEmailProductData[], maxReward: await fetchMaxReward(defaultSettings.store)})
}

export default function EmailTemplate() {

    const data = useLoaderData<typeof loader>()

    const [settings, setSettings] = useState<ReviewRequestEmailSettings>(data.settings)
    const [emailCopyVersion, setEmailCopyVersion] = useState('Initial')
    const [productData, setProductData] = useState<ReviewRequestEmailProductData[]>(data.productData)

    // modal states
    const [emailEditModalOpen, setEmailEditModalOpen] = useState(false)
    const [dynamicVariableTipsModalOpen, setDynamicVariableTipsModalOpen] = useState(false)

    const [emailBody, setEmailBody] = useState(data.settings.initialEmailBody)
    
    // const [productSelectionError, setProductSelectionError] = useState(false)
    const [errors, setErrors] = useState<any>({})

    const cleanSettings = data.settings
    const cleanProductData = data.productData

    const isFormDirty = JSON.stringify(settings) !== JSON.stringify(cleanSettings)
    
    const selectedFileContainerRef = useRef<HTMLDivElement>()
    const trashCanIconContainerRef = useRef<HTMLDivElement>()

    const submit = useSubmit()
    const navigation = useNavigation()

    const handleDrop = (files: File[], acceptedFiles: File[], rejectedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const acceptedFile = acceptedFiles[0]
            setSettings(prevSettings => {return {...prevSettings, logo: {name: acceptedFile.name, url: window.URL.createObjectURL(acceptedFile), file: acceptedFile}}})
        }
    }

    const handleSave = () => { 

        if (Object.keys(errors).length > 0) return
        
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
            selectedFileContainerRef.current.addEventListener('click', () => {setSettings(prevSettings => {return {...prevSettings, logo: null}})})
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

    const emailData = {
        bannerBgColor: settings.bannerBgColor,
        logo: settings.logo,
        companyName: settings.companyName,
        store: settings.store,
        maxReward: data.maxReward
    }

    const sendTestEmail = () => { 
        const formData = new FormData()
        formData.append('emailBody', emailBody)
        formData.append('emailData', JSON.stringify(emailData))
        submit(formData, {action: '/api/reviewRequestEmail/test/send', method: 'POST', encType: 'multipart/form-data', navigate: false})
    }

    const editEmail = (e: any) => {
        if (emailCopyVersion == "Initial") {
            setSettings({...settings, initialEmailBody: e.target.value})
            setEmailBody(e.target.value)
        } else {
            setSettings({...settings, followUpEmailBody: e.target.value})
            setEmailBody(e.target.value)
        }
    }

    const revertChanges = () => {
        setSettings(cleanSettings)
        setProductData(cleanProductData);
        // setProductSelectionError(false)
        if (emailCopyVersion === "Initial") {
            setEmailBody(cleanSettings.initialEmailBody)
        } else {
            setEmailBody(cleanSettings.followUpEmailBody)
        }
    }

    const checkForRequiredVariable = (e: React.FocusEvent<HTMLTextAreaElement, Element>) => {
        if (!e.target.value.includes('{{stars}}')) {
            return setErrors({...errors, emailBody: true})
        }
        const currentErrors = {...errors}
        delete currentErrors['emailBody']
        setErrors(currentErrors)
    }

    return (
        <Page
        primaryAction={{content: 'Send Test Email', onAction: sendTestEmail, disabled: isFormDirty}}
        >
            <SaveBar open={isFormDirty}>
                <button variant="primary" onClick={handleSave} loading={navigation.state === 'submitting' ? 'true' : false}></button>
                <button onClick={revertChanges}></button>
            </SaveBar>
            <Modal 
            open={emailEditModalOpen} 
            title={`Edit ${emailCopyVersion} Email`} 
            onClose={() => setEmailEditModalOpen(false)}
            primaryAction={{content: 'Dynamic Variables', onAction: () => setDynamicVariableTipsModalOpen(true)}}
            >
                <textarea 
                id={`${emailCopyVersion}Body`} 
                value={emailBody} 
                style={{resize: 'none', outline: 'none', padding: '10px', width: '100%', height: '100vh'}} 
                onChange={editEmail} 
                onBlur={checkForRequiredVariable}
                />
                {errors['emailBody'] && <InlineError message="{{stars}} variable must be included in the email body" fieldID={`${emailCopyVersion}Body`} />}
            </Modal>
            <Modal 
            open={dynamicVariableTipsModalOpen}
            onClose={() => setDynamicVariableTipsModalOpen(false)}
            title="Dynamic Variables"
            >
                <Card>
                    <Text as="p" variant="bodyMd">
                        <strong>{`{{stars}}`}</strong> - required; replaced with the clickable stars that link to the review form
                        <br />
                        <br />
                        <strong>{`{{firstName}}`}</strong> - optional; replaced with the customer's first name
                        <br />
                        <br />
                        <strong>{`{{companyName}}`}</strong> - optional; replaced with your company's name, as specified in the general settings
                        <br />
                        <br />
                        <strong>{`{{productName}}`}</strong> - optional; replaced with the name of the product for which the review request is for
                        <br />
                        <br />
                        <strong>{`{{maxReward}}`}</strong> - optional; replaced with the max reward that you are offering
                    </Text>
                </Card>
            </Modal>
            <BlockStack gap='200'>
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
                                    <HexColorPicker
                                    key='colorPicker'
                                    color={settings.bannerBgColor} 
                                    onChange={(color) => { setSettings(prevSettings => {return {...prevSettings, bannerBgColor: color}})}} 
                                    />
                                    <HexColorInput
                                    color={settings.bannerBgColor} 
                                    onChange={(color) => { setSettings(prevSettings => {return {...prevSettings, bannerBgColor: color}})}} 
                                    />
                                </BlockStack>
                                {/* <ChoiceList 
                                title='Recommended Products Display'
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
                                /> */}
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                    <Layout.Section variant="oneHalf">
                        <Card>
                            <BlockStack gap={'200'}>
                                <InlineStack blockAlign="center" align="space-between">
                                    <InlineStack gap='400'>
                                        <h2 style={{fontWeight: 'bold'}}>{emailCopyVersion} Email Preview</h2>
                                        <Button variant="plain" onClick={() => setEmailEditModalOpen(true)}>Edit Email</Button>
                                    </InlineStack>
                                    <Pagination 
                                    hasNext={emailCopyVersion === 'Initial'} 
                                    hasPrevious={emailCopyVersion === 'Follow Up'}
                                    onNext={() => { setEmailCopyVersion('Follow Up'); setEmailBody(data.settings.followUpEmailBody) }}
                                    onPrevious={() => { setEmailCopyVersion('Initial'); setEmailBody(data.settings.initialEmailBody) }}
                                    />
                                </InlineStack>
                                <BlockStack gap='300'>
                                    <div className={styles.emailHeaderContainer} style={{backgroundColor: settings.bannerBgColor}}>
                                        <div className={styles.logoContainer}>
                                            {settings.logo && 
                                                <Image 
                                                draggable={false}
                                                height={50} 
                                                width={50} 
                                                source={settings.logo.url} 
                                                alt={settings.logo.name} 
                                                />
                                            }
                                        </div>
                                    </div>
                                    <div dangerouslySetInnerHTML={{__html: generateEmailBody(emailBody, emailData)}}></div>
                                    {/* {
                                        settings.productDisplay[0] !== 'disabled' && 
                                        <>
                                            <hr className={styles.separator} />
                                            <h2 style={{fontWeight: 'bold', fontSize: '18px'}}>Top Picks for You</h2>
                                            {settings.productDisplay[0] === 'random' ?
                                            <Banner tone="info">
                                                3 random products will be displayed here
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
                                    } */}
                                </BlockStack>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </BlockStack>
        </Page>
    )
}