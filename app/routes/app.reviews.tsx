import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Card, ChoiceList, IndexFilters, IndexFiltersProps, IndexTable, Link, Page, useSetIndexFiltersMode, Modal, Button, BlockStack, InlineStack, Thumbnail, useIndexResourceState, PageActions, EmptyState, Text, Badge, DropZone, IndexTableProps, Banner } from "@shopify/polaris";
import { ImageIcon} from '@shopify/polaris-icons';

import { useCallback, useEffect, useState } from "react";

import { authenticate } from "~/shopify.server";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { json } from "@remix-run/node";
import db from '../db.server'

import { ImportCsvFileState, initialImportCsvFileState, initialReviewTableState, ReviewTableState, sampleReviewData } from "~/types/types";

import styles from '../styles/ImportReviews.module.css'
import updateProductRatingMetafields from "~/helpers/updateProductRatingMetafields";
import fetchProductTitle from "~/helpers/rewards/fetchProductTitle";

export const action = async ({ request } : ActionFunctionArgs) => {

    const { admin, session } = await authenticate.admin(request)

    const data = await request.json()
    const { state, action, nameToUpdate } = data

     if (state) {
        delete state['selectedTab']
    }

    if (action === "disapprove") {
        const deleteMutation = `
        mutation {
            discountCodeDelete(id: "${data.discountId}") {
              userErrors {
                field
                message
              }
            }
          }
        `
        await admin.graphql(deleteMutation)
        return await db.pendingReward.delete({where: {id: data.pendingRewardId}})
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

    if (action === 'publishReviews') {
        const publishedReviews = await Promise.all(data.reviewIds.map(async (id: string) => {
            return await db.productReview.update({where: { id }, data: {isPublished: true}})
        }))

        return await Promise.all(publishedReviews.map(async (review) => {
            return await updateProductRatingMetafields(review.productId, review.rating, admin, session)
        }))
    }

    return true
}

export const loader = async ({ request } : LoaderFunctionArgs) => {
  try {
      const { session } = await authenticate.admin(request)

      const reviews = await db.productReview.findMany({where: {store: {equals: session.shop}}, include: {media: true, pendingReward: true}})
      const updatedReviews = await Promise.all(reviews.map(async (review) => {
          const productTitle: string = await fetchProductTitle(session.shop, review.productId) || 'Product Deleted'
          return {...review, productTitle}
      }))
      const savedTableViews = await db.savedReviewsTableViews.findMany({where: {store: {equals: session.shop}}, omit: {store: true, id: true}})
      return json({reviews: updatedReviews, savedTableViews}, {status: 200})
  } catch (error) {
      console.log(error)
      return json({reviews: [], savedTableViews: []}, {status: 400})
  }
}

export default function Reviews() {
    
    const { reviews, savedTableViews } = useLoaderData<typeof loader>()

    const [indexTableState, setIndexTableState] = useState<ReviewTableState>(initialReviewTableState)
    const [importCsvFileState, setImportCsvFileState] = useState<ImportCsvFileState>(initialImportCsvFileState)
    const [fileData, setFileData] = useState<string | null>('')
    const [pageNumber, setPageNumber] = useState(1)
    
    const submit = useSubmit()
    const navigate = useNavigate()
    const {mode, setMode} = useSetIndexFiltersMode()

    const disapproveReward = (pendingRewardId: string, discountId: string) => {
        submit(JSON.stringify({action: 'disapprove', pendingRewardId, discountId}), {encType: 'application/json', method: 'POST'})
    }

    useEffect(() => {
        let exportCsvAnchor: HTMLAnchorElement
        if (fileData) {
            exportCsvAnchor = document.createElement('a')
            exportCsvAnchor.style.display = 'none'
            exportCsvAnchor.setAttribute('href', fileData)
            exportCsvAnchor.setAttribute('download', 'reviews.csv')
            document.body.appendChild(exportCsvAnchor)
            exportCsvAnchor.click()
            document.body.removeChild(exportCsvAnchor)
        }

        return () => {
            setFileData('')
        }
    }, [fileData])

    let filteredReviews = reviews.sort((a, b) => {
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
        || review.productTitle.toLowerCase().includes(indexTableState.queryValue.toLowerCase()) || review.firstName.toLowerCase().includes(indexTableState.queryValue.toLowerCase()) ||
        review.email.toLowerCase().includes(indexTableState.queryValue.toLowerCase())
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
    }).filter(review => {
        if (indexTableState.selectedVisibility.length > 0) {
            return indexTableState.selectedVisibility.includes(review.isPublished.toString())
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

    const numReviewsToShow = 15
    const numOfReviewPages = Math.ceil(filteredReviews.length / numReviewsToShow)
    filteredReviews = filteredReviews.slice((pageNumber - 1) * numReviewsToShow, pageNumber * numReviewsToShow)

    const pagination: IndexTableProps['pagination'] = {
        hasNext: pageNumber < numOfReviewPages, 
        hasPrevious: pageNumber > 1, 
        onNext: () => setPageNumber(pageNumber + 1),
        onPrevious: () => setPageNumber(pageNumber - 1)
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
                <IndexTable.Cell>{review.email}</IndexTable.Cell>
                <IndexTable.Cell><Text as="p" tone={review.productTitle === 'Product Deleted' ? "critical" : "base"}>{review.productTitle}</Text></IndexTable.Cell>
                <IndexTable.Cell>{review.firstName}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Link url={`/app/review/${review.id}`}>{review.title}</Link>
                </IndexTable.Cell>
                <IndexTable.Cell>{renderReviewBody()}</IndexTable.Cell>
                <IndexTable.Cell>{review.rating}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge tone={review.isPublished ? "success" : "warning"}>{review.isPublished.toString()}</Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>{!review.pendingReward ? 'No Reward' : review.pendingReward.sent ? <Badge tone="success">Auto-Approved</Badge> : 
                    <Button tone="critical" variant="primary" onClick={() => disapproveReward(review.pendingRewardId || "", review.pendingReward?.discountId || "")}>Disapprove</Button>}
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

    const visibilityChoices = [
        {label: 'Published', value: 'true'},
        {label: 'Unpublished', value: 'false'}
    ]

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
            key: 'ratings',
            label: 'Ratings',
            filter: (
                <ChoiceList 
                allowMultiple 
                title='Ratings' 
                titleHidden 
                onChange={(selectedRatings) => setIndexTableState({...indexTableState, selectedRatings})}
                choices={ratingsChoices} 
                selected={indexTableState.selectedRatings} 
                />
            )
        }, {
            key: 'visibility',
            label: 'Visibility',
            filter: (
                <ChoiceList 
                allowMultiple 
                title='Visibility' 
                titleHidden 
                onChange={(selectedVisibility) => setIndexTableState({...indexTableState, selectedVisibility})}
                choices={visibilityChoices} 
                selected={indexTableState.selectedVisibility} 
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
            setIndexTableState(initialReviewTableState)
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

    if (indexTableState.selectedVisibility.length > 0) {
        appliedFilters.push(
            {
                key: 'visibility', 
                label: clarifyLabel('visibility', indexTableState.selectedVisibility), 
                onRemove: () => setIndexTableState({...indexTableState, selectedVisibility: []})
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

    const selectProductFile = async () => {
        const selectedProduct = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
            multiple: false
        })
        if (selectedProduct) {
            setImportCsvFileState({
                ...importCsvFileState, 
                products: [
                    {
                        id: selectedProduct[0].id, 
                        image: selectedProduct[0].images.length > 0 ? selectedProduct[0].images[0].originalSrc : '',
                        title: selectedProduct[0].title
                    }
                ]
            })
        }
    }

    const publishSelectedReviews = useCallback(async () => {
        submit(JSON.stringify({reviewIds: selectedResources, action: 'publishReviews'}), {method: 'POST', encType: 'application/json'})
        removeSelectedResources(selectedResources)
    }, [selectedResources])

    const unpublishSelectedReviews = useCallback(async () => {
        submit(JSON.stringify({reviewIds: selectedResources, action: 'unpublishReviews'}), {method: 'POST', encType: 'application/json'})
        removeSelectedResources(selectedResources)
    }, [selectedResources])

    const deleteSelectedReviews = useCallback(async () => {
        submit(JSON.stringify({reviewIds: selectedResources, action: 'deleteReviews'}), {method: 'POST', encType: 'application/json'})
        removeSelectedResources(selectedResources)
    }, [selectedResources])

    const exportAsCsv = () => {
        const rows = filteredReviews.map(review => [review.email, review.title, review.body, review.firstName, review.rating, new Date(review.date).toLocaleDateString(), review.isPublished, review.media.map(mediaObj => mediaObj.url)])
        const rowHeadings = Object.keys(filteredReviews[0]).filter(key => !['id', 'productTitle', 'productId', 'reviewRequestId', 'store'].includes(key))
        rows.unshift(rowHeadings)
        const encodedReviewData = rows.map(row => row.join()).join('\n')
        setFileData(`data:text/csv;charset=utf-8,${encodedReviewData}`)
    }

    const downloadSampleFile = () => {
        const encodedReviewData = sampleReviewData.map(row => row.join()).join('\n')
        setFileData(`data:text/csv;charset=utf-8,${encodedReviewData}`)
    }

    const importCsvFileReviews = async () => {
        if (importCsvFileState.files.length > 0 && importCsvFileState.products.length > 0) {
            const formData = new FormData()
            formData.append('reviews', importCsvFileState.files[0])
            formData.append('productId', importCsvFileState.products[0].id)

            const response = await fetch('/api/csv/import', {method: 'POST', body: formData})
            const res = await response.json()

            if (res.ok) {
                shopify.toast.show('Reviews successfully imported!', {duration: 3000})
                setImportCsvFileState(initialImportCsvFileState)
                navigate('.', {replace: true})
            } else {
                shopify.toast.show('Error importing reviews', {duration: 3000})
            }
        } else {
            const errors: any = {}
            if (importCsvFileState.products.length === 0) {
                errors.product = true
            } 
            if (importCsvFileState.files.length === 0) {
                errors.file = true
            }
            setImportCsvFileState({...importCsvFileState, errors})
        }
    }

    const handleDrop = (files: File[], acceptedFiles: File[], rejectedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setImportCsvFileState({...importCsvFileState, files: acceptedFiles})
        }
    }
    const fileUpload = importCsvFileState.files.length === 0 && <DropZone.FileUpload />

    return (
        <Page
        title="All Product Reviews"
        primaryAction={{content: 'Import CSV', onAction: () => setImportCsvFileState({...importCsvFileState, importInitiated: true})}}
        secondaryActions={[
            {content: 'Export as CSV', disabled: filteredReviews.length === 0, onAction: exportAsCsv, id: 'exportCsvBtn'},
        ]}
        >
            <BlockStack gap='100'>
                <Banner title="Important Reward Approval Message">
                    If you have rewards configured, after each review is submitted, you will have two days to disapprove the reward being sent (in the case of the review being gibberish or a clear attempt to game the system just to receive the reward), otherwise
                    the reward will be automatically emailed to the customer after that 2 day review period
                </Banner>
                <Modal 
                open={importCsvFileState.importInitiated} 
                title='Import CSV File' 
                onClose={() => setImportCsvFileState(initialImportCsvFileState)}>
                    <div className={styles.container}>
                        <BlockStack gap='200'>
                            <div>
                                <BlockStack gap='200'>
                                    { 
                                    
                                    importCsvFileState.products.length > 0 ?

                                    <InlineStack align="space-between">
                                        <InlineStack blockAlign="center" gap="150">
                                            <Thumbnail alt="product image" source={importCsvFileState.products[0].image || ImageIcon} />
                                            <Text as="h1" variant="bodyMd">{importCsvFileState.products[0].title}</Text>
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
                            {importCsvFileState.errors.product && importCsvFileState.products.length === 0 && <Text as="p" tone="critical">Product is required</Text>}
                            <DropZone 
                            accept="text/csv"
                            onDrop={handleDrop}
                            allowMultiple={false}
                            >
                                <div style={{padding: '10px 5px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <InlineStack 
                                    align="center"   
                                    gap={'500'}
                                    >
                                    {importCsvFileState.files.length > 0 && 
                                    <Text as="p" tone="success">{importCsvFileState.files[0].name}</Text>
                                    }
                                    </InlineStack>
                                    {fileUpload}
                                </div>
                            </DropZone>
                            {importCsvFileState.errors.file && importCsvFileState.files.length === 0 && <Text as="p" tone="critical">File is required</Text>}
                            <InlineStack align="space-between">
                                <Button onClick={downloadSampleFile} variant="plain">Download Sample File</Button>
                                <Button onClick={importCsvFileReviews} variant="primary">Import Reviews</Button>
                            </InlineStack>
                        </BlockStack>
                    </div>
                </Modal>

                {reviews.length === 0 ?
                
                <Card>
                    <EmptyState 
                    action={{content: 'Import Your First Reviews', onAction: () => setImportCsvFileState({...importCsvFileState, importInitiated: true})}}
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
                        pagination={pagination}
                        headings={[{title: 'Email'}, {title: 'Date'}, {title: 'Product'}, {title: 'Name'}, {title: 'Title'}, {title: 'Body'}, {title: 'Rating'}, {title: 'Published'}, {title: 'Reward Status'}]}
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
                primaryAction={{content: 'Publish', disabled: selectedResources.length === 0 || reviews.every(review => review.isPublished === true), onAction: publishSelectedReviews}}
                />
            }
        </Page>
    )
}

const clarifyLabel = (key: string, values: any[]) => {
    if (key === 'ratings') {
        return values.map(value => {
            return `${value} ${value === '1' ? 'star' : 'stars'}`
        }).join(', ')
    }
    if (key === 'visibility') {
        return values.map(value => {
            return value === 'true' ? 'published' : 'unpublished'
        }).join(', ')
    }
    return values.join(', ')
}