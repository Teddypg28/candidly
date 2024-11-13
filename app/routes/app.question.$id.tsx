import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import db from '../db.server'

import { Layout, Page, Card, Button, InlineStack, BlockStack, InlineError, Text, TextField, ChoiceList, Label, Thumbnail, PageActions, Modal, Image } from "@shopify/polaris";

import { useState } from "react"
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { authenticate } from "~/shopify.server";

import { ImageIcon } from "@shopify/polaris-icons";
import { SaveBar } from "@shopify/app-bridge-react";
import { CustomReviewFormQuestionState, initialQuestionState, SelectedProduct } from "~/types/types";
import fetchProductInfo from "~/helpers/fetchProductInfo";
import fetchCollectionInfo from "~/helpers/fetchCollectionInfo";

// export const action = async ({ request, params } : ActionFunctionArgs) => {

//     try {

//         const { session } = await authenticate.admin(request)

//         const data = await request.json()
    
//         const completeData = {...data, store: session.shop}
//         delete completeData['questionId']

//         if (data.action === 'delete') {
    
//             await db.reviewFormQuestion.delete({where: {id: data.id, AND: {store: {equals: session.shop}}}})
//             return redirect('/app/custom-questions')
    
//         }

//         if (params.id === 'new') {

//             console.log(data)

//             if (data.hasOwnProperty('answerChoices')) {
                
//                 const question = await db.reviewFormQuestion.create({data: {...completeData, answerChoices: {create: data.answerChoices}}, omit: {productId: true}})

//                 return redirect(`/app/question/${question.id}`)
//             }

//             const question = await db.reviewFormQuestion.create({data: completeData, omit: {productId: true}})

//             return redirect(`/app/question/${question.id}`)

//         }

// }

export const loader = async ({ request, params } : LoaderFunctionArgs) => {

    const { admin, redirect } = await authenticate.admin(request)
    
    try {

        if (params.id === 'new') {

            return json({initialQuestionState, initialProductDataState: [], initialCollectionDataState: []})

        } else {

            const result = await db.reviewFormQuestion.findFirst({where: {id: {equals: parseInt(params.id as any)}}})
            
            if (result !== null) {

                const productData = await fetchProductInfo(admin, result.productIds)
                const collectionData = await fetchCollectionInfo(admin, result.collectionIds)

                const initialQuestionState: CustomReviewFormQuestionState = {
                    id: result.id,
                    answerType: result.answerType,
                    productConfiguration: result.productConfiguration,
                    productIds: result.productIds,
                    collectionIds: result.collectionIds,
                    title: result.title,
                    isRequired: result.isRequired,
                    radioAnswerChoices: result.radioAnswerChoices,
                    radioAllowMultipleAnswers: result.radioAllowMultipleAnswers,
                    radioDisplayAnswer: result.radioDisplayAnswer,
                    radioDisplayedAnswerLabel: result.radioDisplayedAnswerLabel || undefined
                }    

                return json({initialQuestionState, initialProductDataState: productData, initialCollectionDataState: collectionData})

            } else {

                redirect('/app/custom-questions')

            }
        } 

    } catch (error) {

        console.error(error)

    }

}

