import { Reducer } from "react"

import { ReducerAction, CustomReviewFormQuestionState } from "~/types/types"

export const initialState: CustomReviewFormQuestionState = {
    productTitle: '',
    productId: '',
    productImage: '',
    productVariants: [],
    title: '',
    displayAnswer: false,
    numOfAnswerChoices: 1,
    answerType: [''],
    allowMultipleAnswers: ['no'],
    answerChoices: {[`choiceField-1`]: ''}
}

export const reducer: Reducer<CustomReviewFormQuestionState, ReducerAction> = (state, action) => {

    const { type, payload } = action

    switch (type) {

        case 'toggleAnswerDisplay':

            return {...state, displayAnswer: !state.displayAnswer}

        case 'testIncrement': 

            return {...state, testValue: payload}
        
        case 'productDetails': {

            const {  productId, productTitle, productImage, productVariants } = payload

            return {...state, productId, productTitle, productImage, productVariants}

        }

        case 'title':
            return {...state, title: payload}

        case 'label':
            return {...state, label: payload}

        case 'answerLabel': 
            return {...state, answerLabel: payload}

        case 'setAnswerType':

            return {...state, answerType: payload}

        case 'handleAnswerOptionChange':

            const { id, value } = payload

            return {...state, answerChoices: {...state.answerChoices, [id]: value}}

        case 'setAllowMultipleAnswers':

            return {...state, allowMultipleAnswers: payload}

        case 'addVariantsAsOptions':

            const { numOfVariants } = payload

            const answerOptions: any = {}

            if (state.productVariants) {
                for (let i = 0; i < numOfVariants; i++) {
                    answerOptions[`choiceField-${i+1}`] = state.productVariants[i].title
                }
            }

            return {...state, answerChoices: {...answerOptions}, numOfAnswerChoices: numOfVariants}

        case 'addAnswerOption':
            
            return {...state, answerChoices: {...state.answerChoices, [`choiceField-${state.numOfAnswerChoices + 1}`]: ''}, numOfAnswerChoices: state.numOfAnswerChoices + 1}
        
        case 'removeAnswerOption':

            delete state.answerChoices[`choiceField-${state.numOfAnswerChoices}`]

            return {
                ...state, 
                answerChoices: {...state.answerChoices}, 
                numOfAnswerChoices: state.numOfAnswerChoices - 1,
            }
        
        case 'setErrors': 

            return {...state, errors: {...payload}}

        case 'revertState':

            return payload

        default:

            return state 

        }
}