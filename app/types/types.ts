import { IndexFiltersProps } from "@shopify/polaris"
import { MutableRefObject } from "react"

// variables

export const initialRewardState: Reward = {
    disabled: true,
    selectedRewardType: 'free-shipping', 
    dollarAmount: 10, 
    percentageAmount: 10, 
    bxgyRewardType: "free", 
    bxgyPurchaseAmount: 1, 
    bxgyReceiveAmount: 1, 
    bxgyPercentageAmount: 0.1,
    bxgyDollarAmount: 10, 
    minPurchaseType: 'none', 
    minPurchaseDollarValue: 1, 
    minPurchaseQuantityValue: 1,
    productCollectionConfiguration: "all",
    bxgyPurchaseProductId: "",
    bxgyReceiveProductId: "",
    eligibleProducts: [],
    eligibleCollections: []
}

export const sampleReviewData = [
    ['title, body', 'firstName', 'rating', 'date', 'isPublished', 'media'],
    [
        'This is a sample review title!',
        "This is a sample review body!",
        'Name',
        5,
        new Date().toLocaleDateString(),
        false,
        ['https://s3.amazonaws.com/bucketname/foldername/imagename.jpg']
    ]
]

export const defaultReviewRequestEmailSettings: ReviewRequestEmailSettings = {
    initialEmailBody: (
        `Hey {{firstName}},
    
        We hope you’re absolutely loving your {{productName}}!
        
        We’d be so grateful if you could take a moment to share your experience. Your feedback not only helps us improve but also guides others in making confident choices.
        
        It’ll only take a minute of your time—and it would mean the world to us!

        {{stars}}
        Thanks a ton for being a part of our journey. We can’t wait to hear what you think!`
    ),
    followUpEmailBody: (
        `
            Hey {{firstName}},
            
            We hope you’re doing well! We wanted to follow up on our previous email about your experience with the: {{productName}}. Your thoughts are incredibly important to us, and we’d truly value hearing your feedback.

            {{stars}}
            Thank you so much for your time and for being a valued part of our community.`
    ),
    initialEmailSubject: "{{firstName}}, tell us how you feel...",
    followUpEmailSubject: "We hope you are doing well, {{firstName}}!"
}

export const defaultCustomerQuestionEmailSettings = {
    subject: "{{firstName}}, we have an answer for you!",
    body: (
        `Hey {{firstName}},
    
        You recently asked us the following question: {{question}}

        Here's our answer for you:

        {{answer}}
        
        We hope this answers your question!

        If you have any additional follow-up questions, please feel free to reach us at yoursupportemail@domain.com.

        Enjoy the rest of your day!`
    ) 
}

export const defaultCustomerRewardEmailSettings = {
    subject: "{{firstName}}, we have a special reward for you!",
    body: (
        `Hey {{firstName}},
    
        Thank you so much for your recent review!

        As a reward, use this code for {{reward}}:
        
        {{discountCode}}

        Thank you again and enjoy the rest of your day!`
    ) 
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
    isRequired: ['false'],
    published: true
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

export const initialQuestionAnswerTableState: QuestionAnswerTableState = {
    queryValue: '',
    selectedTab: 0,
    selectedProducts: [],
    selectedAnswerStatus: [],
    sortSelected: ['date desc']
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
    isReviewFormDisabled: string
    firstReviewRequest: number
    secondReviewRequest: number
    companyName: string
    primaryEmail: string
    domain: string
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

export interface CustomerQuestionEmailVariables {
    questionId: string
    firstName?: string
    question?: string
    answer: string
}

export interface CustomerRewardEmailVariables {
    reward?: string
    discountCode?: string
    firstName?: string
}

export interface CustomQuestionTableState {
    queryValue: string
    selectedTab: number
    sortSelected: IndexFiltersProps['sortSelected']
    selectedProductConfiguration: string[]
}

export interface EligibleProduct {
    productId: string
}

export interface EligibleCollection {
    collectionId: string
}

export interface EmailHeaderStyles {
    bannerBgColor: string
    logo: {
        name: string
        url: string
        file?: File
    } | null,
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

export interface FetchedReward {
    name: string | null
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
    firstName: string
    rating: string
    media: {
        name: string
        url: string
        file?: File
    }[]
}

export interface QuestionAnswerTableState {
    queryValue: string
    selectedTab: number 
    sortSelected: IndexFiltersProps['sortSelected'] 
    selectedProducts: string[]
    selectedAnswerStatus: string[]
}

export interface RadioAnswerChoice {
    id?: string;
    value: string;
    display: boolean;
    label?: string;
}

export interface Reward {
    disabled: boolean
    selectedRewardType: string
    dollarAmount: number
    percentageAmount: number
    bxgyRewardType: string
    bxgyPurchaseAmount: number
    bxgyReceiveAmount: number
    bxgyPercentageAmount: number
    bxgyDollarAmount: number
    minPurchaseType: string
    minPurchaseDollarValue: number
    minPurchaseQuantityValue: number
    productCollectionConfiguration: string
    bxgyPurchaseProductId: string
    bxgyReceiveProductId: string
    eligibleProducts: EligibleProduct[]
    eligibleCollections: EligibleCollection[]
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

export interface ReviewNotificationVariables {
    reviewId: string
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
    published: boolean
}

export interface ReviewRequestEmailVariables {
    authToken?: string | null
    store?: string
    reviewRequestId?: string
    firstName?: string
    lineItems: {
        currentQuantity: number
        productId: string
        title: string
        image: string
    }[]
    configuredQuestions: string[][]
}

export interface ReviewRequestEmailSettings {
    initialEmailBody: string
    followUpEmailBody: string
    initialEmailSubject: string
    followUpEmailSubject: string
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

export interface SelectedProduct_Bxgy {
    title: string,
    image: string | null
}

export interface SelectedProduct_Reward {
    id: string
    title: string
    images: {
        originalSrc: string
    }[]
}

export interface SelectedCollection_Reward {
    id: string
    title: string
}

export interface DNSRecord { 
    Name: string;
    Type: string;
    Value: string;
}

export interface SettingsPageProps {
    state: AppSettings
    setState: React.Dispatch<React.SetStateAction<AppSettings>>
    errors: MutableRefObject<string[]>
}

export const initialUserReviewFormInputState: UserReviewFormInputState = {
    title: '',
    body: '',
    customQuestionAnswers: {}
}

export interface UserReviewFormInputState {
    firstName?: string
    email?: string
    productId?: string
    title: string
    body: string
    customQuestionAnswers: {[key: string]: {value: string[], type: string, isRequired: string}}
}