import { ChoiceList, EmptyState, IndexFilters, IndexFiltersProps, IndexTable, Link, Page, PageActions, Text, useIndexResourceState, useSetIndexFiltersMode } from "@shopify/polaris";

import { Card } from "@shopify/polaris"

import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react"

import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import arraysToStrings from "~/helpers/arraysToStrings";

import db from '../db.server'
import { useRef, useState } from "react";

export const action = async ({request} : ActionFunctionArgs) => {

    const { session } = await authenticate.admin(request)

    const reviewIdsToDelete = await request.json()

    await Promise.all(reviewIdsToDelete.map(async (id: string) => {
        return await db.reviewFormQuestion.delete({where: {id: parseInt(id), AND: {store: {equals: session.shop}}}})
    }))

    return true
}

export const loader = async ({request} : LoaderFunctionArgs) => {
    try {

        const { session, admin } = await authenticate.admin(request)

        const questions = await db.reviewFormQuestion.findMany({where: {store: {equals: session.shop}}, omit: {store: true}})

        const updatedQuestions = await Promise.all(questions.map(async ({productIds, ...rest}) => {

            const query = `query getProductTitle($id: ID!) {
                product(id: $id) {
                  title
                  }
                }`

            const res = await admin.graphql(query, {variables: {id: `gid://shopify/Product/${productId}`}})
            const data = await res.json()

            return { productTitle: data.data.product?.title || 'Product Deleted', ...rest }
        }))

        const savedCustomQuestionTableViews = await db.savedCustomQuestionsTableView.findMany({where: {store: {equals: session.shop}}, omit: {store: true}})

        const savedTableViews = savedCustomQuestionTableViews.map(view => {
            
            const selectedQuestionTypes = view.selectedQuestionTypes?.split(',') || null
            const selectedProducts = view.selectedProducts?.split(',') || null

            return {...view, sortSelected: [view.sortSelected], selectedProducts, selectedQuestionTypes}

        })

        return json(
            {
                questions: updatedQuestions, 
                queryValue: '', 
                selectedTab: 0, 
                sortSelected: ['choices asc'], 
                savedTableViews
            }
        )

    } catch (error) {

        console.error(error)

    }
}

