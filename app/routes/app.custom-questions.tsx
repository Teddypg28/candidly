import { ChoiceList, EmptyState, IndexFilters, IndexFiltersProps, IndexTable, Link, Page, PageActions, Text, useIndexResourceState, useSetIndexFiltersMode } from "@shopify/polaris";

import { Card } from "@shopify/polaris"

import { useState } from "react";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react"
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

import { initialCustomQuestionTableState } from "~/types/types";

import db from '../db.server'

export const action = async ({request} : ActionFunctionArgs) => {

    const { session } = await authenticate.admin(request)

    const data = await request.json()

    if (data.action === 'deleteTable') {

        return await db.savedCustomQuestionsTableView.deleteMany({where: {store: {equals: session.shop}, AND: {name: {equals: data.viewNameToDelete}}}})

    }

    if (data.action === 'deleteQuestions') {
        return await Promise.all(data.questionIdsToDelete.map(async (id: string) => {
            return await db.reviewFormQuestion.delete({where: {id: parseInt(id), AND: {store: {equals: session.shop}}}})
        }))
    }

    return true
}

export const loader = async ({request} : LoaderFunctionArgs) => {
    try {

        const { session, admin } = await authenticate.admin(request)

        const questions = await db.reviewFormQuestion.findMany({where: {store: {equals: session.shop}}, omit: {store: true}})

        const query = `query getProductTitle($id: ID!) {
            product(id: $id) {
              title
              }
        }`

        const questionsWithProductTitles = await Promise.all(questions.map(async ({productIds, ...rest}) => {

            const productTitles = await Promise.all(productIds.map(async (id) => {
                const res = await admin.graphql(query, {variables: {id}})
                const data = await res.json()
                return data.data.product?.title || 'Product Deleted'
            }))

            return { productTitles, ...rest }
        }))

        const savedViews = await db.savedCustomQuestionsTableView.findMany({where: {store: {equals: session.shop}}, omit: {store: true}})

        return json(
            {
                questions: questionsWithProductTitles, 
                queryValue: '', 
                selectedTab: 0, 
                sortSelected: ['choices asc'], 
                savedViews
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

    const { questions, savedViews } = questionsState

    const [currentState, setCurrentState] = useState(initialCustomQuestionTableState)

    const clearAll = () => {

        setCurrentState({...currentState, selectedProducts: [], selectedQuestionTypes: []})

    }

    const cancelFilters = () => {

        changeTabs(currentState.selectedTab)

    }

    const { mode, setMode } = useSetIndexFiltersMode()
    const { selectedResources, handleSelectionChange, removeSelectedResources, allResourcesSelected } = useIndexResourceState(questions)

    const indexTableMarkup = questions
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

        const listOfselectedProducts = questionsState.questions.map(question => question.title)

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
                    selected={currentState.selectedQuestionTypes} 
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
                    selected={currentState.selectedProducts}
                    choices={getProductChoices()}
                    />
        }
    ]

    const itemStrings = ['All Questions', ...savedViews.map(view => view.name)]

    const tabs: IndexFiltersProps['tabs'] = ['All Review Requests', ...savedViews.map(view => view.name)].map((tabName, index) => {

        return {
            content: tabName, 
            id: `${tabName}-${index}`,
            actions: index === 0 ? [] :
            [
                {type: 'rename', onPrimaryAction: (newName: string) => renameView(newName, tabName)},
                {type: 'duplicate', onPrimaryAction: createNewView},
                {type: 'delete', onPrimaryAction: deleteView}
            ]
        }

    })

    const changeTabs = (index: number) => {

        if (index > 0) {
            setCurrentState({...savedViews[index-1], selectedTab: index})
        } else {
            setCurrentState(initialCustomQuestionTableState)
        }

    }

    const createNewView = async (name: string) => {
        
        submit(JSON.stringify({state: { ...currentState, name }, action: 'create'}), {method: 'POST', encType: 'application/json'})
        setCurrentState({...currentState, selectedTab: savedViews.length + 1})                    
        return true
    }

    const saveView = async () => {
        submit(JSON.stringify({state: { ...currentState }, action: 'update'}), {method: 'POST', encType: 'application/json'})
        return true
    }

    const renameView = (newName: string, currentName: string) => {
        submit(JSON.stringify({state: { ...currentState, name: newName }, action: 'update', nameToUpdate: currentName}), {method: 'POST', encType: 'application/json'})
    }

    const deleteView = (viewNameToDelete: string) => {
        submit(JSON.stringify({nameToDelete: viewNameToDelete, action: 'delete'}), {method: 'POST', encType: 'application/json'})
        setTimeout(() => {
            setCurrentState({...currentState, selectedTab: 0})
        }, 500);
    }

    const deleteSelectedQuestions = () => {

        submit(JSON.stringify(selectedResources), {method: 'POST', encType: 'application/json'})
        removeSelectedResources(selectedResources)
        
    }

    const primaryAction: IndexFiltersProps['primaryAction'] = {
        type: currentState.selectedTab === 0 ? "save-as" : "save",
        onAction: currentState.selectedTab === 0 ? createNewView : saveView
    }

    const appliedFilters: IndexFiltersProps['appliedFilters'] = []
    if (currentState.selectedProducts.length> 0) {
        appliedFilters.push({
            key: 'product',
            label: currentState.selectedProducts.join(', '),
            onRemove: () => {}
        })
    }

    if (currentState.selectedQuestionTypes.length > 0) {
        appliedFilters.push({
            key: 'type',
            label: currentState.selectedQuestionTypes.join(', '),
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
                sortSelected={currentState.sortSelected}
                onSort={(value) => setCurrentState({...currentState, sortSelected: value})}
                mode={mode}
                setMode={setMode}
                queryValue={currentState.queryValue}
                queryPlaceholder="Search by question title"
                onQueryChange={(value) => setCurrentState({...currentState, queryValue: value})}
                onQueryClear={() => setCurrentState({...currentState, queryValue: ''})}
                onClearAll={clearAll}
                onCreateNewView={createNewView}
                cancelAction={{onAction: cancelFilters}}
                tabs={tabs}
                selected={currentState.selectedTab}
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


