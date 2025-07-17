import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Badge, Button, Card, ChoiceList, EmptyState, IndexFilters, IndexFiltersProps, IndexTable, Link, Page, PageActions, useIndexResourceState, useSetIndexFiltersMode } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

import db from '../db.server'
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { initialQuestionAnswerTableState } from "~/types/types";

export const action = async ({ request } : ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request)

    const data = await request.json()
    const { state, action, nameToUpdate } = data

    if (state) {
        delete state['selectedTab']
    }
    if (action === 'update') {
        if (nameToUpdate) {
            await db.savedQuestionAnswerTableView.updateMany({ where: {store: {equals: session.shop}, AND: {name: {equals: nameToUpdate}}}, data : { ...state, store: session.shop } })
        } else {
            await db.savedQuestionAnswerTableView.updateMany({ where: {store: {equals: session.shop}, AND: {name: {equals: state.name}}}, data : { ...state, store: session.shop } })
        }
    }

    if (action === 'create') return await db.savedQuestionAnswerTableView.create({data: {...state, store: session.shop}})

    if (action === 'delete') return await db.savedQuestionAnswerTableView.deleteMany({where: {store: {equals: session.shop}, AND: {name: {equals: data.viewNameToDelete}}}})

    if (action === 'deleteQuestions') {
        return await Promise.all(data.questionIdsToDelete.map(async (id: string) => {
            return await db.customerQuestion.delete({where: {id, AND: {store: {equals: session.shop}}}})
        }))
    }
    return true
}

export const loader = async ({ request } : LoaderFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request)

    const savedViews = await db.savedQuestionAnswerTableView.findMany({where: {store: {equals: session.shop}}, omit: {store: true, id: true}})

    const questions = await db.customerQuestion.findMany({where: {store: {equals: session.shop}}, include: {answer: true}})

    const questionsWithProductNames = await Promise.all(questions.map(async (question) => {
        const productDataQuery = `
        { 
            product(id: "gid://shopify/Product/${question?.productId}") {
                id
                title
            }
        }`
    
        const res = await admin.graphql(productDataQuery)
        const data = await res.json()

        return {...question, productName: data.data.product.title || "Product Deleted"}
    }))

    return {questions: questionsWithProductNames, savedViews}
}

