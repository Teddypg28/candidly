import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import db from '../db.server'

import { Layout, Page, Card, Button, InlineStack, BlockStack, InlineError, Text, TextField, ChoiceList, Label, Thumbnail, PageActions } from "@shopify/polaris";

import { reducer, initialState } from "~/reducers/AddCustomQuestionReducer"

import { useReducer, useState } from "react"
import { useLoaderData, useNavigation, useSubmit, redirect } from "@remix-run/react";
import { authenticate } from "~/shopify.server";

import { ImageIcon } from "@shopify/polaris-icons";
import { SaveBar } from "@shopify/app-bridge-react";
import { CustomReviewFormQuestionState } from "~/types/types";

export const action = async ({ request, params } : ActionFunctionArgs) => {

    try {

        const { session } = await authenticate.admin(request)

        const data = await request.json()
    
        const completeData = {...data, store: session.shop}
        delete completeData['questionId']

        if (data.action === 'delete') {
    
            await db.reviewFormQuestion.delete({where: {id: data.id, AND: {store: {equals: session.shop}}}})
            return redirect('/app/custom-questions')
    
        }

        if (params.id === 'new') {

            if (data.hasOwnProperty('answerChoices')) {
                
                const question = await db.reviewFormQuestion.create({data: {...completeData, answerChoices: {create: data.answerChoices}}, omit: {productId: true}})

                return redirect(`/app/question/${question.id}`)
            }

            const question = await db.reviewFormQuestion.create({data: completeData, omit: {productId: true}})

            return redirect(`/app/question/${question.id}`)

        }

        const reviewFormQuestion = await db.reviewFormQuestion.findFirst({where: {id: data.questionId, AND: {store: {equals: session.shop}}}, include: {answerChoices: true}})
                
        if (reviewFormQuestion && reviewFormQuestion.answerChoices.length > 0) {

            const answerChoices = reviewFormQuestion.answerChoices

            // Updating DB when answers are removed, added, updated

            const numToAddOrDelete = data.answerChoices.length - answerChoices.length

            const updateChoicesFunctions = []

            if (numToAddOrDelete < 0) {

                for (let i = answerChoices.length - 1; i>data.answerChoices.length - 1; i--) {
                    updateChoicesFunctions.push((async () => { return await db.reviewFormAnswerChoice.delete({where: {id: answerChoices[i].id}})})())
                }

            } else {

                for (let i = data.answerChoices.length - 1; i > answerChoices.length - 1; i--) {
                    updateChoicesFunctions.push((async () => { return await db.reviewFormQuestion.update({where: {id: reviewFormQuestion.id, AND: {store: {equals: session.shop}}}, data:
                      {answerChoices: {create: {title: data.answerChoices[i].title}}}
                    })})()
                    )
                }
            }

            delete completeData['answerChoices']

            updateChoicesFunctions.push((async () => { return await db.reviewFormQuestion.update({where: {id: data.questionId, AND: {store: {equals: session.shop}}}, data: completeData, omit: {productId: true}})})())

            for (let i = 0; i<data.answerChoices.length; i++) {
                updateChoicesFunctions.push((async () => { return await db.reviewFormAnswerChoice.update({where: {id: answerChoices[i].id}, data: data.answerChoices[i]})})())
            }

            return await Promise.all(updateChoicesFunctions)

        }

        const question = await db.reviewFormQuestion.update({where: {id: data.questionId, AND: {store: {equals: session.shop}} }, data: completeData, omit: {productId: true}})

        return question

        
    } catch (error) {

        console.error(error)

        return error
        
    }

}

