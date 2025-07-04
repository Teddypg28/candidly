import { IndexFiltersProps } from "@shopify/polaris"
import { MutableRefObject } from "react"

// variables

export const sampleReviewData = [
    ['title, body', 'firstName', 'email', 'rating', 'date', 'isPublished'],
    [
        'PowderedSlopes is awesome!',
        "This is definitely one of the best snowboards I've ever tried",
        'Katie',
        'katielovessnowboarding@gmail.com',
        5,
        new Date().toLocaleDateString(),
        false
    ]
]

export const defaultReviewFormSettings = {
    heading: 'Tell Us What You Think',
    subheading: 'Rate it out of 5 stars:',
    headlinePlaceholder: 'Sum up your experience in a few short words',
    reviewPlaceholder: 'What did you like or not like?',
    primaryFormColor: '#000000'
}

export const defaultReviewRequestEmailSettings: ReviewRequestEmailSettings = {
    store: '',
    logo: null,
    bannerBgColor: 'black',
    productDisplay: ['disabled'],
    productIds: [],
    companyName: undefined,
    initialEmailBody: (
        `Hey {{firstName}},
    
        We hope you’re absolutely loving your {{productName}}!
        
        We’d be so grateful if you could take a moment to share your experience. Your feedback not only helps us improve but also guides others in making confident choices.
        
        It’ll only take a minute of your time—and it would mean the world to us!

        {{stars}}

        Thanks a ton for being a part of our journey. We can’t wait to hear what you think!
        
        - {{companyName}}`
    ),
    followUpEmailBody: (
        `
            Hey {{firstName}},
            
            We hope you’re doing well! We wanted to follow up on our previous email about your experience with the: {{productName}}. Your thoughts are incredibly important to us, and we’d truly value hearing your feedback.

            {{stars}}

            Thank you so much for your time and for being a valued part of our community.

            - {{companyName}}
        `
    ),
    subject: "Tell Us How You Feel"
}

export const initialImportCsvFileState: ImportCsvFileState = {
    files: [],
    products: [],
    importInitiated: false,
    errors: {}
}

export const initialQuestionState: ReviewFormQuestion = {
    productConfiguration: ['all'],
    answerType: ['radio'],
    productIds: [],
    collectionIds: [],
    radioAllowMultipleAnswers: ['false'],
    radioAnswerChoices: [{value: '', display: false, label: ''}, {value: '', display: false, label: ''}],
    radioDisplayAnswer: ['false'],
    radioDisplayedAnswerLabel: '',
    title: '',
    isRequired: ['false']
}

export const initialCustomQuestionErrorState = {
    title: false, 
    product: false,
    collection: false,
    answerChoices: false,
    radioDisplayedAnswerLabel: false
}

export const initialCustomQuestionTableState: CustomQuestionTableState = {
    queryValue: '',
    selectedTab: 0,
    sortSelected: ['numProducts desc'],
    selectedProductConfiguration: []
}

export const initialReviewTableState: ReviewTableState = {
    queryValue: '',
    selectedTab: 0,
    sortSelected: ['date asc'],
    selectedProducts: [],
    selectedRatings: [],
    selectedVisibility: [],
}

export const initialReviewRequestTableState: ReviewRequestTableState = {
    queryValue: '',
    selectedTab: 0,
    sortSelected: ['date desc'],
    selectedProductFilters: [],
    selectedFulfillmentFilters: [],
    selectedReviewStatusFilters: [],
}

// types

export interface AppSettings {
    id: string
    store: string
    autoPublishReviews: string[]
    minReviewRating: number 
    firstReviewRequest: number
    secondReviewRequest: number
    companyName: string
    primaryEmail: string
}

export interface AnalyticsData {
    heading: string
    value: number | string
    key?: string
    link?: string
}

export interface CustomQuestionFormError {
    title: boolean 
    product: boolean
    collection: boolean
    answerChoices: boolean
    radioDisplayedAnswerLabel: boolean
    [key: string]: boolean
}

