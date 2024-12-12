import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import db from '../db.server'

import { Layout, Page, Card, Button, InlineStack, BlockStack, InlineError, Text, TextField, ChoiceList, Label, Thumbnail, PageActions, Modal } from "@shopify/polaris";

import { useState } from "react"
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { authenticate } from "~/shopify.server";

import { ImageIcon } from "@shopify/polaris-icons";
import { SaveBar } from "@shopify/app-bridge-react";
import { CustomQuestionFormError, ReviewFormQuestion, initialCustomQuestionErrorState, initialQuestionState, SelectedProduct } from "~/types/types";

import { redirect } from "@remix-run/node";

import fetchProductInfo from "~/helpers/fetchProductInfo";
import fetchCollectionInfo from "~/helpers/fetchCollectionInfo";
import updateAnswerChoices from "~/helpers/updateAnswerChoices";

export const action = async ({ request, params } : ActionFunctionArgs) => {
    try {
        const { session } = await authenticate.admin(request)

        const data = await request.json()

        if (data.action === 'delete') {
            await db.reviewFormQuestion.delete({where: {id: Number(params.id), AND: {store: {equals: session.shop}}}})
            return redirect('/app/custom-questions')
        }

        if (params.id === 'new') {
            const answerChoices = [...data.radioAnswerChoices]
            delete data['radioAnswerChoices']
            const question = await db.reviewFormQuestion.create({data: {...data, store: session.shop, radioAnswerChoices: {createMany: {data: answerChoices}}}, include: {radioAnswerChoices: true}})
            return redirect(`/app/question/${question.id}`)
        }

        // update logic
        const question = await db.reviewFormQuestion.findFirst({where: {id: {equals: Number(params.id)}}, include: {radioAnswerChoices: true}})
        
        if (question) {
            const currentAnswerChoices = data.radioAnswerChoices
            const oldAnswerChoices = question.radioAnswerChoices
            const answerChoicesDirty = JSON.stringify(currentAnswerChoices) !== JSON.stringify(oldAnswerChoices)

            if (answerChoicesDirty) {
                await updateAnswerChoices(currentAnswerChoices, oldAnswerChoices, params.id as string)
            }

            delete data['radioAnswerChoices']
            const updatedQuestion = await db.reviewFormQuestion.update({where: {id: Number(params.id)}, data: {...data, store: session.shop}})
            const currentAnswerChoiceSnapshots = await db.answerChoiceSnapshot.findMany({where: {questionId: {equals: Number(params.id)}}})
            if (currentAnswerChoiceSnapshots[0].display.toString() !== updatedQuestion.radioDisplayAnswer[0]) {
                const display = updatedQuestion.radioDisplayAnswer[0] === 'true' ? true : false
                await db.answerChoiceSnapshot.updateMany({where: {questionId: {equals: Number(params.id)}}, data: {display}})
            }
        }
        // const result = await db.reviewFormQuestion.update({where: {id: parseInt(data.id)}, data: dataWithStore})
        return json({message: 'success'}, {status: 200})
    } catch (error) {
        console.log(error)
        return json({message: 'error'}, {status: 400})
    }
}

export const loader = async ({ request, params } : LoaderFunctionArgs) => {

    const { admin, redirect } = await authenticate.admin(request)
    
    try {

        if (params.id === 'new') {

            return json({initialQuestionState, initialProductDataState: [], initialCollectionDataState: []})

        } else {

            const result = await db.reviewFormQuestion.findFirst({where: {id: {equals: parseInt(params.id as any)}}, include: {radioAnswerChoices: true}, omit: {id: true}})

            if (result !== null) {

                const productData = await fetchProductInfo(admin, result.productIds)
                const collectionData = await fetchCollectionInfo(admin, result.collectionIds)

                const initialQuestionState: ReviewFormQuestion = {
                    answerType: result.answerType,
                    productConfiguration: result.productConfiguration,
                    productIds: result.productIds,
                    collectionIds: result.collectionIds,
                    title: result.title,
                    isRequired: result.isRequired,
                    radioAnswerChoices: result.radioAnswerChoices,
                    radioAllowMultipleAnswers: result.radioAllowMultipleAnswers,
                    radioDisplayAnswer: result.radioDisplayAnswer,
                    radioDisplayedAnswerLabel: result.radioDisplayedAnswerLabel
                }    

                return json({initialQuestionState, initialProductDataState: productData, initialCollectionDataState: collectionData})

            } else {

                return redirect('/app/custom-questions')

            }
        } 

    } catch (error) {

        console.error(error)

    }

}