export default function QuestionAnswers() {

    const data = useLoaderData<typeof loader>()

    const { questions, savedViews } = data

    const { mode, setMode } = useSetIndexFiltersMode()

    const submit = useSubmit()

    const cancelFilters = () => changeTabs(indexTableState.selectedTab)

    const [indexTableState, setIndexTableState] = useState(initialQuestionAnswerTableState)

    const { handleSelectionChange, allResourcesSelected, selectedResources, removeSelectedResources } = useIndexResourceState([])

    const filteredQuestions = questions
        .filter(question => {
            return question.title.toLowerCase().includes(indexTableState.queryValue.toLowerCase()) || 
            question.firstName.toLowerCase().includes(indexTableState.queryValue.toLowerCase())
        })
        .filter(question => {
            if (indexTableState.selectedAnswerStatus.length === 2) {
                return question.answer !== null || question.answer === null
            } else if (indexTableState.selectedAnswerStatus.includes("false")) {
                return question.answer === null
            } else if (indexTableState.selectedAnswerStatus.includes("true")) {
                return question.answer !== null
            }
            return question
        })
        .filter(question => {
            if (indexTableState.selectedProducts.length > 0) {
                return indexTableState.selectedProducts.includes(question.productName)
            }
            return question
        })
        .sort((a, b) => {
            if (indexTableState.sortSelected) {
                if (indexTableState.sortSelected[0] === 'date asc') {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                } else if (indexTableState.sortSelected[0] === 'date desc') {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                }
            }
            return 0
        })

    const indexTableMarkup = filteredQuestions.map((question, index) => {
        const renderQuestion = () => {
            const truncatedQuestion = question.title.substring(0, 35)
            if (question.title.trim().length === truncatedQuestion.length) {
                return question.title.trim()
            } else {
                return `${truncatedQuestion}...`
            }
        }
        return (
            <IndexTable.Row key={index} selected={selectedResources.includes(question.id.toString())} id={question.id.toString()} position={index}>
                <IndexTable.Cell>{new Date(question.createdAt).toLocaleDateString()}</IndexTable.Cell>
                <IndexTable.Cell>{question.firstName}</IndexTable.Cell>
                <IndexTable.Cell>{question.productName}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Link url={`/app/customer-question/${question.id}/answer`}>{renderQuestion()}</Link>
                </IndexTable.Cell>
                <IndexTable.Cell>
                     {question.answer === null ? 
                     <Button variant="primary" url={`/app/customer-question/${question.id}/answer`}>Answer Question</Button> :
                    <Badge tone="success">Answered</Badge>}
                </IndexTable.Cell>
            </IndexTable.Row>
        )
    })

    const productNames = data.questions.map(question => {
        return question.productName
    })

    const productNameChoices = productNames.filter((productName, index) => {
        return index === productNames.indexOf(productName)
    }).map(productName => {
        return {label: productName, value: productName}
    })

    const filters: IndexFiltersProps['filters'] = [
        {
            key: 'products', 
            label: 'Product Name', 
            filter: ( 
                <ChoiceList 
                allowMultiple 
                title='Product' 
                titleHidden 
                onChange={(selectedProducts) => setIndexTableState({...indexTableState, selectedProducts})} 
                choices={productNameChoices} 
                selected={indexTableState.selectedProducts} /> 
            )
        },
        {
            key: 'answerStatus', 
            label: 'Answer Status', 
            filter: (
                <ChoiceList 
                choices={[{label: 'Answered', value: 'true'}, {label: 'Not Answered', value: 'false'}]}
                selected={indexTableState.selectedAnswerStatus}
                onChange={(selectedAnswerStatus) => setIndexTableState({...indexTableState, selectedAnswerStatus})}
                title="Answer Status"
                titleHidden
                allowMultiple
                />
            )
        }
    ]

    const clearAllFilters = () => {
        setIndexTableState({...indexTableState, selectedProducts: [], selectedAnswerStatus: []})
    }

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
            setIndexTableState(initialQuestionAnswerTableState)
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
            setIndexTableState(initialQuestionAnswerTableState)
        }
    }

    const sortOptions : IndexFiltersProps['sortOptions'] = [
        {label: 'Date', value: 'date asc', directionLabel: 'Newest',},
        {label: 'Date', value: 'date desc', directionLabel: 'Oldest'}
    ]

    const primaryAction: IndexFiltersProps['primaryAction'] = {
        type: indexTableState.selectedTab === 0 ? "save-as" : "save",
        onAction: indexTableState.selectedTab === 0 ? createNewView : saveView
    }

    const appliedFilters: IndexFiltersProps['appliedFilters'] = []
    if (indexTableState.selectedAnswerStatus.length > 0) {
        appliedFilters.push({
            key: 'answerStatus',
            label: indexTableState.selectedAnswerStatus.map(val => val === "true" ? "answered" : "not answered").join(", "),
            onRemove: () => setIndexTableState({...indexTableState, selectedAnswerStatus: []})
        })
    }
    if (indexTableState.selectedProducts.length > 0) {
        appliedFilters.push({
            key: 'products',
            label: indexTableState.selectedProducts.join(', '),
            onRemove: () => setIndexTableState({...indexTableState, selectedProducts: []})
        })
    }

    return (
        <Page
        title="Q&A"
        subtitle="Respond to questions from your shoppers"
        >

        {questions.length === 0 ?
                
            <Card>
                <EmptyState 
                heading="There are no questions yet!"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                />
            </Card>

            :
            <Card>
                <IndexFilters 
                appliedFilters={appliedFilters}
                filters={filters}
                mode={mode}
                setMode={setMode}
                onClearAll={clearAllFilters}
                onQueryChange={(queryValue) => setIndexTableState({...indexTableState, queryValue})}
                queryValue={indexTableState.queryValue}
                onQueryClear={() => setIndexTableState({...indexTableState, queryValue: ''})}
                onCreateNewView={createNewView}
                primaryAction={primaryAction}
                cancelAction={{onAction: cancelFilters}}
                sortOptions={sortOptions}
                sortSelected={indexTableState.sortSelected}
                onSort={(value) => setIndexTableState({...indexTableState, sortSelected: value})}
                selected={indexTableState.selectedTab}
                tabs={tabs}
                onSelect={changeTabs}
                />
                <IndexTable
                headings={[{title: 'Date Asked'}, {title: 'Name'}, {title: 'Product'}, {title: 'Question'}, {title: 'Answer Status'}]}
                itemCount={3}
                onSelectionChange={handleSelectionChange}
                selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
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