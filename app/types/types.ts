import { IndexFiltersProps } from "@shopify/polaris"
import { MutableRefObject } from "react"

export const sampleReviewData = [
    ['title, body', 'name', 'email', 'rating', 'media', 'date', 'isPublished'],
    [
        'Blizzard Bites are awesome!',
        'They are definitely some of the best protein bites on the market! Looking forward to trying more soon!',
        'Katie',
        'katielovesblizzardbites@gmail.com',
        5,
        '',
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
    productIds: []
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

export interface SettingsTab {
    store: string,
    path: string
}

export interface RadioAnswerChoice {
    value: string;
    display: boolean;
    label?: string;
}

export interface ReviewFormQuestion {
    id?: number
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

export const initialCustomQuestionTableState: CustomQuestionTableState = {
    queryValue: '',
    selectedTab: 0,
    sortSelected: ['numProducts desc'],
    selectedProductConfiguration: []
}

export interface CustomQuestionTableState {
    queryValue: string
    selectedTab: number
    sortSelected: IndexFiltersProps['sortSelected']
    selectedProductConfiguration: string[]
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

interface SelectedProductData {
    id: string 
    image: string
    title: string
}

export interface ReviewRequestData {
    store: string 
    date: Date 
    fulfillmentStatus: string | null 
    reviewStatus: string 
    emailsSent: number 
    product: string 
    orderId: number 
    orderName: string
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

export interface AppSettings {
    id: number
    store: string
    autoPublishReviews: string[]
    minReviewRating: number 
    firstReviewRequest: number
    secondReviewRequest: number
}

export interface ReviewRequestEmailSettings {
    store: string,
    bannerBgColor: string,
    logo: {
        name: string,
        url: string,
        file?: File
    } | null,
    productDisplay: string[],
    productIds: string[]
}

export interface ReviewRequestEmailProductData {
    title: string,
    image: string | null,
    handle: string
}

export interface SettingsPageProps {
    state: AppSettings
    setState: (value: AppSettings) => void
    errors: MutableRefObject<string[]>
}

export interface Reward {
    selectedRewardType: string
    fixedAmount: number
    percentageAmount: number
    bogoRewardType: string
    bogoPurchaseAmount: number
    bogoReceiveAmount: number
    bogoDiscountAmount: number
    minPurchaseType: string
    minPurchaseDollarValue: number
    minPurchaseQuantityValue: number
}

export interface RewardState {
    subpar: Reward
    good: Reward
    perfect: Reward
}

export interface EmailOrderData {
    customerFirstName: string,
    productName: string,
    productImage: string
}