export const loader = async ({ request, params } : LoaderFunctionArgs) => {

    const { admin, redirect } = await authenticate.admin(request)
    
    try {

        if (params.id === 'new') {

            return initialState

        } else {

            const result = await db.reviewFormQuestion.findFirst({include: {answerChoices: true}, where: {id: {equals: parseInt(params.id as any)}}})
            
            if (result) {

                const getAnswerChoices = () => {
                    if (result.answerChoices.length > 1) {

                        let answerChoices = {}

                        result.answerChoices.forEach((choice, index) => {
                            answerChoices = {...answerChoices, [`choiceField-${index+1}`]: choice.title}
                        })

                        return answerChoices

                    } else {
                        return {'choiceField-1': ''}
                    }
                }

                const query = `query getProductDetails($id: ID!) {
                    product(id: $id) {
                      title
                      featuredImage {
                        url
                      }
                      variants(first: 100) {
                        nodes {
                          title
                        }
                      }
                      }
                    }
                  `

                const fullShopifyProductId = `gid://shopify/Product/${result.productId}`

                const res = await admin.graphql(query, {variables: {id: fullShopifyProductId}})
                const data = await res.json()

                const initalState: CustomReviewFormQuestionState = {
                    id: result.id,
                    productTitle: data.data.product.title || '',
                    productId: result.productId.toString(),
                    productImage: data.data.product.featuredImage.url || '',
                    productVariants: data.data.product.variants.nodes,
                    title: 'TEEEDDDDY',
                    label: result.label || undefined,
                    answerLabel: result.answerLabel || '',
                    displayAnswer: result.displayAnswer,
                    numOfAnswerChoices: result.answerChoices.length === 0 ? 1 : result.answerChoices.length,
                    answerType: result.answerChoices.length > 0 ? ['radioBtns'] : ['textField'],
                    allowMultipleAnswers: result.allowMultipleAnswers === true ? ['yes'] : ['no'],
                    answerChoices: getAnswerChoices(),
                }    

                return json(initalState)

            } else {

                return redirect('/app/custom-questions')

            }
            
        }

    } catch (error) {
        console.error(error)
    }

}

