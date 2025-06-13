import { ChoiceList, EmptyState, IndexFilters, IndexFiltersProps, IndexTable, Link, Page, PageActions, useIndexResourceState, useSetIndexFiltersMode } from "@shopify/polaris";

import { Card } from "@shopify/polaris"

import { useState } from "react";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react"
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

import { initialCustomQuestionTableState } from "~/types/types";

import db from '../db.server'
import CustomQuestionConfigurationDetails from "~/components/CustomQuestionConfigurationDetails";

export const action = async ({request} : ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request)

    const data = await request.json()
    const { state, action, nameToUpdate } = data

    if (state) {
        delete state['selectedTab']
    }
    if (action === 'update') {
        if (nameToUpdate) {
            await db.savedCustomQuestionTableView.updateMany({ where: {store: {equals: session.shop}, AND: {name: {equals: nameToUpdate}}}, data : { ...state, store: session.shop } })
        } else {
            await db.savedCustomQuestionTableView.updateMany({ where: {store: {equals: session.shop}, AND: {name: {equals: state.name}}}, data : { ...state, store: session.shop } })
        }
    }

    if (action === 'create') return await db.savedCustomQuestionTableView.create({data: {...state, store: session.shop}})

    if (action === 'delete') return await db.savedCustomQuestionTableView.deleteMany({where: {store: {equals: session.shop}, AND: {name: {equals: data.viewNameToDelete}}}})

    if (action === 'deleteQuestions') {
        return await Promise.all(data.questionIdsToDelete.map(async (id: string) => {
            return await db.reviewFormQuestion.delete({where: {id, AND: {store: {equals: session.shop}}}})
        }))
    }
    return true
}

export const loader = async ({request} : LoaderFunctionArgs) => {
    try {
        const { session } = await authenticate.admin(request)

        const questions = await db.reviewFormQuestion.findMany({where: {store: {equals: session.shop}}, include: {radioAnswerChoices: true, textAnswers: true, answerChoiceSnapshots: true}, omit: {store: true}})
        const savedViews = await db.savedCustomQuestionTableView.findMany({where: {store: {equals: session.shop}}, omit: {store: true, id: true}})

        const questionData = await Promise.all(questions.map(async (question) => {
            if (question.answerType[0] === 'radio') {
                const answersObject: {[key: string]: number} = {}
                question.answerChoiceSnapshots.forEach(answerChoice => {
                    if (answersObject[answerChoice.value as keyof typeof answersObject]) {
                        answersObject[answerChoice.value as keyof typeof answersObject] += 1
                    } else {
                        answersObject[answerChoice.value as keyof typeof answersObject] = 1
                    }
                })
                const numAnswers = question.answerChoiceSnapshots.length
                const topAnswer = numAnswers > 0 && question.answerType[0] === 'radio' ? Object.keys(answersObject).reduce((prevValue, currentValue) => 
                    answersObject[currentValue] > answersObject[prevValue] ? currentValue : prevValue
                ) : null
                return {...question, numAnswers, topAnswer}
            } else {
                const numAnswers = question.textAnswers.length
                return {...question, numAnswers, topAnswer: null}
            }
        }))


        return json({ questions: questionData, savedViews })

    } catch (error) {
        console.error(error)
        return json({questions: [], savedViews: []}, {status: 400})
    }
}