const CustomQuestions = () => {

    const nav = useNavigate()
    const submit = useSubmit()

    const questionsState = useLoaderData<typeof loader>()

    const { questions } = questionsState

    const savedViews = useRef(questionsState.savedTableViews)

    const [currentState, setCurrentState] = useState({
        queryValue: '',
        selectedTab: 0,
        sortSelected: ['choices asc'],
        selectedQuestionTypes: null as string[] | null,
        selectedProducts: null as string[] | null
    })

    const { queryValue, selectedTab, sortSelected, selectedQuestionTypes, selectedProducts } = currentState

    const clearAll = () => {

        setCurrentState({...currentState, selectedProducts: null, selectedQuestionTypes: null})

    }

    const cancelFilters = () => {
        
        changeTabs(selectedTab)

    }

    const filteredQuestions = questions
    .filter(question => {
        return question.title.toLowerCase().includes(currentState.queryValue.toLowerCase())
    })
    .filter(question => {

        if (selectedQuestionTypes?.includes('text field') && selectedQuestionTypes.includes('radio buttons')) {
            return question
        }

        if (selectedQuestionTypes && selectedQuestionTypes[0] === 'text field') {
            return question.answerChoices.length === 0
        }

        if (selectedQuestionTypes && selectedQuestionTypes[0] === 'radio buttons') {
            return question.answerChoices.length > 0
        }

        return []
        
    })
    .filter(question => {
        return selectedProducts !== null ? selectedProducts.includes(question.productTitle) : question
    })
    .sort((a, b) => {
        if (sortSelected[0] === 'choices asc') {
            return a.answerChoices.length - b.answerChoices.length
        }

        return b.answerChoices.length - a.answerChoices.length
    })

    const { mode, setMode } = useSetIndexFiltersMode()
    const { selectedResources, handleSelectionChange, removeSelectedResources, allResourcesSelected } = useIndexResourceState(filteredQuestions)

    const indexTableMarkup = filteredQuestions
    .map((question: any, index: number) => {
        return (
            <IndexTable.Row selected={selectedResources.includes(question.id)} position={index} id={question.id}>
                <IndexTable.Cell><Link url={`/app/question/${question.id}`}>{question.title}</Link></IndexTable.Cell>
                <IndexTable.Cell>{question.answerChoices.length === 0 ? 'Text Field' : 'Radio Buttons'}</IndexTable.Cell>
                <IndexTable.Cell><Text as="p" tone={question.productTitle === 'Product Deleted' ? 'critical' : 'base'}>{question.productTitle}</Text></IndexTable.Cell>
                <IndexTable.Cell>{question.label || null}</IndexTable.Cell>
                <IndexTable.Cell>{question.answerChoices.length}</IndexTable.Cell>
            </IndexTable.Row>
        )
    })

    const getProductChoices = () => {

        const listOfselectedProducts = questionsState.questions.map(question => question.productTitle)

        return listOfselectedProducts
            .filter((name, index) => {
                return listOfselectedProducts.indexOf(name) === index
             })
            .map(name => {
                return {
                    label: name,
                    value: name
                }
            })
    }

    const filters: IndexFiltersProps['filters'] = [
        {
            key: 'type', 
            label: 'Question Type', 
            filter: <ChoiceList 
                    title='Question Type' 
                    titleHidden
                    onChange={(value) => setCurrentState({...currentState, selectedQuestionTypes: value})}
                    selected={selectedQuestionTypes || []} 
                    allowMultiple 
                    choices={[{label: 'Text Field', value: 'text field'}, {label: 'Radio Buttons', value: 'radio buttons'}]} 
                    />
        },
        {
            key: 'product',
            label: 'Product Name',
            filter: <ChoiceList 
                    title='Product Name'
                    titleHidden
                    allowMultiple
                    onChange={value => setCurrentState({...currentState, selectedProducts: value})}
                    selected={selectedProducts || []}
                    choices={getProductChoices()}
                    />
        }
    ]

    const itemStrings = ['All Questions', ...savedViews.current.map(view => view.name)]

    const tabs: IndexFiltersProps['tabs'] = itemStrings.map((string, index) => {

        return {
            content: string,
            id: index.toString(),
            actions: index === 0 ? [] : [

                {type: 'delete', onPrimaryAction: (name: string) => {

                    const viewToDelete = savedViews.current.find(view => view.name === name)

                    const id = viewToDelete?.id

                    submit(JSON.stringify({action: 'delete', id}), {method: 'POST', action: '/api/custom-question-table-views', encType: 'application/json', navigate: false})

                    const updatedViews = savedViews.current.filter(view => view.id !== id)
                    savedViews.current = updatedViews

                    setCurrentState({
                        queryValue: '',
                        selectedTab: 0,
                        sortSelected: ['choices asc'],
                        selectedQuestionTypes: null as string[] | null,
                        selectedProducts: null as string[] | null
                    })

                }},

                {type: 'duplicate', onPrimaryAction: async (name: string) => {

                    return await createNewView(name)

                }},

                {type: 'rename', onPrimaryAction: (name: string) => {

                    const viewToRename = savedViews.current[selectedTab-1]

                    const id = viewToRename.id

                    savedViews.current = savedViews.current.map((view, index) => {
                        if (selectedTab-1 === index) {
                            view.name = name
                        }

                        return view
                    })

                    submit(JSON.stringify({action: 'rename', name, id}), {method: 'POST', encType: 'application/json', action: '/api/custom-question-table-views', navigate: false}) 

                }}
            ]
        }
    })

    const changeTabs = (index: number) => {

        const tabName = itemStrings[index]

        if (tabName === 'All Questions') {
            return setCurrentState({
                queryValue: '',
                selectedTab: index,
                sortSelected: ['choices asc'],
                selectedQuestionTypes: null,
                selectedProducts: null
            })
        }

        const savedViewState = savedViews.current.find(view => view.name === tabName)

        if (savedViewState) {
            
            return setCurrentState({...savedViewState, selectedTab: index})

        }

    }

    const createNewView = async (name: string) => {

        const newViewData = arraysToStrings({name, selectedProducts, selectedQuestionTypes, sortSelected, queryValue}, 'questions')
        
        const res = await fetch('/api/custom-question-table-views', {method: 'POST', body: JSON.stringify(newViewData), headers: {'Content-Type':'application/json'}})
        
        const newView = await res.json()

        savedViews.current = [...savedViews.current, newView]
        setCurrentState({...currentState, selectedTab: itemStrings.length})
        
        return true
    }

    const editAndSaveView = async () => {

        const viewToEditAndSave = savedViews.current[selectedTab-1]
        const id = viewToEditAndSave.id

        const { queryValue, sortSelected, selectedProducts, selectedQuestionTypes } = currentState

        const editedViewData = arraysToStrings({selectedProducts, selectedQuestionTypes, sortSelected, queryValue}, 'questions')
        
        const res = await fetch('/api/custom-question-table-views', {method: 'POST', body: JSON.stringify({action: 'edit', id, updatedData: editedViewData}), headers: {'Content-Type':'application/json'}})

        const updatedView = await res.json()

        savedViews.current = savedViews.current.filter(view => view.id !== id)
        savedViews.current = [...savedViews.current, updatedView]

        return true

    }

    const deleteSelectedQuestions = () => {

        submit(JSON.stringify(selectedResources), {method: 'POST', encType: 'application/json'})
        removeSelectedResources(selectedResources)
        
    }

    const primaryAction: IndexFiltersProps['primaryAction'] = selectedTab === 0 ?
    
    {
        type: 'save-as',
        onAction: (name: string) => createNewView(name)
    }

    :

    {
        type: 'save',
        onAction: editAndSaveView
    }

    const appliedFilters: IndexFiltersProps['appliedFilters'] = []

    if (selectedProducts) {
        appliedFilters.push({
            key: 'product',
            label: selectedProducts.join(', '),
            onRemove: () => {}
        })
    }

    if (selectedQuestionTypes) {
        appliedFilters.push({
            key: 'type',
            label: selectedQuestionTypes.join(', '),
            onRemove: () => {}
        })
    }

  return (
        <Page
        title="Custom Review Form Questions"
        subtitle="Generate any questions that you want to ask customers"
        backAction={{onAction: () => nav('/app')}}
        primaryAction={{content: 'Create New Question', onAction: () => nav('/app/question/new')}}
        >
            {questions.length === 0 ?

            <Card>
                <EmptyState
                action={{content: 'Create Question', onAction: () => nav('/app/question/new')}}
                heading="You Don't Have Any Custom Questions Yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                    <p>Create your first one!</p>
                </EmptyState>
            </Card>

            :
            
            <Card>
                <IndexFilters
                filters={filters}
                sortOptions={[{label: 'Answer Choices', value: 'choices asc', directionLabel: 'Least to Most'}, {label: 'Answer Choices', value: 'choices desc', directionLabel: 'Most to Least'}]}
                sortSelected={sortSelected}
                onSort={(value) => setCurrentState({...currentState, sortSelected: value})}
                mode={mode}
                setMode={setMode}
                queryValue={queryValue}
                queryPlaceholder="Search by question title"
                onQueryChange={(value) => setCurrentState({...currentState, queryValue: value})}
                onQueryClear={() => setCurrentState({...currentState, queryValue: ''})}
                onClearAll={clearAll}
                onCreateNewView={createNewView}
                cancelAction={{onAction: cancelFilters}}
                tabs={tabs}
                selected={selectedTab}
                onSelect={changeTabs}
                primaryAction={primaryAction}
                appliedFilters={appliedFilters}
                />
                <IndexTable
                itemCount={indexTableMarkup.length}
                headings={[{title: 'Title'}, {title: 'Type'}, {title: 'Product'}, {title: 'Label'}, {title: 'Answer Choices'}]}
                selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                onSelectionChange={handleSelectionChange}
                >
                    {indexTableMarkup}
                </IndexTable>
            </Card>
            }
        {questions.length > 0 &&
    
        <PageActions 
        secondaryActions={[{content: 'Delete', destructive: true, disabled: selectedResources.length === 0, onAction: deleteSelectedQuestions}]}
        />

        }
        </Page>
  )
}

export default CustomQuestions


