import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Card, ChoiceList, IndexFilters, IndexFiltersProps, IndexTable, Link, Page, useSetIndexFiltersMode, Modal, Button, BlockStack, InlineStack, Thumbnail, useIndexResourceState, PageActions, EmptyState, Text, Badge, DropZone } from "@shopify/polaris";

import { useCallback, useEffect, useRef, useState } from "react";

import { authenticate } from "~/shopify.server";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { json } from "@remix-run/node";
import db from '../db.server'

import { importFileReviewsFormState, initialFileImportState, initialReviewTableState, ReviewTableState } from "~/types/types";

import styles from '../styles/ImportReviews.module.css'
import updateProductRatingMetafields from "~/helpers/updateProductRatingMetafields";

export const action = async ({ request } : ActionFunctionArgs) => {

    const { admin, session } = await authenticate.admin(request)

    const data = await request.json()
    const { state, action, nameToUpdate } = data

     if (state) {
        delete state['selectedTab']
    }

    if (action === 'create') {
        return await db.savedReviewsTableViews.create({ data: { ...state, store: session.shop } })
    }

    if (action === 'update') {
        if (nameToUpdate) {
            return await db.savedReviewsTableViews.updateMany({ where: {store: {equals: session.shop}, AND: {name: {equals: nameToUpdate}}}, data : { ...state, store: session.shop } })
        } else {
            return await db.savedReviewsTableViews.updateMany({ where: {store: {equals: session.shop}, AND: {name: {equals: state.name}}}, data : { ...state, store: session.shop } })
        }
    }

    if (action === 'delete') {
        return await db.savedReviewsTableViews.deleteMany({ where: {store: {equals: session.shop}, AND: {name: {equals: data.nameToDelete}}}})
    }

    if (action === 'deleteReviews') {
        return await Promise.all(data.reviewIds.map(async (id: string) => {
            return await db.productReview.delete({where: {id: parseInt(id)}})
        }))
    }

    if (action === 'publishReviews') {
        const publishedReviews = await Promise.all(data.reviewIds.map(async (id: string) => {
            return await db.productReview.update({where: {id: parseInt(id)}, data: {isPublished: true}})
        }))
        return await Promise.all(publishedReviews.map(async (review) => {
            return await updateProductRatingMetafields(review.productId, review.rating, admin, session)
        }))
    }

    if (action === 'unpublishReviews') {
        const unpublishedReviews = await Promise.all(data.reviewIds.map(async (id: string) => {
            return await db.productReview.update({where: {id: parseInt(id)}, data: {isPublished: false}})
        }))
        return await Promise.all(unpublishedReviews.map(async (review) => {
            return await updateProductRatingMetafields(review.productId, 0, admin, session)
        })) 
    }
}

export const loader = async ({ request } : LoaderFunctionArgs) => {

  const { session, admin } = await authenticate.admin(request)

  const reviews = await db.productReview.findMany({where: {store: {equals: session.shop}}})

  const query = `query getProductTitle($id: ID!) {
      product(id: $id) {
        title
    }
  }`

  const updatedReviews = await Promise.all(reviews.map(async (review) => {
      const result = await admin.graphql(query, {variables: {id: review.productId}})
      const productTitle: string = await (await result.json()).data.product?.title || 'Product Deleted'
      return {...review, productTitle}
  }))

  const savedTableViews = await db.savedReviewsTableViews.findMany({where: {store: {equals: session.shop}}, omit: {store: true, id: true}})
  return json({reviews: updatedReviews, savedTableViews})

}

