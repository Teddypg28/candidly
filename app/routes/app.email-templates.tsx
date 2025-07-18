import { Banner, BlockStack, Button, Card, DropZone, Image, InlineError, InlineStack, Label, Layout, Link, Modal, Page, Pagination, Text, TextField, Thumbnail } from "@shopify/polaris";
import { useEffect, useRef, useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' 
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

import { HexColorPicker, HexColorInput } from 'react-colorful'

import db from '../db.server'
import styles from '../styles/EmailTemplates.module.css'

import { authenticate } from "~/shopify.server";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { CustomerQuestionEmailVariables, CustomerRewardEmailVariables, defaultCustomerQuestionEmailSettings, defaultCustomerRewardEmailSettings, defaultReviewRequestEmailSettings, ReviewRequestEmailVariables } from "~/types/types";
import { SaveBar } from "@shopify/app-bridge-react";

import deleteLogo from "~/utils/deleteLogo";
import uploadLogo from "~/utils/uploadLogo";

import standardizeLineBreaks from "~/helpers/email/standardizeLineBreaks";
import generateReviewRequestEmailBody from "~/helpers/email/generateReviewRequestEmailBody";
import generateCustomerQuestionEmailBody from "~/helpers/email/generateCustomerQuestionEmailBody";
import generateCustomerRewardEmailBody from "~/helpers/email/generateCustomerRewardEmailBody";

export const action = async ({ request } : ActionFunctionArgs) => {
    try {
        const { session } = await authenticate.admin(request)
        const formData = await request.formData()
        
        // convert form data to regular javascript object
        const data: any = Object.fromEntries(formData)
        const newLogo = data.newLogo
        const logoDeleted = !data.currentLogo
        const settings = data.settings
        const bannerBgColor = data.bannerBgColor
        // remove logo properties from object to properly update/create records
        delete data['newLogo']
        delete data['currentLogo']
        delete data['companyName']
        delete data['settings']
        delete data['bannerBgColor']

        switch (settings) {
            case "review-request":
                const currentReviewRequestEmailSettings = await db.reviewRequestEmailSettings.findFirst({where: {store: {equals: session.shop}}})
                await db.reviewRequestEmailSettings.update({where: {id: currentReviewRequestEmailSettings?.id}, data})
                break;
            case "customer-question":
                const currentCustomerQuestionEmailSettings = await db.customerQuestionEmailSettings.findFirst({where: {store: {equals: session.shop}}})
                await db.customerQuestionEmailSettings.update({where: {id: currentCustomerQuestionEmailSettings?.id}, data})
                break;
            case "customer-reward":
                const currentCustomerRewardEmailSettings = await db.customerRewardEmailSettings.findFirst({where: {store: {equals: session.shop}}})
                await db.customerRewardEmailSettings.update({where: {id: currentCustomerRewardEmailSettings?.id}, data})
                break;
            default:
                break;
        }

        const emailDesignSettings = await db.emailDesignSettings.findFirst({where: {store: {equals: session.shop}}})
        await db.emailDesignSettings.update({where: {id: emailDesignSettings?.id}, data: {bannerBgColor}})
        const currentlyStoredLogo = await db.reviewRequestEmailLogo.findFirst({where: {emailDesignSettingsId: {equals: emailDesignSettings?.id}}})
        if (newLogo) {
            if (currentlyStoredLogo) {
                // first...remove current file from bucket and db
                await deleteLogo(currentlyStoredLogo)
            }
            // now...add new file to bucket and db
            await uploadLogo(newLogo, emailDesignSettings?.id as string)
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
    const { session } = await authenticate.admin(request)

    const reviewRequestEmailSettings = await db.reviewRequestEmailSettings.findFirst({
        where: {store: {equals: session.shop}}, 
        omit: {id: true}, 
    })
    const customerQuestionEmailSettings = await db.customerQuestionEmailSettings.findFirst({
        where: {store: {equals: session.shop}}, 
        omit: {id: true},
    })
    const customerRewardEmailSettings = await db.customerRewardEmailSettings.findFirst({
        where: {store: {equals: session.shop}},
        omit: {id: true},
    })
    const emailDesignSettings = await db.emailDesignSettings.findFirst({
        where: {store: {equals: session.shop}},
        omit: {id: true},
        include: {logo: {omit: {emailDesignSettingsId: true, id: true}}}
    })

    const appSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}})
    const companyName = appSettings?.companyName

    if (reviewRequestEmailSettings && customerQuestionEmailSettings && customerRewardEmailSettings && emailDesignSettings) { 
        // convert each email body to consistent line break format
        [defaultCustomerQuestionEmailSettings, defaultCustomerRewardEmailSettings, defaultReviewRequestEmailSettings].forEach(settings => {
            standardizeLineBreaks(settings)
        })
        return json({settings: {reviewRequestEmailSettings, customerQuestionEmailSettings, customerRewardEmailSettings, emailDesignSettings}, companyName})
    }

    // initialize settings
    const initialReviewRequestEmailSettings = await db.reviewRequestEmailSettings.create({data: {...defaultReviewRequestEmailSettings, store: session.shop}})
    const initialCustomQuestionEmailSettings = await db.customerQuestionEmailSettings.create({data: {...defaultCustomerQuestionEmailSettings, store: session.shop}})
    const initialCustomerRewardEmailSettings = await db.customerRewardEmailSettings.create({data: {...defaultCustomerRewardEmailSettings, store: session.shop}})
    const initialEmailDesignSettings = await db.emailDesignSettings.create({data: {store: session.shop}, include: {logo: {omit: {emailDesignSettingsId: true, id: true}}}});

    // convert each email body to consistent line break format
    [defaultCustomerQuestionEmailSettings, defaultCustomerRewardEmailSettings, defaultReviewRequestEmailSettings].forEach(settings => {
        standardizeLineBreaks(settings)
    })

    return json({
        settings: {
            reviewRequestEmailSettings: initialReviewRequestEmailSettings, 
            customerQuestionEmailSettings: initialCustomQuestionEmailSettings, 
            customerRewardEmailSettings: initialCustomerRewardEmailSettings, 
            emailDesignSettings: initialEmailDesignSettings
        }, 
        companyName
    })
}

