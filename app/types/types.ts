import { IndexFiltersProps } from "@shopify/polaris"

export const initialFileImportState = {
    file: undefined,
    errors: false,
    fileUploaded: false,
    isImportingFileReviews: false,
    selectedProductDataFile: undefined,
    heading: 'Import File Here' 
}

export const initialQuestionState: CustomReviewFormQuestion = {
    productConfiguration: ['all'],
    answerType: ['text'],
    productIds: [],
    collectionIds: [],
    radioAllowMultipleAnswers: ['false'],
    radioAnswerChoices: ['', ''],
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

export interface CustomReviewFormQuestion {
    id?: number
    answerType: string[]
    productConfiguration: string[]
    productIds: string[]
    collectionIds: string[]
    title: string
    isRequired: string[]
    radioAnswerChoices: string[]
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
    title: string
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
    selectedRatings: []
}

export const initialReviewRequestTableState: ReviewRequestTableState = {
    queryValue: '',
    selectedTab: 0,
    sortSelected: ['date desc'],
    selectedProductFilters: [],
    selectedFulfillmentFilters: [],
    selectedReviewStatusFilters: []
}

export const initialCustomQuestionTableState: CustomQuestionTableState = {
    queryValue: '',
    selectedTab: 0,
    sortSelected: ['choices asc'],
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
    sortSelected: IndexFiltersProps['sortSelected'] 
    selectedProducts: string[]
    selectedRatings: string[]
    selectedTab: number
}

export interface ReviewRequestTableState {
    queryValue: string
    selectedTab: number
    sortSelected: IndexFiltersProps['sortSelected']
    selectedProductFilters: string[]
    selectedFulfillmentFilters: string[]
    selectedReviewStatusFilters: string[]
}

export interface Review {
    store: string;
    title: string;
    body: string;
    name: string;
    email: string | null;
    rating: number;
    media: string;
    date: Date | string;
    productTitle: string;
    id: string
}

export interface Import3rdPartyReviewsFormState {
    isImporting3rdPartyReviews: boolean
    numberOfReviews: number
    selectedImportRatings: string[]
    productLink: any
    selectedProductData3rdParty?: SelectedProductData
    importFormErrors: any
}

interface SelectedProductData {
    id: string 
    image: string
    title: string
}

export interface importFileReviewsFormState {
    errors: boolean
    fileUploaded: boolean
    isImportingFileReviews: boolean
    selectedProductDataFile?: SelectedProductData
    heading: string
    file?: File
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

// export interface DisplayProduct {
//     store: string; 
//     productId: string; 
//     title: string; 
//     imageUrl: string | null; 
// }

export interface AppSettings {
    id: number
    store: string
    reviewRequestEmailProductDisplay: string[]
    displayProducts: any[]
    autoPublishReviews: string[]
    minReviewRating: number 
    firstReviewRequest: number
    secondReviewRequest: number
}

export interface SettingsPageProps {
    state: AppSettings
    setState: (value: AppSettings) => void
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