export default function Question() {

    const data = useLoaderData<typeof loader>()

    const [isFormDeleting, setIsFormDeleting] = useState(false)
    
    const [state, setState] = useState(data.initialQuestionState)
    const [cleanState, setCleanState] = useState(data.initialQuestionState)

    const [errors, setErrors] = useState<CustomQuestionFormError>(initialCustomQuestionErrorState)
    
    const [selectedProductsState, setSelectedProductsState]= useState<SelectedProduct[]>(data.initialProductDataState as SelectedProduct[])
    const cleanSelectedProductState = data.initialProductDataState as SelectedProduct[]

    const [selectedCollectionsState, setSelectedCollectionsState]= useState(data.initialCollectionDataState)
    const cleanSelectedCollectionsState = data.initialCollectionDataState
    
    const [isSelectedConfigurationsModalOpen, setIsSelectedConfigurationsModalOpen] = useState(false)

    const isStateDirty = JSON.stringify(state) !== JSON.stringify(cleanState)

    const navigation = useNavigation()

    const submit = useSubmit()

    const selectReviewFormProducts = async () => {
        const products = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
            multiple: true
        })
        if (products) {
            const filteredProducts = products.filter(product => !state.productIds.includes(product.id))
            const productIds = filteredProducts.map(product => product.id)
            setState(prevState => {return {...prevState, productIds: [...state.productIds, ...productIds]}})

            const selectedProductData = filteredProducts.map(product => {
                return {
                    id: product.id,
                    image: product.images.length > 0 ? product.images[0].originalSrc : ImageIcon,
                    title: product.title,
                    variants: product.variants.map(variant => variant.title || '')
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
            setState(prevState => {return {...prevState, collectionIds}})

            const selectedCollectionData = filteredCollections.map(collection => {
                return {
                    id: collection.id,
                    title: collection.title
                }
            })
            setSelectedCollectionsState([...selectedCollectionsState, ...selectedCollectionData])
        } 
    }

    const renderAnswerChoices = () => {
        const markup  = []

        for (let i = 0; i<state.radioAnswerChoices.length; i++) {
            const onChange = (value: string) => {
                const answerChoicesCopy = [...state.radioAnswerChoices]
                answerChoicesCopy[i].value = value
                setState(prevState => {return {...prevState, radioAnswerChoices: answerChoicesCopy}})
            }
            markup.push( <TextField id={`choiceField-${i+1}`} onBlur={() => checkForAnswerChoiceErrors(i)} error={errors[`choiceField-${i+1}`] === true && state.radioAnswerChoices[i].value.trim() === ''} value={state.radioAnswerChoices[i].value} label='' autoComplete="off" onChange={onChange} placeholder={`Enter Answer Choice ${i+1}`} /> )
        }
        const removeAnswerChoice = () => {
            const answerChoicesCopy = [...state.radioAnswerChoices]
            answerChoicesCopy.pop()
            setState(prevState => {return {...prevState, radioAnswerChoices: answerChoicesCopy}})
        }
        const useProductVariantsAsChoices = () => {
            const radioAnswerChoices = selectedProductsState[0].variants.map((variant) => {
                return {
                    value: variant, 
                    display: state.radioDisplayAnswer[0] === 'true' ? true : false,
                    label: state.radioDisplayedAnswerLabel
                }
            })
            setState(prevState => {return {...prevState, radioAnswerChoices}})
        }
        const newAnswerChoice = {
            value: '', 
            display: state.radioDisplayAnswer[0] === 'true' ? true : false,
            label: state.radioDisplayedAnswerLabel
        }
        markup.push(
            <BlockStack gap='100'>
                <InlineStack gap='200'>
                    <Button onClick={() => setState(prevState => {return {...prevState, radioAnswerChoices: [...state.radioAnswerChoices, newAnswerChoice]}})}>Add Choice</Button>
                    <Button disabled={state.radioAnswerChoices.length === 2} onClick={removeAnswerChoice}>Remove Choice</Button>
                    <InlineStack>
                        <Button disabled={state.productIds.length !== 1} onClick={useProductVariantsAsChoices} variant="plain">Use product variants as choices</Button>
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
    
            setState(prevState => {return {...prevState, productIds: updatedProductIds}})
        } else {
            const selectedCollectionsStateCopy = [...selectedCollectionsState]
            const updatedSelectedCollections = selectedCollectionsStateCopy.filter(collection => collection.title !== title)
    
            setSelectedCollectionsState(updatedSelectedCollections)
    
            const updatedCollectionIds = [...state.collectionIds].filter(collectionId => collectionId !== id)
    
            setState(prevState => {return {...prevState, collectionIds: updatedCollectionIds}})
        }
    }

    const revertState = () => {
        setState(cleanState)
        setSelectedProductsState(cleanSelectedProductState)
        setSelectedCollectionsState(cleanSelectedCollectionsState)
        setErrors(initialCustomQuestionErrorState)
    }

    const checkForTextFieldError = (stateKeyName: keyof ReviewFormQuestion) => {

        if (state[stateKeyName]?.toString().trim() === '') {
            setErrors(prevErrors => {return {...prevErrors, [stateKeyName as keyof CustomQuestionFormError]: true}})
            return true
        } else {
            setErrors(prevErrors => {return {...prevErrors, [stateKeyName as keyof CustomQuestionFormError]: false}})
            return false
        }
    }

    const checkForAnswerChoiceErrors = (index: number) => {
        const errorsObject: any = {}
        
        if (state.radioAnswerChoices[index].value.trim() === '') {
            errorsObject[`choiceField-${index+1}`] = true
        } else {
            delete errors[`choiceField-${index+1}`]
        }

        if (Object.keys(errorsObject).length > 0) {
            setErrors(prevErrors => {return {...prevErrors, ...errorsObject, answerChoices: true}})
            return true
        } else {
            let isChoiceFieldErrors = false
            const currentErrorsStateKeys = Object.keys(errors)
            for (let i = 0; i<currentErrorsStateKeys.length; i++) {
                if (currentErrorsStateKeys[i].includes('choiceField')) {
                    isChoiceFieldErrors = true
                    break
                }
            }
            setErrors(prevErrors => {return {...prevErrors, ...errorsObject, answerChoices: isChoiceFieldErrors}})
            return isChoiceFieldErrors
        }
    }

    const validSubmission = () => {
        const newErrorsObject: CustomQuestionFormError = {
            answerChoices: state.answerType[0] === 'radio' && state.radioAnswerChoices.filter(choice => choice.value.trim() === '').length > 0,
            collection: state.productConfiguration[0] === 'collections' && state.collectionIds.length === 0,
            product: state.productConfiguration[0] === 'products' && state.productIds.length === 0,
            radioDisplayedAnswerLabel: state.radioDisplayAnswer[0] === 'true' && state.radioDisplayedAnswerLabel.trim() === '',
            title: !state.title
        }
        if (newErrorsObject.answerChoices) {
            state.radioAnswerChoices.forEach((choice, index) => {
                if (choice.value === '') {
                    newErrorsObject[`choiceField-${index+1}`] = true
                }
            })
        }
        setErrors(newErrorsObject)
        return !Object.values(newErrorsObject).includes(true)
    }

    const saveQuestion = () => {
        if (validSubmission()) {
            submit(JSON.stringify(state), {method: 'POST', encType: 'application/json'})
            setCleanState(state)
        }
    }

    const deleteQuestion = () => {
        submit({action: 'delete'}, {method: 'POST', encType: 'application/json'})
        setIsFormDeleting(true)
    }

    const handleDisplayAnswerValueChange = (value: string[]) => {
        const updatedRadioAnswerChoices = state.radioAnswerChoices.map(answerChoice => {
            return {...answerChoice, display: value[0] === 'true' ? true : false}
        })
        setState(prevState => {return {...prevState, radioDisplayAnswer: value, radioAnswerChoices: updatedRadioAnswerChoices}})
    }

    const handleDisplayedAnswerLabelChange = (value: string) => {
        const updatedRadioAnswerChoice = state.radioAnswerChoices.map(answerChoice => {
            return {...answerChoice, label: value}
        })
        setState(prevState => {return {...prevState, radioDisplayedAnswerLabel: value, radioAnswerChoices: updatedRadioAnswerChoice}})
    }

    return (
        <Page
        title={state.id ? 'Edit Question' : 'Create Custom Question'} 
        backAction={{url: '/app/custom-questions'}}
        >
            <SaveBar
            open={isStateDirty}
            >
                <button 
                variant='primary' 
                onClick={saveQuestion} 
                loading={navigation.state === 'submitting' ? 'true' : undefined} />
                <button onClick={revertState} />
            </SaveBar>
            <Modal 
            onClose={() => setIsSelectedConfigurationsModalOpen(false)}
            title={`Selected ${state.productConfiguration[0] === 'products' ? 'Products' : 'Collections'}`}
            open={isSelectedConfigurationsModalOpen}
            >
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '10px'}}>
                    {
                        state.productConfiguration[0] === 'collections' ?

                        selectedCollectionsState.length > 0 ?
                
                        selectedCollectionsState.map((collection, index) => {
                            return (
                                <InlineStack key={index} gap={'200'} blockAlign="center">
                                    <Text as="p" variant="headingMd">{collection.title}</Text>
                                    <Button onClick={() => removeSelectedObject(collection.title, collection.id, 'collection')} tone="critical">Remove</Button>
                                </InlineStack>
                            )
                        })   :
                                <Text as="h3" variant="headingMd">You currently have no selected collections</Text>
                        :

                        selectedProductsState.length > 0 ?

                        selectedProductsState.map((product, index) => {
                            return ( 
                                <div key={index} style={{display: 'flex', width: '250px', gap: '20px'}}>      
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
                                {label: 'Select Products', value: 'products', id: 'product', renderChildren(isSelected) {
                                    return isSelected && selectedProductsState.length > 0 &&
                                    <Button onClick={() => setIsSelectedConfigurationsModalOpen(true)}>
                                        View {selectedProductsState.length.toString()} {selectedProductsState.length === 1 ? 'Product' : 'Products'}
                                    </Button>
                                },}, 
                                {label: 'Select Collections', value: 'collections', id: 'collections', renderChildren(isSelected) {
                                    return isSelected && selectedCollectionsState.length > 0 &&
                                    <Button onClick={() => setIsSelectedConfigurationsModalOpen(true)}>
                                        View {selectedCollectionsState.length.toString()} {selectedCollectionsState.length === 1 ? 'Collection' : 'Collections'}
                                    </Button>
                                },}
                            ]}
                            selected={state.productConfiguration}
                            onChange={(value) => setState({...state, productConfiguration: value})}
                            />
                            {errors['collection'] && state.collectionIds.length === 0 && <InlineError message="You must select at least one collection" fieldID="collection" />}
                            {errors['product'] && state.productIds.length === 0 && <InlineError message="You must select at least one product" fieldID="product" />}
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
                                onBlur={() => checkForTextFieldError('title')}
                                error={errors['title'] === true}
                                autoComplete="off"
                                label='' 
                                placeholder="Enter question title" 
                                />
                                { errors['title'] && state.title.trim() === '' && <InlineError message='Title required' fieldID={'questionTitle'} /> }
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
                                    {errors['answerChoices'] === true && state.radioAnswerChoices.filter(choice => choice.value === '').length > 0 &&
                                     <InlineError fieldID="answerChoices" message="Answer choices must not be blank" />}
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
                                        onChange={handleDisplayAnswerValueChange}
                                        choices={[
                                            {label: 'True', value: 'true', renderChildren(isSelected) {
                                            return isSelected && 
                                            (
                                                <BlockStack gap='050'>
                                                    <TextField 
                                                    label='Answer Label'
                                                    id="radioDisplayedAnswerLabel"
                                                    autoComplete="off"
                                                    onChange={handleDisplayedAnswerLabelChange} 
                                                    onBlur={() => checkForTextFieldError('radioDisplayedAnswerLabel')}
                                                    error={errors['radioDisplayedAnswerLabel'] === true && state.radioDisplayedAnswerLabel.trim() === ''}
                                                    value={state.radioDisplayedAnswerLabel} 
                                                    placeholder="Ex: 'Flavor Purchased'" />
                                                    {errors['radioDisplayedAnswerLabel'] && state.radioDisplayedAnswerLabel.trim() === '' && <InlineError fieldID="radioDisplayedAnswerLabel" message="Answer label must not be blank" />}
                                                </BlockStack>
                                            )
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
                    primaryAction={{content: 'Save', loading: navigation.state === 'submitting' && !isFormDeleting, disabled: !isStateDirty, onAction: saveQuestion}}
                    secondaryActions={[{content: 'Delete', loading: isFormDeleting, disabled: !data.initialQuestionState.hasOwnProperty('id'), onAction: deleteQuestion, destructive: true}]}
                    />
                </Layout.Section>
            </Layout>
        </Page>
    )
}