export default function Question() {

    const questionData = useLoaderData<typeof loader>()
        
    const [state, dispatch] = useReducer(reducer, questionData)

    const [errors, setErrors] = useState<any>({})

    const [cleanState, setCleanState] = useState(questionData)

    const isStateDirty = JSON.stringify(state) !== JSON.stringify(cleanState)

    const navigation = useNavigation()

    const isSaving = navigation.state === 'submitting' && navigation.formData?.get('action') !== 'delete'
    const isDeleting = navigation.state === 'submitting' && navigation.formData?.get('action') === 'delete'

    const submit = useSubmit()

    const saveQuestion = () => {
        
        if (isErrors()) return

        setCleanState(state)

        const { title, label, answerType, productId, answerChoices, id, displayAnswer, answerLabel, allowMultipleAnswers } = state

        const slicedProductId = productId.includes('Product/') ? productId.split('Product/')[1] : null

        const data: any = {id, productId: slicedProductId ? parseInt(slicedProductId) : productId, title, label, displayAnswer, answerLabel}

        answerType[0] === 'radioBtns' && delete data['label']

        if (answerType[0] === 'radioBtns') {

            const answerChoicesArray: {title: string | number}[] = []

            const choiceKeys = Object.keys(answerChoices)

            choiceKeys.forEach(key => {
                answerChoicesArray.push({
                    title: answerChoices[key]
                })
            })

            if (allowMultipleAnswers[0] === 'no') {
                data.allowMultipleAnswers = false
            } else {
                data.allowMultipleAnswers = true
            }

            data.answerChoices = answerChoicesArray
        }

        submit(JSON.stringify(data), {method: 'POST', encType: 'application/json'})

    }

    const selectReviewFormProduct = async () => {
        const product = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
            multiple: false
        })

        if (product) {

            dispatch({type: 'productDetails', payload: 
            {
                productId: product[0].id,
                productTitle: product[0].title,
                productImage: product[0].images[0].originalSrc || '',
                productVariants: product[0].variants || ''
            }
        })

        }
    }

    const handleAnswerOptionChange = (value: string, id: string) => {
        dispatch({type: 'handleAnswerOptionChange', payload: {id, value}})
    }

    const useProductVariantsAsChoices = () => {
        dispatch({type: 'addVariantsAsOptions', payload: {numOfVariants: state.productVariants?.length}})
    }


    const handleAddChoice = () => {

        dispatch({type: 'addAnswerOption'})

    }

    const handleRemoveChoice = () => {

        dispatch({type: 'removeAnswerOption'})

    }

    const isErrors = () => {

        const userInputValues: any = {
            product: state.productId, 
            title: state.title, 
            label: state.label || '', 
            answerLabel: state.answerLabel || '',
            answerChoices: {...state.answerChoices},
            answerType: state.answerType[0]
        }

        if (userInputValues.answerType === 'textField') {
            delete userInputValues['answerChoices']
        } 

        if (userInputValues.answerType === 'radioBtns') {
            delete userInputValues['label']
        }

        let formErrors: any = {}

        const userInputValueKeys = Object.keys(userInputValues)

        userInputValueKeys.forEach((key: any) => {

            if (key === 'answerChoices') {

                const answerChoices = Object.keys(state.answerChoices)

                answerChoices.forEach(key => {

                    if (userInputValues['answerChoices'][key as keyof typeof userInputValues['answerChoices']].toString().trim() === '') {

                        formErrors = {...formErrors, [key]: true}

                    }

                })

                if (answerChoices.length === 1) {

                    formErrors = {...formErrors, numOfAnswerChoices: true}

                }

            } 

            else if (userInputValues[key as keyof typeof userInputValues].toString().trim() === '') {

                    if (key === 'answerLabel' && !state.displayAnswer) {
                        return
                    }

                    formErrors = {...formErrors, [key]: true}

                } 
        })

        state.answerType[0] === 'radioBtns' && delete formErrors['label']

        setErrors(formErrors)
        
        const isErrors = Object.keys(formErrors).length > 0

        return isErrors

    }

    const renderAnswerChoices = () => {

        const markup  = []

        for (let i = 0; i<state.numOfAnswerChoices; i++) {

            markup.push( (
            <>
                <TextField id={`choiceField-${i+1}`} value={state.answerChoices[`choiceField-${i+1}`]} label='' autoComplete="off" onChange={(value, id) => handleAnswerOptionChange(value, id)} placeholder={`Enter Answer Choice ${i+1}`} />
                { errors[`choiceField-${i+1}`] && <InlineError message='This field is required' fieldID={`choiceField-${i+1}`} /> }
            </>
        ))}

        markup.push(
            <BlockStack gap='100'>
                <InlineStack gap='200'>
                    <Button onClick={handleAddChoice}>Add Choice</Button>
                    <Button disabled={state.numOfAnswerChoices === 1} onClick={handleRemoveChoice}>Remove Choice</Button>
                    { state.productId && state.productVariants && state.answerType[0] === 'radioBtns' && 
                    <InlineStack>
                        <Button onClick={useProductVariantsAsChoices} variant="plain">Use product variants as choices</Button>
                    </InlineStack>
                    }
                </InlineStack>
                { errors['numOfAnswerChoices'] && <InlineError message='You must include 2 or more answer choices' fieldID="" /> }
            </BlockStack>
        )

        return markup
    }

    return (
        <Page
        title={questionData.productId ? 'Edit Question' : 'Create Custom Question'} 
        backAction={{url: '/app/custom-questions'}}
        >
            <SaveBar
            open={isStateDirty && questionData.productId !== ''}
            >
                <button variant='primary' onClick={saveQuestion} loading={navigation.state === 'submitting' ? 'true' : undefined} />
                <button onClick={() => { dispatch({type: 'revertState', payload: cleanState}); setErrors({}) }} />
            </SaveBar>
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap={'400'}>
                            <InlineStack align="space-between">
                                <Text as="h2" variant="headingLg">Product</Text>
                               {state.productId && <Button onClick={selectReviewFormProduct} variant="plain">Change Product</Button> }
                            </InlineStack>
                            {state.productId ?

                            <InlineStack blockAlign="center" gap={'200'}>
                                <Thumbnail alt="featured product image" source={state.productImage || ImageIcon} />
                                <Text as="span" variant="bodyLg">{state.productTitle}</Text>
                            </InlineStack>
                            
                            :
                            <>
                                <Button onClick={selectReviewFormProduct}>Select Product</Button>
                                { errors['product'] && <InlineError message='You must select a product' fieldID="selectProduct" /> }
                            </>
                            
                            }
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneHalf">
                    <Card>
                        <BlockStack gap={'200'}>
                            <Text as="h2" variant="headingLg">Question Title</Text>
                            <BlockStack gap={'100'}>
                                <TextField 
                                id="questionTitle"
                                value={state.title}
                                onChange={(value) => dispatch({type: 'title', payload: value})}
                                autoComplete="off" 
                                label='' 
                                placeholder="Enter question title" 
                                />
                                { errors['title'] && <InlineError message='Title required' fieldID={'questionTitle'} /> }
                            </BlockStack>
                            {state.answerType[0] === 'textField' && 
                            <BlockStack gap={'150'}>
                                <TextField 
                                id="questionLabel"
                                value={state.label}
                                label="Question Label"
                                placeholder="A short 2-5 word label that relates to the question"
                                autoComplete="off"
                                onChange={(value) => dispatch({type: 'label', payload: value})}
                                />
                                <Text as="p" variant="bodySm">Example: 'Why Choose Us?'</Text>
                                {state.answerType[0] === 'textField' && errors['label'] && <InlineError message='Label required' fieldID={'questionLabel'} /> }
                            </BlockStack> }
                            {state.answerType[0] === 'radioBtns' && 
                            <BlockStack gap={'100'}>
                                <Label id="answerChoices">Answer Choices</Label>
                                <BlockStack gap={'300'}>
                                    {renderAnswerChoices()}
                                </BlockStack>
                            </BlockStack>
                            }
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneThird">
                    <BlockStack gap={'200'}>
                        <Card>
                            <BlockStack gap='200'>
                                <ChoiceList 
                                selected={state.answerType} 
                                onChange={value =>  { dispatch({type: 'setAnswerType', payload: value}); setErrors({}) }}
                                title='Answer Type' 
                                choices={[{label: 'Text Field', value: 'textField'}, {label: 'Radio Buttons', value: 'radioBtns'}]} 
                                />

                                {state.answerType[0] === 'radioBtns' &&
                            
                                    <ChoiceList 
                                    selected={state.allowMultipleAnswers} 
                                    onChange={value => dispatch({type: 'setAllowMultipleAnswers', payload: value})}
                                    title='Allow Multiple Answers?' 
                                    choices={[{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}]} 
                                    />

                                }

                                {errors['answerType'] && <InlineError message='Answer type required' fieldID='' /> }
                            </BlockStack>
                        </Card>
                        {state.answerType[0] === 'radioBtns' && 
                        <Card>
                            <BlockStack gap='200'>
                                <BlockStack gap='200'>
                                    <InlineStack blockAlign="center" gap="200">
                                        <Label id="answerDisplay">Answer Display</Label>
                                        <Button 
                                        variant="primary"
                                        onClick={() => dispatch({type: 'toggleAnswerDisplay'})} 
                                        tone={state.displayAnswer ? 'success' : undefined}>
                                            {state.displayAnswer ? 'Enabled' : 'Enable'}
                                        </Button>
                                    </InlineStack>
                                    <Text as="p" variant="bodySm">Enabling this will display the answer in the review</Text>
                                </BlockStack>
                                <TextField value={state.answerLabel} id="answerLabel" placeholder="Enter an answer label (Ex: 'Size Purchased')" autoComplete="off" label='' onChange={value => dispatch({type: 'answerLabel', payload: value})} />
                                { errors['answerLabel'] && <InlineError message='Answer label required' fieldID={'answerLabel'} /> }
                            </BlockStack>
                        </Card>
                        }
                    </BlockStack>
                </Layout.Section>
                <Layout.Section>
                    <PageActions
                    primaryAction={{content: 'Save', loading: isSaving ? true : undefined, disabled: !isStateDirty, onAction: saveQuestion}}
                    secondaryActions={[{content: 'Delete', loading: isDeleting, disabled: !questionData.hasOwnProperty('id'), onAction: () => submit({action: 'delete', id: questionData.id as any}, {method: 'POST', encType: 'application/json'}), destructive: true}]}
                    />
                </Layout.Section>
            </Layout>
        </Page>
    )

}