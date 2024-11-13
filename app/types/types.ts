import { IndexFiltersProps } from "@shopify/polaris"

export const initialQuestionState: CustomReviewFormQuestionState = {
    productConfiguration: ['all'],
    answerType: [],
    productIds: [],
    collectionIds: [],
    radioAllowMultipleAnswers: ['false'],
    radioAnswerChoices: ['', ''],
    radioDisplayAnswer: ['false'],
    title: '',
    isRequired: ['false']
}

export interface CustomReviewFormQuestionState {
    id?: number
    answerType: string[]
    productConfiguration: string[]
    productIds: string[],
    collectionIds: string[],
    title: string
    isRequired: string[]
    radioAnswerChoices: string[]
    radioAllowMultipleAnswers: string[]
    radioDisplayAnswer: string[],
    radioDisplayedAnswerLabel?: string
}

export interface SelectedCollection {
    id: string,
    title: string
}

export interface SelectedProduct {
    id: string,
    image: any,
    title: string
}

export interface CustomReviewFormAnswerOption {
    [key: string]: any
}

export interface ProductVariant {
    title: string
}

export interface ReducerAction {
    type: string,
    payload?: any
}

export interface ReviewsTableFilterState {
    queryValue: string, 
    sortSelected: IndexFiltersProps['sortSelected'], 
    selectedProducts: string[] | null,
    selectedRatings: string[] | null,
    selected: number
}

export interface ReviewRequestIndexTableState {
    queryValue: string,
    selectedProductFilters: string[],
    selectedFulfillmentFilters: string[],
    selectedReviewStatusFilters: string[],
    selectedTab: number,
    sortSelected: IndexFiltersProps['sortSelected']
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
    isImporting3rdPartyReviews: boolean,
    numberOfReviews: number,
    selectedImportRatings: string[],
    productLink: any,
    selectedProductData3rdParty?: SelectedProductData,
    importFormErrors: any
}

interface SelectedProductData {
    id: string, 
    image: string,
    title: string
}

export interface importFileReviewsFormState {
    errors: boolean,
    fileUploaded: boolean,
    isImportingFileReviews: boolean,
    selectedProductDataFile?: SelectedProductData,
    heading: string,
    file?: File
}

export interface SavedView {
    id?: number,
    name: string, 
    queryValue: string, 
    sortSelected: IndexFiltersProps['sortSelected'], 
    selectedProducts: string[],
    selectedRatings: string[]
}

export interface ReviewRequestData {
    store: string, 
    date: Date, 
    fulfillmentStatus: string | null, 
    reviewStatus: string, 
    emailsSent: number, 
    product: string, 
    orderId: number, 
    orderName: string
}

// export interface DisplayProduct {
//     store: string; 
//     productId: string; 
//     title: string; 
//     imageUrl: string | null; 
// }

export interface AppSettings {
    id: number,
    store: string,
    reviewRequestEmailProductDisplay: string[],
    displayProducts: any[],
    autoPublishReviews: string[],
    minReviewRating: number, 
    firstReviewRequest: number,
    secondReviewRequest: number
}

export interface SettingsPageProps {
    state: AppSettings,
    setState: (value: AppSettings) => void
}

export interface Reward {
    selectedRewardType: string,
    fixedAmount: number,
    percentageAmount: number,
    bogoRewardType: string,
    bogoPurchaseAmount: number,
    bogoReceiveAmount: number,
    bogoDiscountAmount: number,
    minPurchaseType: string,
    minPurchaseDollarValue: number,
    minPurchaseQuantityValue: number
}

export interface RewardState {
    subpar: Reward,
    good: Reward,
    perfect: Reward
}