export default function EmailTemplates() {

    const data = useLoaderData<typeof loader>()

    const [settings, setSettings] = useState(data.settings)
    const [emailCopyVersion, setEmailCopyVersion] = useState('Initial')
    const [selectedTab, setSelectedTab] = useState('reviewRequestEmailSettings')

    // modal states
    const [emailEditModalOpen, setEmailEditModalOpen] = useState(false)
    const [dynamicVariableTipsModalOpen, setDynamicVariableTipsModalOpen] = useState(false)

    const [emailBody, setEmailBody] = useState(data.settings.reviewRequestEmailSettings.initialEmailBody)
    
    const [errors, setErrors] = useState<any>({})

    const cleanSettings = data.settings

    const isFormDirty = JSON.stringify(settings) !== JSON.stringify(cleanSettings)
    
    const selectedFileContainerRef = useRef<HTMLDivElement>()
    const trashCanIconContainerRef = useRef<HTMLDivElement>()

    const submit = useSubmit()
    const navigation = useNavigation()

    const changeTabs = (tabName: "reviewRequestEmailSettings" | "customerQuestionEmailSettings" | "customerRewardEmailSettings") => {
        if (isFormDirty) return

        if (tabName === "reviewRequestEmailSettings") {
            setSelectedTab("reviewRequestEmailSettings")
            setEmailCopyVersion("Initial")
            setEmailBody(settings.reviewRequestEmailSettings.initialEmailBody)
        } else if (tabName === "customerQuestionEmailSettings") {
            setSelectedTab("customerQuestionEmailSettings")
            setEmailBody(settings.customerQuestionEmailSettings.body)
        } else if (tabName === "customerRewardEmailSettings") {
            setSelectedTab("customerRewardEmailSettings")
            setEmailBody(settings.customerRewardEmailSettings.body)
        }
    }

    const handleDrop = (files: File[], acceptedFiles: File[], rejectedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const acceptedFile = acceptedFiles[0]
            setSettings(prevSettings => {return {...prevSettings, emailDesignSettings: {...prevSettings.emailDesignSettings, logo: {name: acceptedFile.name, url: window.URL.createObjectURL(acceptedFile), file: acceptedFile}}}})
        }
    }

    const handleSave = () => { 
        if (Object.keys(errors).length > 0) return
        const formData = new FormData()

        if (selectedTab === "reviewRequestEmailSettings") {
            Object.keys(settings.reviewRequestEmailSettings).forEach(key => {
                formData.append(key, settings.reviewRequestEmailSettings[key as keyof typeof settings.reviewRequestEmailSettings] as string)
            })
            formData.append("settings", "review-request")
        } else if (selectedTab === "customerQuestionEmailSettings") {
            Object.keys(settings.customerQuestionEmailSettings).forEach(key => {
                formData.append(key, settings.customerQuestionEmailSettings[key as keyof typeof settings.customerQuestionEmailSettings] as string)
            })
            formData.append("settings", "customer-question")
        } else if (selectedTab === "customerRewardEmailSettings") {
            Object.keys(settings.customerRewardEmailSettings).forEach(key => {
                formData.append(key, settings.customerRewardEmailSettings[key as keyof typeof settings.customerRewardEmailSettings] as string)
            })
            formData.append("settings", "customer-reward")
        }

        Object.keys(settings.emailDesignSettings).forEach(key => {
            if (key === "logo") {
                // check if logo upload exists
                if (settings.emailDesignSettings[key]) {
                    // if there's a file property, there's a new uploaded logo
                    if (settings.emailDesignSettings[key].hasOwnProperty("file")) {
                        formData.append('newLogo', ((settings.emailDesignSettings[key]) as any).file)
                    } else {
                        // otherwise, there's no change
                        formData.append('currentLogo', settings.emailDesignSettings[key].url)
                    }
                } else {
                    // logo was removed
                    return
                }
            } else {
                formData.append("bannerBgColor", settings.emailDesignSettings.bannerBgColor)
            }
        })
        submit(formData, {method: 'POST', encType: 'multipart/form-data'})
    }

    useEffect(() => {
        if (selectedFileContainerRef.current) {
            selectedFileContainerRef.current.addEventListener('click', () => {setSettings(prevSettings => {return {...prevSettings, emailDesignSettings: {...prevSettings.emailDesignSettings, logo: null}}})})
            selectedFileContainerRef.current.addEventListener('mouseover', () => (trashCanIconContainerRef.current as HTMLDivElement).style.display = 'flex')
            selectedFileContainerRef.current.addEventListener('mouseleave', () => (trashCanIconContainerRef.current as HTMLDivElement).style.display = 'none')
        }
    }, [settings.emailDesignSettings.logo])

    useEffect(() => {
        setSettings(data.settings)
    }, [data.settings.emailDesignSettings.logo])

    const fileUploadBtn = !settings.emailDesignSettings.logo && <DropZone.FileUpload actionTitle="Upload Your Logo" />

    const testReviewRequestEmailVariables: ReviewRequestEmailVariables = {
        lineItems: [],
        configuredQuestions: []
    }

    const testCustomerQuestionEmailVariables: CustomerQuestionEmailVariables = {
        question: "Is this a beginner-friendly snowboard?",
        answer: "It is! This is a great board to help beginners get the hang of things early!",
    }

    const testCustomerRewardEmailVariables: CustomerRewardEmailVariables = {
        reward: "20% Off",
        discountCode: "TEST-EMAIL-DISCOUNT-CODE",
    }

    const sendTestEmail = () => { 
        const formData = new FormData()
        formData.append('emailBody', emailBody)
        formData.append('store', data.settings.emailDesignSettings.store)

        if (selectedTab === "reviewRequestEmailSettings") {

            formData.append('emailVariables', JSON.stringify(testReviewRequestEmailVariables))
            formData.append('type', "review-request")
            formData.append('subject', emailCopyVersion === "Initial" ? settings["reviewRequestEmailSettings"].initialEmailSubject : settings["reviewRequestEmailSettings"].followUpEmailSubject)
        
        } else if (selectedTab === "customerQuestionEmailSettings") {

            formData.append('emailVariables', JSON.stringify(testCustomerQuestionEmailVariables))
            formData.append('type', "customer-question")
            formData.append('subject', settings["customerQuestionEmailSettings"].subject)

        } else if (selectedTab === "customerRewardEmailSettings") {

            formData.append('emailVariables', JSON.stringify(testCustomerRewardEmailVariables))
            formData.append('type', "customer-reward")
            formData.append('subject', settings["customerRewardEmailSettings"].subject)

        }
        submit(formData, {action: '/api/test-email/send', method: 'POST', encType: 'multipart/form-data', navigate: false})
    }

    const generateSampleEmailBody = () => {
        let updatedEmailBody = ""
        switch (selectedTab) {
            case "reviewRequestEmailSettings":
                updatedEmailBody = generateReviewRequestEmailBody(emailBody, testReviewRequestEmailVariables)
                break;
            case "customerQuestionEmailSettings":
                updatedEmailBody = generateCustomerQuestionEmailBody(emailBody, testCustomerQuestionEmailVariables)
                break
            case "customerRewardEmailSettings":
                updatedEmailBody = generateCustomerRewardEmailBody(emailBody, testCustomerRewardEmailVariables)
                break
        }

        return updatedEmailBody
    }

    const editEmail = (e: any) => {
        if (selectedTab === "reviewRequestEmailSettings") {
            if (emailCopyVersion == "Initial") {
                setSettings({...settings, reviewRequestEmailSettings: {...settings.reviewRequestEmailSettings, initialEmailBody: e.target.value}})
                setEmailBody(e.target.value)
            } else {
                setSettings({...settings, reviewRequestEmailSettings: {...settings.reviewRequestEmailSettings, followUpEmailBody: e.target.value}})
                setEmailBody(e.target.value)
            }
        } else {
            setSettings({...settings, [selectedTab as keyof typeof settings]: {...settings[selectedTab as keyof typeof settings], body: e.target.value}})
            setEmailBody(e.target.value)
        }
    }

    const revertChanges = () => {
        setErrors({})
        setSettings(cleanSettings)
        if (selectedTab === "reviewRequestEmailSettings") {
            if (emailCopyVersion === "Initial") {
                setEmailBody(cleanSettings.reviewRequestEmailSettings.initialEmailBody)
            } else {
                setEmailBody(cleanSettings.reviewRequestEmailSettings.followUpEmailBody)
            }
        } else if (selectedTab === "customerQuestionEmailSettings") {
            setEmailBody(cleanSettings.customerQuestionEmailSettings.body)
        } else {
            setEmailBody(cleanSettings.customerRewardEmailSettings.body)
        }
    }

    const checkForRequiredVariable = (e: React.FocusEvent<HTMLTextAreaElement, Element>) => {
        if (selectedTab === "reviewRequestEmailSettings" && !e.target.value.includes('{{stars}}') 
            || selectedTab === "customerRewardEmailSettings" && !e.target.value.includes('{{discountCode}}')
            || selectedTab === "customerQuestionEmailSettings" && !e.target.value.includes('{{answer}}')
        ) return setErrors({...errors, emailBody: true})
        
        const currentErrors = {...errors}
        delete currentErrors['emailBody']
        setErrors(currentErrors)
    }

    const dynamicVariables = selectedTab === "reviewRequestEmailSettings" ?
        (
            <>
                <strong>{`{{stars}}`}</strong> – required; replaced with the clickable stars that link to the review form
                <br />
                <br />
                <strong>{`{{firstName}}`}</strong> – optional; replaced with the customer's first name
                <br />
                <br />
                <strong>{`{{productName}}`}</strong> – optional; replaced with the name of the product for which the review request is for
            </>
        ) : selectedTab === "customerQuestionEmailSettings" ?
        (
            <>
                <strong>{`{{answer}}`}</strong> – required; replaced with the answer to the question
                <br />
                <br />
                <strong>{`{{question}}`}</strong> – optional; replaced with the customer's original question
                <br />
                <br />
                <strong>{`{{firstName}}`}</strong> – optional; replaced with the customer's first name
            </>
        ) :
        (
            <>
                <strong>{`{{discountCode}}`}</strong> – required; replaced with the discount code
                <br />
                <br />
                <strong>{`{{firstName}}`}</strong> – optional; replaced with the customer's first name
                <br />
                <br />
                <strong>{`{{reward}}`}</strong> – optional; replaced with the reward that the customer earned
            </>
        )

    const emailSubjectValue = selectedTab === "customerQuestionEmailSettings" ? settings.customerQuestionEmailSettings.subject :
                              selectedTab === "reviewRequestEmailSettings" && emailCopyVersion === "Initial" ? settings["reviewRequestEmailSettings"]["initialEmailSubject"] : 
                              selectedTab === "reviewRequestEmailSettings" && emailCopyVersion === "Follow Up" ? settings["reviewRequestEmailSettings"]["followUpEmailSubject"] :
                              settings["customerRewardEmailSettings"].subject
    
    const handleEmailSubjectChange = (val: string) => {
        if (selectedTab === "reviewRequestEmailSettings") {
            if (emailCopyVersion === "Initial") {
                setSettings({...settings, reviewRequestEmailSettings: {...settings["reviewRequestEmailSettings"], initialEmailSubject: val}})
            } else {
                setSettings({...settings, reviewRequestEmailSettings: {...settings["reviewRequestEmailSettings"], followUpEmailSubject: val}})
            }
        } else {
            setSettings({...settings, [selectedTab as keyof typeof settings]: {...settings[selectedTab as keyof typeof settings], subject: val}})
        }
    }

    return (
        <Page
        title="Email Templates"
        subtitle="Customize your email templates to match your branding and messaging style"
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
                style={{resize: 'none', outline: 'none', padding: '10px', width: '100%', height: '50vh'}} 
                onChange={editEmail} 
                onBlur={checkForRequiredVariable}
                />
                {errors['emailBody'] && <InlineError message={"Required variable missing in the email body"} fieldID="errorMessage" />}
            </Modal>
            <Modal 
            open={dynamicVariableTipsModalOpen}
            onClose={() => setDynamicVariableTipsModalOpen(false)}
            title="Dynamic Variables"
            >
                <Card>
                    <Text as="p" variant="bodyMd">
                        {dynamicVariables}
                    </Text>
                </Card>
            </Modal>
            <BlockStack gap='300'>
                <div className={styles.tabContainer}>
                    <div 
                    className={styles.tab} 
                    style={{backgroundColor: selectedTab === "reviewRequestEmailSettings" ? "rgb(201, 201, 201)" : "rgb(230, 230, 230)"}}
                    onClick={() => changeTabs("reviewRequestEmailSettings")}
                    >
                        Review Request
                    </div>
                    <div 
                    className={styles.tab}
                    style={{backgroundColor: selectedTab === "customerQuestionEmailSettings" ? "rgb(201, 201, 201)" : "rgb(230, 230, 230)"}}
                    onClick={() => changeTabs("customerQuestionEmailSettings")}
                    >
                        Customer Question
                    </div>
                    <div 
                    className={styles.tab}
                    style={{backgroundColor: selectedTab === "customerRewardEmailSettings" ? "rgb(201, 201, 201)" : "rgb(230, 230, 230)"}}
                    onClick={() => changeTabs("customerRewardEmailSettings")}
                    >
                        Customer Reward
                    </div>
                </div>
                {selectedTab === "review-request" && 
                <Banner title="Want the emails to come from your own domain?">
                    To send branded and trusted emails from your store’s domain, you need to verify the domain by adding a few DNS records found on the <Link url="/app/settings/domain-verification">domain verification</Link> page. Otherwise, the emails will come from our app's domain.
                </Banner>
                }
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
                                    {settings.emailDesignSettings.logo ? 
                                    <div ref={(element: HTMLDivElement) => selectedFileContainerRef.current = element} className={styles.uploadedMedia}>
                                        <Thumbnail
                                        size="medium"
                                        alt={settings.emailDesignSettings.logo.name}
                                        source={settings.emailDesignSettings.logo.url}
                                        />
                                        <BlockStack gap='100'>
                                            <Text as="h1" variant="headingMd">{settings.emailDesignSettings.logo.name}</Text>
                                        </BlockStack>
                                        <div ref={(element: HTMLDivElement) => trashCanIconContainerRef.current = element} className={styles.trashCanIconContainer}> 
                                            <FontAwesomeIcon icon={faTrashCan} color="white" size="3x" />
                                        </div>
                                    </div> 
                                    :
                                    fileUploadBtn  
                                }
                                </DropZone>
                                <TextField 
                                label={selectedTab === "review-request" ? `${emailCopyVersion} Email Subject` : "Email Subject"} 
                                value={emailSubjectValue}
                                onChange={handleEmailSubjectChange}
                                autoComplete="off"
                                />
                                <BlockStack gap='100'>
                                    <Label id="colorPicker">Banner Background Color</Label>
                                    <HexColorPicker
                                    key='colorPicker'
                                    color={settings.emailDesignSettings.bannerBgColor} 
                                    onChange={(color) => { setSettings(prevSettings => {return {...prevSettings, emailDesignSettings: {...prevSettings.emailDesignSettings, bannerBgColor: color}}})}} 
                                    />
                                    <HexColorInput
                                    color={settings.emailDesignSettings.bannerBgColor} 
                                    onChange={(color) => { setSettings(prevSettings => {return {...prevSettings, emailDesignSettings: {...prevSettings.emailDesignSettings, bannerBgColor: color}}})}} 
                                    />
                                </BlockStack>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                    <Layout.Section variant="oneHalf">
                        <Card>
                            <BlockStack gap={'200'}>
                                <InlineStack blockAlign="center" align="space-between">
                                    <InlineStack gap='400'>
                                        <h2 style={{fontWeight: 'bold'}}>{selectedTab === "reviewRequestEmailSettings" ? `${emailCopyVersion} Email Preview` : 'Email Preview'}</h2>
                                        <Button variant="plain" onClick={() => setEmailEditModalOpen(true)}>Edit Email</Button>
                                    </InlineStack>
                                    {selectedTab === "reviewRequestEmailSettings" &&
                                    <Pagination 
                                    hasNext={emailCopyVersion === 'Initial'} 
                                    hasPrevious={emailCopyVersion === 'Follow Up'}
                                    onNext={() => { setEmailCopyVersion('Follow Up'); setEmailBody(data.settings.reviewRequestEmailSettings.followUpEmailBody)}}
                                    onPrevious={() => { setEmailCopyVersion('Initial'); setEmailBody(data.settings.reviewRequestEmailSettings.initialEmailBody)}}
                                    />
                                    }
                                </InlineStack>
                                <BlockStack gap='300'>
                                    <div className={styles.emailHeaderContainer} style={{backgroundColor: settings.emailDesignSettings.bannerBgColor}}>
                                        <div className={styles.logoContainer}>
                                            {settings.emailDesignSettings.logo && 
                                                <Image 
                                                draggable={false}
                                                height={50} 
                                                width={50} 
                                                source={settings.emailDesignSettings.logo.url} 
                                                alt={settings.emailDesignSettings.logo.name} 
                                                />
                                            }
                                        </div>
                                    </div>
                                    <div dangerouslySetInnerHTML={{__html: generateSampleEmailBody()}}></div>
                                </BlockStack>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </BlockStack>
        </Page>
    )
}