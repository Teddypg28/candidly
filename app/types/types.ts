import { IndexFiltersProps } from "@shopify/polaris"

export interface CustomReviewFormAnswerOption {
    [key: string]: any
}

export interface ProductVariant {
    title: string
}

export interface CustomReviewFormQuestionState {
    questionId?: number,
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
    answerChoices: CustomReviewFormAnswerOption
}

export interface ReducerAction {
    type: string,
    payload?: any
}

export interface ReviewsTableFilterState {
    queryValue: string, 
    sortSelected: IndexFiltersProps['sortSelected'], 
    selectedProducts?: string[],
    selectedRatings?: string[],
    selected: number,
    itemStrings: string[]
}

export interface SavedView {
    id?: number,
    name: string, 
    queryValue: string, 
    sortSelected: IndexFiltersProps['sortSelected'], 
    selectedProducts?: string[],
    selectedRatings?: string[]
}