const CustomQuestions = () => {

    const nav = useNavigate()
    const submit = useSubmit()

    const questionsState = useLoaderData<typeof loader>()

    const { questions, savedViews } = questionsState

    const [indexTableState, setIndexTableState] = useState(initialCustomQuestionTableState)

    const clearAll = () => setIndexTableState({...indexTableState, selectedProductConfiguration: []})

    const cancelFilters = () => changeTabs(indexTableState.selectedTab)

    const { mode, setMode } = useSetIndexFiltersMode()
    const { selectedResources, handleSelectionChange, removeSelectedResources, allResourcesSelected } = useIndexResourceState(questions)

    const IndexTableMarkup = questions
    .filter(question => {
        return question.title.toLowerCase().includes(indexTableState.queryValue.toLowerCase().trim())
    })
    .filter(question => {
        if (indexTableState.selectedProductConfiguration.includes('all products')) {
            return question.productConfiguration[0] === 'all'
        }
        if (indexTableState.selectedProductConfiguration.includes('select collections')) {
            return question.productConfiguration[0] === 'collections'
        }
        if (indexTableState.selectedProductConfiguration.includes('select products')) {
            return question.productConfiguration[0] === 'products'
        }
        return []
    })
    .sort((a, b) => {
        if (indexTableState.sortSelected) {
            const sortValue = indexTableState.sortSelected[0]
            switch(sortValue) {
                case 'numProducts asc':
                    return a.productIds.length - b.productIds.length
                case 'numProducts desc':
                    return b.productIds.length - a.productIds.length
                case 'numCollections asc':
                    return a.collectionIds.length - b.collectionIds.length
                case 'numCollections desc':
                    return b.collectionIds.length - a.collectionIds.length
                case 'numAnswers asc':
                    return a.numAnswers - b.numAnswers
                case 'numAnswers desc':
                    return b.numAnswers - a.numAnswers
            }
        }
        return 0
    })
    .map((question, index: number) => {
        return (
            <IndexTable.Row key={index} selected={selectedResources.includes(question.id.toString())} position={index} id={question.id.toString()}>
                <IndexTable.Cell>
                    <Link url={`/app/question/${question.id}`}>{question.title}</Link>
                </IndexTable.Cell>
                {/* <IndexTable.Cell>{question.answerType[0] === 'text' ? 'Text Field' : 'Radio Buttons'}</IndexTable.Cell> */}
                <IndexTable.Cell>
                    <CustomQuestionConfigurationDetails question={question} />
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Link url={`/app/customer-answers/${question.answerType[0]}/${question.id}`}>{question.numAnswers} {question.numAnswers === 1 ? 'answer' : 'answers'}</Link>
                </IndexTable.Cell>
                <IndexTable.Cell>{question.topAnswer}</IndexTable.Cell>
            </IndexTable.Row>
        )
    })

    const filters: IndexFiltersProps['filters'] = [
        {
            key: 'productConfiguration', 
            label: 'Product Configuration', 
            filter: <ChoiceList 
                    title='Product Configuration' 
                    titleHidden
                    onChange={(value) => setIndexTableState({...indexTableState, selectedProductConfiguration: value})}
                    selected={indexTableState.selectedProductConfiguration} 
                    allowMultiple 
                    choices={[{label: 'All Products', value: 'all products'}, {label: 'Select Collections', value: 'select collections'}, {label: 'Select Products', value: 'select products'}]} 
                    />
        }
    ]

    const sortOptions: IndexFiltersProps['sortOptions'] = [
        {label: 'Number of Configured Collections', value: 'numCollections asc', directionLabel: 'Least to Most'},
        {label: 'Number of Configured Collections', value: 'numCollections desc', directionLabel: 'Most to Least'},
        {label: 'Number of Configured Products', value: 'numProducts asc', directionLabel: 'Least to Most'},
        {label: 'Number of Configured Products', value: 'numProducts desc', directionLabel: 'Most to Least'},
        {label: 'Number of Customer Answers', value: 'numAnswers asc', directionLabel: 'Least to Most'},
        {label: 'Number of Customer Answers', value: 'numAnswers desc', directionLabel: 'Most to Least'}
    ] 

    const createNewView = async (name: string) => {
        submit(JSON.stringify({state: { ...indexTableState, name }, action: 'create'}), {method: 'POST', encType: 'application/json'})
        setIndexTableState({...indexTableState, selectedTab: savedViews.length + 1})                    
        return true
    }

    const saveView = async () => {
        submit(JSON.stringify({state: { ...indexTableState }, action: 'update'}), {method: 'POST', encType: 'application/json'})
        return true
    }

    const renameView = (newName: string, currentName: string) => {
        submit(JSON.stringify({state: { ...indexTableState, name: newName }, action: 'update', nameToUpdate: currentName}), {method: 'POST', encType: 'application/json'})
    }

    const deleteView = (viewNameToDelete: string) => {
        submit(JSON.stringify({viewNameToDelete, action: 'delete'}), {method: 'POST', encType: 'application/json'})
        setTimeout(() => {
            setIndexTableState(initialCustomQuestionTableState)
        }, 500);
    }

    const deleteSelectedQuestions = () => {
        submit(JSON.stringify({action: 'deleteQuestions', questionIdsToDelete: selectedResources}), {method: 'POST', encType: 'application/json'})
        removeSelectedResources(selectedResources)
    }

    const tabs: IndexFiltersProps['tabs'] = ['All Questions', ...savedViews.map(view => view.name)].map((tabName, index) => {
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
            setIndexTableState({...savedViews[index-1], selectedTab: index})
        } else {
            setIndexTableState(initialCustomQuestionTableState)
        }
    }

    const primaryAction: IndexFiltersProps['primaryAction'] = {
        type: indexTableState.selectedTab === 0 ? "save-as" : "save",
        onAction: indexTableState.selectedTab === 0 ? createNewView : saveView
    }

    const appliedFilters: IndexFiltersProps['appliedFilters'] = []
    if (indexTableState.selectedProductConfiguration.length > 0) {
        appliedFilters.push({
            key: 'productConfiguration',
            label: indexTableState.selectedProductConfiguration.join(', '),
            onRemove: () => setIndexTableState({...indexTableState, selectedProductConfiguration: []})
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
                action={{content: 'Create Your First Question', onAction: () => nav('/app/question/new')}}
                heading="You Don't Have Any Custom Questions Yet!"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                </EmptyState>
            </Card>

            :
            
            <Card>
                <IndexFilters
                filters={filters}
                sortOptions={sortOptions}
                sortSelected={indexTableState.sortSelected}
                onSort={(value) => setIndexTableState({...indexTableState, sortSelected: value})}
                mode={mode}
                setMode={setMode}
                queryValue={indexTableState.queryValue}
                queryPlaceholder="Search by question title"
                onQueryChange={(value) => setIndexTableState({...indexTableState, queryValue: value})}
                onQueryClear={() => setIndexTableState({...indexTableState, queryValue: ''})}
                onClearAll={clearAll}
                onCreateNewView={createNewView}
                cancelAction={{onAction: cancelFilters}}
                tabs={tabs}
                selected={indexTableState.selectedTab}
                onSelect={changeTabs}
                primaryAction={primaryAction}
                appliedFilters={appliedFilters}
                />
                <IndexTable
                itemCount={IndexTableMarkup.length}
                headings={[{title: 'Title'}, {title: 'Configuration'}, {title: 'Number of Customer Answers'}, {title: 'Top Answer'}]}
                selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                onSelectionChange={handleSelectionChange}
                >
                    {IndexTableMarkup}
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