export default function Question() {

    const data = useLoaderData<typeof loader>()
    
    const [errors, setErrors] = useState<any>({})

    const [selectedProductsState, setSelectedProductsState]= useState<SelectedProduct[]>(data.initialProductDataState as SelectedProduct[])
    const cleanSelectedProductState = data.initialProductDataState as SelectedProduct[]

    const [selectedCollectionsState, setSelectedCollectionsState]= useState(data.initialCollectionDataState)
    const cleanSelectedCollectionsState = data.initialCollectionDataState

    const [state, setState] = useState(data.initialQuestionState)
    const cleanState = data.initialQuestionState
    
    const [isSelectedProductsModalOpen, setIsSelectedProductsModalOpen] = useState(false)
    const [isSelectedCollectionsModalOpen, setIsSelectedCollectionsModalOpen] = useState(false)

    const isStateDirty = JSON.stringify(state) !== JSON.stringify(cleanState)

    const navigation = useNavigation()

    const isSaving = navigation.state === 'submitting' && navigation.formData?.get('action') !== 'delete'
    const isDeleting = navigation.state === 'submitting' && navigation.formData?.get('action') === 'delete'

    const submit = useSubmit()

    // const saveQuestion = () => {
        
    //     if (isErrors()) return

    //     setCleanState(state)

    //     const { title, label, answerType, productId, answerChoices, id, displayAnswer, answerLabel, allowMultipleAnswers, isRequired } = state

    //     const data: any = {id, productId, title, label, displayAnswer, allowMultipleAnswers, answerLabel, isRequired}

    //     answerType[0] === 'radioBtns' && delete data['label']

    //     if (answerType[0] === 'radioBtns') {

    //         const answerChoicesArray: {title: string | number}[] = []

    //         const choiceKeys = Object.keys(answerChoices)

    //         choiceKeys.forEach(key => {
    //             answerChoicesArray.push({
    //                 title: answerChoices[key]
    //             })
    //         })

    //         data.answerChoices = answerChoicesArray
    //     }

    //     submit(JSON.stringify(data), {method: 'POST', encType: 'application/json'})

    // }

    const selectReviewFormProducts = async () => {
        const products = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
            multiple: true
        })

        if (products) {

            const filteredProducts = products.filter(product => !state.productIds.includes(product.id))

            const productIds = filteredProducts.map(product => product.id)
            setState({...state, productIds: [...state.productIds, ...productIds]})

            const selectedProductData = filteredProducts.map(product => {
                return {
                    id: product.id,
                    image: product.images.length > 0 ? product.images[0].originalSrc : ImageIcon,
                    title: product.title
                }
            })

            setSelectedProductsState([...selectedProductsState, ...selectedProductData])

        } 
    }

    const selectReviewFormCollections = async () => {
        const collections = await window.shopify.resourcePicker({
            type: 'collection',
            action: 'select',
            multiple: true
        })

        if (collections) {

            const filteredCollections = collections.filter(collection => !state.collectionIds.includes(collection.id))

            const collectionIds = filteredCollections.map(collection => collection.id)
            setState({...state, collectionIds})

            const selectedCollectionData = filteredCollections.map(collection => {
                return {
                    id: collection.id,
                    title: collection.title
                }
            })

            setSelectedCollectionsState([...selectedCollectionsState, ...selectedCollectionData])

        } 
    }

    // const useProductVariantsAsChoices = () => {
    //     dispatch({type: 'addVariantsAsOptions', payload: {numOfVariants: state.productVariants?.length}})
    // }

    // const isErrors = () => {

    //     const userInputValues: any = {
    //         product: state.productId, 
    //         title: state.title, 
    //         label: state.label || '', 
    //         answerLabel: state.answerLabel || '',
    //         answerChoices: {...state.answerChoices},
    //         answerType: state.answerType[0]
    //     }

    //     if (userInputValues.answerType === 'textField') {
    //         delete userInputValues['answerChoices']
    //     } 

    //     if (userInputValues.answerType === 'radioBtns') {
    //         delete userInputValues['label']
    //     }

    //     let formErrors: any = {}

    //     const userInputValueKeys = Object.keys(userInputValues)

    //     userInputValueKeys.forEach((key: any) => {

    //         if (key === 'answerChoices') {

    //             const answerChoices = Object.keys(state.answerChoices)

    //             answerChoices.forEach(key => {

    //                 if (userInputValues['answerChoices'][key as keyof typeof userInputValues['answerChoices']].toString().trim() === '') {

    //                     formErrors = {...formErrors, [key]: true}

    //                 }

    //             })

    //             if (answerChoices.length === 1) {

    //                 formErrors = {...formErrors, numOfAnswerChoices: true}

    //             }

    //         } 

    //         else if (userInputValues[key as keyof typeof userInputValues].toString().trim() === '') {

    //                 if (key === 'answerLabel' && !state.displayAnswer) {
    //                     return
    //                 }

    //                 formErrors = {...formErrors, [key]: true}

    //             } 
    //     })

    //     state.answerType[0] === 'radioBtns' && delete formErrors['label']

    //     setErrors(formErrors)
        
    //     const isErrors = Object.keys(formErrors).length > 0

    //     return isErrors

    // }

    const renderAnswerChoices = () => {

        const markup  = []

        for (let i = 0; i<state.radioAnswerChoices.length; i++) {

            const onChange = (value: string) => {

                const answerChoicesCopy = [...state.radioAnswerChoices]
                answerChoicesCopy[i] = value
                setState({...state, radioAnswerChoices: answerChoicesCopy})

            }

            markup.push( (
            <>
                <TextField id={`choiceField-${i+1}`} value={state.radioAnswerChoices[i]} label='' autoComplete="off" onChange={onChange} placeholder={`Enter Answer Choice ${i+1}`} />
                { errors[`choiceField-${i+1}`] && <InlineError message='This field is required' fieldID={`choiceField-${i+1}`} /> }
            </>
        ))}

        const removeAnswerChoice = () => {
            const answerChoicesCopy = [...state.radioAnswerChoices]
            answerChoicesCopy.pop()
            setState({...state, radioAnswerChoices: answerChoicesCopy})
        }

        markup.push(
            <BlockStack gap='100'>
                <InlineStack gap='200'>
                    <Button onClick={() => setState({...state, radioAnswerChoices: [...state.radioAnswerChoices, '']})}>Add Choice</Button>
                    <Button disabled={state.radioAnswerChoices.length === 2} onClick={removeAnswerChoice}>Remove Choice</Button>
                    <InlineStack>
                        <Button disabled={state.productIds.length !== 1} onClick={() => {}} variant="plain">Use product variants as choices</Button>
                    </InlineStack>
                </InlineStack>
            </BlockStack>
        )

        return markup
    }

    const removeSelectedObject = (title: string, id: string, type: 'product' | 'collection') => {

        if (type === 'product') {

            const selectedProductsStateCopy = [...selectedProductsState]
            const updatedSelectedProducts = selectedProductsStateCopy.filter(product => product.title !== title)
    
            setSelectedProductsState(updatedSelectedProducts)
    
            const updatedProductIds = [...state.productIds].filter(productId => productId !== id)
    
            setState({...state, productIds: updatedProductIds})

        } else {

            const selectedCollectionsStateCopy = [...selectedCollectionsState]
            const updatedSelectedCollections = selectedCollectionsStateCopy.filter(collection => collection.title !== title)
    
            setSelectedCollectionsState(updatedSelectedCollections)
    
            const updatedCollectionIds = [...state.collectionIds].filter(collectionId => collectionId !== id)
    
            setState({...state, collectionIds: updatedCollectionIds})

        }

    }

    const revertState = () => {
        setState(cleanState)
        setSelectedProductsState(cleanSelectedProductState)
        setSelectedCollectionsState(cleanSelectedCollectionsState)
    }

    return (
        <Page
        title={state.id ? 'Edit Question' : 'Create Custom Question'} 
        backAction={{url: '/app/custom-questions'}}
        >
            <SaveBar
            open={isStateDirty}
            >
                <button variant='primary' onClick={() => {}} loading={navigation.state === 'submitting' ? 'true' : undefined} />
                <button onClick={revertState} />
            </SaveBar>
            <Modal 
            onClose={() => setIsSelectedCollectionsModalOpen(false)}
            title="Selected Collections"
            open={isSelectedCollectionsModalOpen}
            >
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '10px'}}>
                    {
                        selectedCollectionsState.length > 0 ?
                
                        selectedCollectionsState.map(collection => {
                            return (
                                <InlineStack gap={'200'} blockAlign="center">
                                    <Text as="p" variant="headingMd">{collection.title}</Text>
                                    <Button onClick={() => removeSelectedObject(collection.title, collection.id, 'collection')} tone="critical">Remove</Button>
                                </InlineStack>
                            )
                        })   :
        
                        <Text as="h3" variant="headingMd">You currently have no selected collections</Text>
                    }
                </div>
            </Modal>
            <Modal 
            onClose={() => setIsSelectedProductsModalOpen(false)}
            title="Selected Products"
            open={isSelectedProductsModalOpen}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '10px'}}>
                {selectedProductsState.length > 0 ?
                
                selectedProductsState.map(product => {
                    return ( 
                        <div style={{display: 'flex', width: '250px', gap: '20px'}}>      
                            <Thumbnail alt={product.title} source={product.image} size="medium" />
                            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                <Text as="p" variant="headingMd">{product.title}</Text>
                                <Button onClick={() => removeSelectedObject(product.title, product.id, 'product')} tone="critical">Remove</Button>
                            </div>
                        </div>
                    )
                })   :

                <Text as="h3" variant="headingMd">You currently have no selected products</Text>
                
                }
                </div>
            </Modal>
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap='300'>
                            <InlineStack align="space-between">
                                <Text as="h1" variant="headingLg">Product Configuration</Text>
                                {state.productConfiguration[0] !== 'all' &&
                                <Button
                                variant="plain"
                                onClick={state.productConfiguration[0] === 'collections' ? selectReviewFormCollections : selectReviewFormProducts}
                                >
                                    {state.productConfiguration[0] === 'collections' ? 
                                    `${selectedCollectionsState.length === 0 ? 'Select' : 'Change'} Collections` : 
                                    `${selectedProductsState.length === 0 ? 'Select' : 'Change'} Products`}
                                </Button>
                                }
                            </InlineStack>
                            <ChoiceList 
                            title=''
                            choices={[
                                {label: 'All Products', value: 'all'}, 
                                {label: 'Select Products', value: 'products', renderChildren(isSelected) {
                                    return isSelected && selectedProductsState.length > 0 &&
                                    <Button onClick={() => setIsSelectedProductsModalOpen(true)}>
                                        View {selectedProductsState.length.toString()} {selectedProductsState.length === 1 ? 'Product' : 'Products'}
                                    </Button>
                                },}, 
                                {label: 'Select Collections', value: 'collections', renderChildren(isSelected) {
                                    return isSelected && selectedCollectionsState.length > 0 &&
                                    <Button onClick={() => setIsSelectedCollectionsModalOpen(true)}>
                                        View {selectedCollectionsState.length.toString()} {selectedCollectionsState.length === 1 ? 'Collection' : 'Collections'}
                                    </Button>
                                },}
                            ]}
                            selected={state.productConfiguration}
                            onChange={(value) => setState({...state, productConfiguration: value})}
                            />
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
                                onChange={(value) => setState({...state, title: value})}
                                autoComplete="off"
                                label='' 
                                placeholder="Enter question title" 
                                />
                                { errors['title'] && <InlineError message='Title required' fieldID={'questionTitle'} /> }
                            </BlockStack>
                            <BlockStack>
                                <ChoiceList 
                                selected={state.answerType} 
                                onChange={(value) => setState({...state, answerType: value})}
                                title='Answer Type' 
                                choices={[{label: 'Text Field', value: 'text'}, {label: 'Multiple Choice', value: 'radio'}]} 
                                />
                            </BlockStack>
                            {state.answerType[0] === 'radio' && 
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
                    <Card>
                        <BlockStack gap='200'>
                            <BlockStack>
                                <Text as="h2" variant="headingMd">Answer Settings</Text>
                            </BlockStack>
                            <BlockStack>
                                <BlockStack gap='200'>
                                    <ChoiceList 
                                    selected={state.isRequired} 
                                    onChange={(value) => setState({...state, isRequired: value})}
                                    title='Answer Required' 
                                    choices={[{label: 'True', value: 'true'}, {label: 'False', value: 'false'}]} 
                                    />   
                                    {state.answerType[0] === 'radio' && 
                                    <>
                                        <ChoiceList 
                                        title='Display Answer in Review'
                                        selected={state.radioDisplayAnswer}
                                        onChange={(value) => setState({...state, radioDisplayAnswer: value})}
                                        choices={[
                                            {label: 'True', value: 'true', renderChildren(isSelected) {
                                            return isSelected && 
                                            <TextField 
                                            label=''
                                            autoComplete="off"
                                            onChange={(value) => setState({...state, radioDisplayedAnswerLabel: value})} 
                                            value={state.radioDisplayedAnswerLabel} 
                                            placeholder="Answer Label (Ex: 'Flavor Purchased')" />
                                            },}, 
                                            {label: 'False', value: 'false'}
                                        ]}
                                        />
                                        <ChoiceList 
                                        selected={state.radioAllowMultipleAnswers} 
                                        onChange={(value) => setState({...state, radioAllowMultipleAnswers: value})}
                                        title='Allow Multiple Answers' 
                                        choices={[{label: 'True', value: 'true'}, {label: 'False', value: 'false'}]} 
                                        />
                                    </>
                                    }
                                </BlockStack>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <PageActions
                    primaryAction={{content: 'Save', loading: isSaving ? true : undefined, disabled: !isStateDirty, onAction: () => {}}}
                    secondaryActions={[{content: 'Delete', loading: isDeleting, disabled: !data.initialQuestionState.hasOwnProperty('id'), onAction: () => submit({action: 'delete', id: data.initialQuestionState.id as any}, {method: 'POST', encType: 'application/json'}), destructive: true}]}
                    />
                </Layout.Section>
            </Layout>
        </Page>
    )

}