import { IndexFiltersProps } from "@shopify/polaris"

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
    allowMultipleAnswers: string[],
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

export interface ImportReviewsFormState {
    isImportingReviews: boolean,
    numberOfReviews: number,
    selectedImportRatings: string[],
    productLink: any,
    selectedProductData: any | undefined,
    importFormErrors: any
}

export interface SavedView {
    id?: number,
    name: string, 
    queryValue: string, 
    sortSelected: IndexFiltersProps['sortSelected'], 
    selectedProducts: string[],
    selectedRatings: string[]
}