export interface CustomReviewFormAnswerOption {
    [key: string]: any
}

export interface CustomQuestionTableState {
    queryValue: string
    selectedTab: number
    sortSelected: IndexFiltersProps['sortSelected']
    selectedProductConfiguration: string[]
}

export interface EmailCompanyData {
    name: string, 
    logo: string | null
}

export interface EmailOrderData {
    customerFirstName: string
    productName: string
    productImage: string
}

export interface Import3rdPartyReviewsFormState {
    isImporting3rdPartyReviews: boolean
    numberOfReviews: number
    selectedImportRatings: string[]
    productLink: any
    selectedProductData3rdParty?: SelectedProductData
    importFormErrors: any
}

export interface ImportCsvFileState {
    files: File[],
    products: SelectedProductData[],
    importInitiated: boolean,
    errors: any
}

export interface ProductReview {
    title: string
    body: string
    name: string
    rating: string
    media: {
        name: string
        url: string
        file?: File
    }[]
}

export interface RadioAnswerChoice {
    id?: string;
    value: string;
    display: boolean;
    label?: string;
}

export interface ReviewTableState {
    queryValue: string 
    selectedTab: number
    sortSelected: IndexFiltersProps['sortSelected'] 
    selectedProducts: string[]
    selectedRatings: string[]
    selectedVisibility: string[]
}

export interface ReviewRequestTableState {
    queryValue: string
    selectedTab: number
    sortSelected: IndexFiltersProps['sortSelected']
    selectedProductFilters: string[]
    selectedFulfillmentFilters: string[]
    selectedReviewStatusFilters: string[]
}

export interface ReviewFormQuestion {
    id?: string
    answerType: string[]
    productConfiguration: string[]
    productIds: string[]
    collectionIds: string[]
    title: string
    isRequired: string[]
    radioAnswerChoices: RadioAnswerChoice[]
    radioAllowMultipleAnswers: string[]
    radioDisplayAnswer: string[]
    radioDisplayedAnswerLabel: string
}

export interface ReviewRequestEmailData {
    authToken?: string | null
    reviewRequestId?: string
    store: string
    subject: string
    bannerBgColor: string
    logo: {
        name: string
        url: string
        file?: File
    } | null,
    firstName?: string
    companyName?: string
    lineItems: {
        currentQuantity: number
        productId: string
        title: string
        image: string
    }[]
    configuredQuestions: string[][]
}

export interface ReviewRequestEmailSettings {
    store: string
    bannerBgColor: string
    logo: {
        name: string,
        url: string,
        file?: File
    } | null
    productDisplay: string[]
    productIds: string[]
    companyName?: string
    initialEmailBody: string
    followUpEmailBody: string
    subject: string
}

export interface ReviewRequestEmailProductData {
    title: string,
    image: string | null,
    handle: string
}

export interface ReviewRequestData {
    store: string 
    createdAt: Date 
    fulfillmentStatus: string | null 
    isComplete: boolean 
    emailsSent: number 
    email: string
    orderId: number 
    orderName: string
    firstName: string
}

export interface SettingsTab {
    store: string,
    path: string
}

export interface SelectedCollection {
    id: string
    title: string
}

export interface SelectedProduct {
    id: string
    image: any
    title: string,
    variants: string[]
}

interface SelectedProductData {
    id: string 
    image: string
    title: string
}

export interface SettingsPageProps {
    state: AppSettings
    setState: React.Dispatch<React.SetStateAction<AppSettings>>
    errors: MutableRefObject<string[]>
}

export const initialUserReviewFormInputState: UserReviewFormInputState = {
    title: '',
    body: '',
    selectedAnswerChoices: {}
}

export interface UserReviewFormInputState {
    firstName?: string
    email?: string
    productId?: string
    title: string
    body: string
    selectedAnswerChoices: {[key: string]: {id: string, value: string}[]}
}