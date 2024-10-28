import { IndexFiltersProps } from "@shopify/polaris"
import { SetStateAction } from "react"

export interface CustomReviewFormAnswerOption {
    [key: string]: any
}

export interface ProductVariant {
    title: string
}

export interface CustomReviewFormQuestionState {
    id?: number,
    productTitle: string,
    productId: string,
    productImage: string,
    productVariants?: ProductVariant[],
    title: string,
    label?: string,
    answerLabel?: string,
    displayAnswer: boolean,
    numOfAnswerChoices: number,
    answerType: string[],
    allowMultipleAnswers: boolean,
    isRequired: boolean,
    answerChoices: CustomReviewFormAnswerOption
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
    email: string, 
    date: Date, 
    fulfillmentStatus: string | null, 
    reviewStatus: string, 
    emailsSent: number, 
    product: string, 
    orderId: number, 
    orderName: string
}

export interface AppSettings {
    firstEmailTime: number,
    secondEmailTime: number,
    publishImmediately: string[], 
    minRating: number
}

export interface SettingsPageProps {
    state: AppSettings,
    setState: (value: AppSettings) => void
}