export default function Reviews() {
    
    const { reviews, savedTableViews } = useLoaderData<typeof loader>()

    const [indexTableState, setIndexTableState] = useState<ReviewTableState>(initialReviewTableState)
    const [fileImportState, setFileImportState] = useState<importFileReviewsFormState>(initialFileImportState)
    
    const submit = useSubmit()
    const navigate = useNavigate()
    const {mode, setMode} = useSetIndexFiltersMode()

    const { errors, fileUploaded, isImportingFileReviews, selectedProductDataFile, heading } = fileImportState

    const [isFileReviewFormSubmitting, setIsFileReviewFormSubmitting] = useState(false)

    const [downloadHrefValue, setDownloadHrefValue] = useState('')

    const isFirstRender = useRef(true)

    useEffect(() => {

        if (isFirstRender.current) {
            // isFirstRender.current = false
            return
        }
        
        const exportCsvAnchor = document.createElement('a')
        
        exportCsvAnchor.style.display = 'none'

        exportCsvAnchor.setAttribute('href', downloadHrefValue)
        exportCsvAnchor.setAttribute('download', 'reviews.csv')

        document.body.appendChild(exportCsvAnchor)
        
        exportCsvAnchor.click()

        document.body.removeChild(exportCsvAnchor)

    }, [downloadHrefValue])

    const filteredReviews = reviews.sort((a, b) => {

        if (indexTableState.sortSelected) {

            if (indexTableState.sortSelected[0] === 'date asc') {
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            } else if (indexTableState.sortSelected[0] === 'date desc') {
                return new Date(a.date).getTime() - new Date(b.date).getTime()
            } else if (indexTableState.sortSelected[0] === 'rating asc') {
                return b.rating - a.rating
            } else {
                return a.rating - b.rating
            }
        }

        return 0

    }).filter(review => {

        return new Date(review.date).toLocaleDateString().includes(indexTableState.queryValue) ||
        review.body.toLowerCase().includes(indexTableState.queryValue.toLowerCase()) || review.title.toLowerCase().includes(indexTableState.queryValue.toLowerCase()) 
        || review.productTitle.toLowerCase().includes(indexTableState.queryValue.toLowerCase()) || review.name.toLowerCase().includes(indexTableState.queryValue.toLowerCase())

    }).filter(review => {

        if (indexTableState.selectedProducts.length > 0) {

            return indexTableState.selectedProducts.includes(review.productTitle)

        }

        return review

    }).filter(review => {
        
        if (indexTableState.selectedRatings.length > 0) {

            return indexTableState.selectedRatings.includes(review.rating.toString())

        }

        return review
    })

    const { handleSelectionChange, allResourcesSelected, selectedResources, removeSelectedResources } = useIndexResourceState(filteredReviews)

    const changeTabs = (index: number) => {

        if (index > 0) {
            setIndexTableState({...savedTableViews[index-1], selectedTab: index})
        } else {
            setIndexTableState({...initialReviewTableState})
        }

    }

    const indexTableMarkup = filteredReviews.map((review, index) => {

        const renderReviewBody = () => {

            const truncatedReviewBody = review.body.substring(0, 25)

            if (review.body.trim().length === truncatedReviewBody.length) {
                return review.body.trim()
            } else {
                return `${truncatedReviewBody}...`
            }
        }

        return (
            <IndexTable.Row key={index} selected={selectedResources.includes(review.id.toString())} id={review.id.toString()} position={index}>
                <IndexTable.Cell>{new Date(review.date).toLocaleDateString()}</IndexTable.Cell>
                <IndexTable.Cell><Text as="p" tone={review.productTitle === 'Product Deleted' ? "critical" : "base"}>{review.productTitle}</Text></IndexTable.Cell>
                <IndexTable.Cell>{review.name}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Link url={`/app/review/${review.id}`}>{review.title}</Link>
                </IndexTable.Cell>
                <IndexTable.Cell>{renderReviewBody()}</IndexTable.Cell>
                <IndexTable.Cell>{review.rating}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge tone={review.isPublished ? "success" : "warning"}>{review.isPublished.toString()}</Badge>
                </IndexTable.Cell>
            </IndexTable.Row>
        )
    })

    const sortOptions : IndexFiltersProps['sortOptions'] = [
        {label: 'Date', value: 'date asc', directionLabel: 'Newest',},
        {label: 'Date', value: 'date desc', directionLabel: 'Oldest'},
        {label: 'Rating', value: 'rating asc', directionLabel: 'Highest'},
        {label: 'Rating', value: 'rating desc',  directionLabel: 'Lowest',}
    ]

    const productNames = reviews.map(review => {
        return review.productTitle
    })

    const productNameChoices = productNames.filter((productName, index) => {
        return index === productNames.indexOf(productName)
    }).map(productName => {
        return {label: productName, value: productName}
    })

    const ratings = ['1', '2', '3', '4', '5']
    const ratingsChoices = ratings.map(rating => {
        return {label: `${rating} ${rating === '1' ? 'Star' : 'Stars'}`, value: rating}
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
                onChange={(chosenProducts) => setIndexTableState({...indexTableState, selectedProducts: chosenProducts})} 
                choices={productNameChoices} 
                selected={indexTableState.selectedProducts} /> 
            )
        },
        {
            key: 'ratings',
            label: 'Ratings',
            filter: (
                <ChoiceList 
                allowMultiple 
                title='Ratings' 
                titleHidden 
                onChange={(chosenRatings) => setIndexTableState({...indexTableState, selectedRatings: chosenRatings})}
                choices={ratingsChoices} 
                selected={indexTableState.selectedRatings} 
                />
            )
        }
    ]

    const createNewView = async (name: string) => {
        submit(JSON.stringify({state: { ...indexTableState, name }, action: 'create'}), {method: 'POST', encType: 'application/json'})
        setIndexTableState({...indexTableState, selectedTab: savedTableViews.length + 1})                    
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
        submit(JSON.stringify({nameToDelete: viewNameToDelete, action: 'delete'}), {method: 'POST', encType: 'application/json'})
        setTimeout(() => {
            setIndexTableState({...indexTableState, selectedTab: 0})
        }, 500);
    }

    const tabs: IndexFiltersProps['tabs'] = ['All Reviews', ...savedTableViews.map(view => view.name)].map((tabName, index) => {
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

    const appliedFilters: IndexFiltersProps['appliedFilters'] = []

    if (indexTableState.selectedProducts.length > 0) {
        appliedFilters.push(
            {
                key: 'products', 
                label: clarifyLabel('products', indexTableState.selectedProducts), 
                onRemove: () => setIndexTableState({...indexTableState, selectedProducts: []}) 
            }
        )
    }

    if (indexTableState.selectedRatings.length > 0) {
        appliedFilters.push(
            {
                key: 'ratings', 
                label: clarifyLabel('ratings', indexTableState.selectedRatings), 
                onRemove: () => setIndexTableState({...indexTableState, selectedRatings: []})
            }
        )
    }

    const primaryAction: IndexFiltersProps['primaryAction'] = {
        type: indexTableState.selectedTab === 0 ? "save-as" : "save",
        onAction: indexTableState.selectedTab === 0 ? createNewView : saveView
    }

    const cancelFilterChanges = () => {
        if (indexTableState.selectedTab > 0) {
            setIndexTableState({...savedTableViews[indexTableState.selectedTab - 1], selectedTab: indexTableState.selectedTab})
        } else {
            setIndexTableState(initialReviewTableState)
        }
    }

    const clearAllFilters = () => {
        setIndexTableState({...indexTableState, selectedProducts: [], selectedRatings: []})
    }

    const importFileReviews = useCallback(() => {
        setFileImportState({...fileImportState, isImportingFileReviews: true})
    }, [])

    const selectProductFile = async () => {

        const selectedProduct = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
            multiple: false
        })

        if (selectedProduct) {

            setFileImportState({
                ...fileImportState, 
                selectedProductDataFile: 
                {
                    id: selectedProduct[0].id, 
                    image: selectedProduct[0].images[0].originalSrc,
                    title: selectedProduct[0].title
                }})
        }
    }

    const deleteSelectedReviews = useCallback(async () => {

        submit(JSON.stringify({reviewIds: selectedResources, action: 'deleteReviews'}), {method: 'POST', encType: 'application/json'})
        removeSelectedResources(selectedResources)

    }, [selectedResources])

    const publishSelectedReviews = useCallback(async () => {

        submit(JSON.stringify({reviewIds: selectedResources, action: 'publishReviews'}), {method: 'POST', encType: 'application/json'})
        removeSelectedResources(selectedResources)

    }, [selectedResources])

    const unpublishSelectedReviews = useCallback(async () => {

        submit(JSON.stringify({reviewIds: selectedResources, action: 'unpublishReviews'}), {method: 'POST', encType: 'application/json'})
        removeSelectedResources(selectedResources)

    }, [selectedResources])

    const exportAsCsv = () => {

        const rows = filteredReviews.map(review => {

            const { title, body, name, email, rating, media, date } = review

            return [ title, body, name, email, rating, media, new Date(date).toLocaleDateString() ]

        })

        const rowHeadings = Object.keys(filteredReviews[0]).filter(key => !['id', 'productTitle', 'store'].includes(key))

        rows.unshift(rowHeadings)

        const encodedReviewData = rows.map(row => row.join()).join('\n')

        setDownloadHrefValue(`data:text/csv;charset=utf-8,${encodedReviewData}`)

    }

    const importReviewsFromFile = async () => {

        if (fileImportState.file && fileImportState.selectedProductDataFile) {

            const formData = new FormData()
            formData.append('reviews', fileImportState.file)
            formData.append('productId', fileImportState.selectedProductDataFile.id)

            setIsFileReviewFormSubmitting(true)

            const response = await fetch('/api/reviews/admin/import', {method: 'POST', body: formData})

            setIsFileReviewFormSubmitting(false)

            const data = await response.json()

            if (data.success) {

                shopify.toast.show('Reviews successfully imported!', {duration: 3000})
                setFileImportState(initialFileImportState)
                navigate('.', {replace: true})

            } else {

                shopify.toast.show('Error importing reviews', {duration: 3000})

            }
        }
    }

    return (
        <Page
        title="All Product Reviews"
        primaryAction={{content: 'Import CSV', onAction: importFileReviews}}
        secondaryActions={[
            {content: 'Export as CSV', disabled: filteredReviews.length === 0, onAction: exportAsCsv, id: 'exportCsvBtn'},
        ]}
        >
            <BlockStack gap='100'>
                <Modal title='Import CSV File' onClose={() => setFileImportState(initialFileImportState)} open={isImportingFileReviews}>
                    <div className={styles.container}>
                        <BlockStack gap='200'>
                            <div>
                                <BlockStack gap='200'>
                                    { 
                                    
                                    selectedProductDataFile ?

                                    <InlineStack align="space-between">
                                        <InlineStack blockAlign="center" gap="150">
                                            <Thumbnail alt="product image" source={selectedProductDataFile.image} />
                                            <Text as="h1" variant="bodyMd">{selectedProductDataFile.title}</Text>
                                        </InlineStack>
                                        <Button variant="plain" onClick={selectProductFile}>Change Product</Button>
                                    </InlineStack>

                                    :

                                    <InlineStack>
                                        <Button onClick={selectProductFile}>Select Product</Button>
                                    </InlineStack>

                                    }
                                </BlockStack>
                            </div>
                            <DropZone />
                            <Text as="p" variant="bodySm">Please make sure the column headings are ordered as such:</Text>
                            <Text as="p" variant="bodySm" tone="success">Title, Body, Name, Email, Rating, Media, Date</Text>
                            <div style={{width: 'fit-content', marginLeft: 'auto'}}>
                                <Button onClick={importReviewsFromFile} loading={isFileReviewFormSubmitting} variant="primary" disabled={errors || !fileUploaded || !selectedProductDataFile}>Import Reviews</Button>
                            </div>
                        </BlockStack>
                    </div>
                </Modal>

                {reviews.length === 0 ?
                
                <Card>
                    <EmptyState 
                    action={{content: 'Import Your First Reviews', onAction: importFileReviews}}
                    heading="You Don't Have Any Reviews Yet"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    />
                </Card>
                    
                :
                
                <>
                    <Card>
                        <IndexFilters 
                        sortOptions={sortOptions}
                        sortSelected={indexTableState.sortSelected}
                        onSort={(value) => setIndexTableState({...indexTableState, sortSelected: value})}
                        tabs={tabs}
                        onSelect={changeTabs}
                        mode={mode}
                        setMode={setMode}
                        filters={filters}
                        appliedFilters={appliedFilters}
                        onClearAll={clearAllFilters}
                        primaryAction={primaryAction}
                        queryValue={indexTableState.queryValue}
                        onQueryChange={(value) => setIndexTableState({...indexTableState, queryValue: value})}
                        onQueryClear={() => setIndexTableState({...indexTableState, queryValue: ''})}
                        cancelAction={{onAction: cancelFilterChanges}}
                        onCreateNewView={createNewView}
                        selected={indexTableState.selectedTab}
                        />
                        <IndexTable
                        headings={[{title: 'Date'}, {title: 'Product'}, {title: 'Name'}, {title: 'Title'}, {title: 'Body'}, {title: 'Rating'}, {title: 'Published'}]}
                        itemCount={filteredReviews.length}
                        onSelectionChange={handleSelectionChange}
                        selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                        >
                            {indexTableMarkup}
                        </IndexTable>
                    </Card>
                </>
                }
            </BlockStack>
            {
                reviews.length > 0 &&
                <PageActions 
                primaryAction={{content: 'Publish', disabled: selectedResources.length === 0, onAction: publishSelectedReviews}}
                secondaryActions={[
                    {content: 'Delete', destructive: true, disabled: selectedResources.length === 0, onAction: deleteSelectedReviews},
                    {content: 'Unpublish', disabled: selectedResources.length === 0, onAction: unpublishSelectedReviews}
                ]}
                />
            }
        </Page>
    )
}

const clarifyLabel = (key: string, value: any[]) => {

    if (key === 'ratings') {
        return value.map(value => {
            return `${value} ${value === '1' ? 'star' : 'stars'}`
        }).join(', ')
    }

    return value.join(', ')

}