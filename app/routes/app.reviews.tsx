import { LoaderFunctionArgs } from "@remix-run/node";
import { Card, ChoiceList, IndexFilters, IndexFiltersProps, IndexTable, Link, Page, useSetIndexFiltersMode, Modal, Button, BlockStack, InlineStack, Thumbnail, useIndexResourceState, PageActions, EmptyState, Text, Badge } from "@shopify/polaris";

import db from '../db.server'

import styles from '../styles/ImportReviews.module.css'

import { authenticate } from "~/shopify.server";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";

import arraysToStrings from "~/helpers/arraysToStrings";

import { json } from "@remix-run/node";
import { useCallback, useEffect, useRef, useState } from "react";
import { Import3rdPartyReviewsFormState, importFileReviewsFormState, ReviewsTableFilterState, SavedView } from "~/types/types";

export const loader = async ({ request } : LoaderFunctionArgs) => {

  const { session, admin } = await authenticate.admin(request)

  const totalReviews = await db.productReview.findMany({where: {store: {equals: session.shop}}, omit: {productId: true}})
  
  let totalRatingScore = 0

  totalReviews.forEach(review => {
    totalRatingScore += review.rating
  })

  const averageRating = (totalRatingScore / totalReviews.length).toFixed(2)

  const newReviewsToday = totalReviews.filter(review => {

    return review.date.toLocaleDateString() === new Date().toLocaleDateString()

  }).length

  const date = new Date()
  const oneMonthAgo = date.setMonth(date.getMonth() - 1)

  const reviewsPastMonth = totalReviews.filter(review => {

    return new Date(review.date) >= new Date(oneMonthAgo)

  }).length

  let reviews = await db.productReview.findMany({where: {store: {equals: session.shop}}})

  const query = `query getProductTitle($id: ID!) {
      product(id: $id) {
        title
        }
  }`

  const updatedReviews = await Promise.all(reviews.map(async ({productId, id, ...rest}) => {

      const fullProductId = `gid://shopify/Product/${productId}`

      const result = await admin.graphql(query, {variables: {id: fullProductId}})

      const productTitle: string = await (await result.json()).data.product?.title || 'Product Deleted'

      return {productTitle, id: id.toString(), ...rest}
      
  }))

  const savedTableViews = await db.savedReviewsTableViews.findMany({where: {store: {equals: session.shop}}, omit: {store: true}})

  const formattedTableViews = savedTableViews.map(tableView => {

      const splitSelectedProducts = tableView.selectedProducts?.split(',') || []
      const splitSelectedRatings = tableView.selectedRatings?.split(',') || []

      return {...tableView, sortSelected: [tableView.sortSelected], selectedProducts: splitSelectedProducts, selectedRatings: splitSelectedRatings}

  })

  return json({reviews: updatedReviews, savedTableViews: formattedTableViews, totalReviews, newReviewsToday, reviewsPastMonth, averageRating})

}

const clarifyLabel = (key: string, value: any[]) => {

    if (key === 'ratings') {
        return value.map(value => {
            return `${value} ${value === '1' ? 'star' : 'stars'}`
        }).join(', ')
    }

    return value.join(', ')

}

export default function Reviews() {
    
    const { reviews, savedTableViews } = useLoaderData<typeof loader>()

    const submit = useSubmit()
    const navigate = useNavigate()

    const initial3rdPartyImportState = {
        isImporting3rdPartyReviews: false,
        numberOfReviews: 10,
        selectedImportRatings: [],
        productLink: '',
        selectedProductData3rdParty: undefined,
        importFormErrors: {}
    }

    const initialFileImportState = {
        file: undefined,
        errors: false,
        fileUploaded: false,
        isImportingFileReviews: false,
        selectedProductDataFile: undefined,
        heading: 'Import File Here',
    }

    const [fileImportState, setFileImportState] = useState<importFileReviewsFormState>(initialFileImportState)
    const [importReviewsFormState, setImportReviewsFormState] = useState<Import3rdPartyReviewsFormState>(initial3rdPartyImportState)

    const { errors, fileUploaded, isImportingFileReviews, selectedProductDataFile, heading } = fileImportState

    const [isFileReviewFormSubmitting, setIsFileReviewFormSubmitting] = useState(false)

    const [downloadHrefValue, setDownloadHrefValue] = useState('')

    const [reviewsState, setReviewsState] = useState<ReviewsTableFilterState>({
        sortSelected: ['date asc'],
        queryValue: '',
        selected: 0,
        selectedProducts: null as string[] | null,
        selectedRatings: null as string[] | null
    })
    
    const savedViews = useRef<SavedView[]>(savedTableViews)
    const isFirstRender = useRef(true)

    const { queryValue, selected, sortSelected, selectedProducts, selectedRatings } = reviewsState

    const {mode, setMode} = useSetIndexFiltersMode()

    useEffect(() => {

        if (isImportingFileReviews) {

            const importFileReviewsContainer = document.getElementById('importFileReviewsContainer')
    
            let active = () => {}
            let inactive = () => {}
    
            if (importFileReviewsContainer) {
    
                active = () => { importFileReviewsContainer.style.border = '2px dotted darkgray' }
                inactive = () => { importFileReviewsContainer.style.border = '2px dotted lightgray' }
    
            }
    
            if (importFileReviewsContainer) {
    
                importFileReviewsContainer.addEventListener('dragover', active)
                
                importFileReviewsContainer.addEventListener('drop', inactive)
                importFileReviewsContainer.addEventListener('dragleave', inactive)
    
            }
    
            return () => {
        
                importFileReviewsContainer?.removeEventListener('dragover', active)
    
                importFileReviewsContainer?.removeEventListener('drop', inactive)
                importFileReviewsContainer?.removeEventListener('dragleave', inactive)
    
            }

        }

    }, [isImportingFileReviews])

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

        if (sortSelected) {

            if (sortSelected[0] === 'date asc') {
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            } else if (sortSelected[0] === 'date desc') {
                return new Date(a.date).getTime() - new Date(b.date).getTime()
            } else if (sortSelected[0] === 'rating asc') {
                return b.rating - a.rating
            } else {
                return a.rating - b.rating
            }
        }

        return 0

    }).filter(review => {

        return new Date(review.date).toLocaleDateString().includes(queryValue) ||
        review.body.toLowerCase().includes(queryValue.toLowerCase()) || review.title.toLowerCase().includes(queryValue.toLowerCase()) 
        || review.productTitle.toLowerCase().includes(queryValue.toLowerCase()) || review.name.toLowerCase().includes(queryValue.toLowerCase())

    }).filter(review => {

        if (selectedProducts && selectedProducts.length > 0) {

            return selectedProducts.includes(review.productTitle)

        }

        return review

    }).filter(review => {
        
        if (selectedRatings && selectedRatings.length > 0) {

            return selectedRatings.includes(review.rating.toString())

        }

        return review
    })

    const { handleSelectionChange, allResourcesSelected, selectedResources, removeSelectedResources } = useIndexResourceState(filteredReviews)

    const handleNumOfReviewsChange = (value: number) => {
        setImportReviewsFormState({...importReviewsFormState, numberOfReviews: value})
    }

    const updateViewState = (index: number) => {

        const viewName = itemStrings[index]

        if (viewName === 'All Reviews') {
           return setReviewsState({
            queryValue: '', 
            selectedProducts: null, 
            selectedRatings: null, 
            sortSelected: ['date asc'],
            selected: index
        })}

        const viewStateObject = savedViews.current.find(view => view.name === viewName)

        if (viewStateObject) {

           return setReviewsState({...viewStateObject, selected: index})

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
            <IndexTable.Row key={index} selected={selectedResources.includes(review.id)} id={review.id} position={index}>
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
                onChange={(chosenProducts) => setReviewsState({...reviewsState, selectedProducts: chosenProducts})} 
                choices={productNameChoices} 
                selected={selectedProducts || []} /> 
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
                onChange={(chosenRatings) => setReviewsState({...reviewsState, selectedRatings: chosenRatings})}
                choices={ratingsChoices} 
                selected={selectedRatings || []}  />
            )
        }
    ]

    const itemStrings = ['All Reviews', ...savedViews.current.map(table => table.name)]

    const tabs: IndexFiltersProps['tabs'] = itemStrings.map((itemName, index) => {
        return {
            content: itemName,
            id: index.toString(),
            actions: index === 0 ? [] : [

                {type: 'rename', onPrimaryAction: (name: string) => {

                    const viewToRename = savedViews.current[selected-1]

                    const id = viewToRename.id

                    savedViews.current = savedViews.current.map((view, index) => {
                        if (selected-1 === index) {
                            view.name = name
                        }

                        return view
                    })

                    submit(JSON.stringify({action: 'rename', name, id}), {method: 'POST', encType: 'application/json', action: '/api/review-table-views', navigate: false}) 
                }
            },

                {type: 'duplicate', onPrimaryAction: async (name: string) => {

                    return createNewView(name)
                    
                }},

                {type: 'delete', onPrimaryAction: (name: string) => {
                  
                    const viewToDelete = savedViews.current.find(view => view.name === name)

                    const id = viewToDelete?.id

                    submit(JSON.stringify({action: 'delete', id}), {method: 'POST', action: '/api/review-table-views', encType: 'application/json', navigate: false})

                    const updatedViews = savedViews.current.filter(view => view.id !== id)
                    savedViews.current = updatedViews

                    setReviewsState({
                        queryValue: '',
                        selected: 0,
                        sortSelected: ['choices asc'],
                        selectedRatings: null as string[] | null,
                        selectedProducts: null as string[] | null
                    })
                   
                }}
            ]
        }
    })

    const appliedFilters: IndexFiltersProps['appliedFilters'] = []

    if (selectedProducts) {

        appliedFilters.push(
            {
                key: 'products', 
                label: clarifyLabel('products', selectedProducts), 
                onRemove: () => { 
                    setReviewsState({...reviewsState, selectedProducts: []})
                    savedViews.current = savedViews.current.map(view => {
                        return {...view, selectedProducts: []}
                    })
                }
            }
        )
    }

    if (selectedRatings) {
        appliedFilters.push(
            {
                key: 'ratings', 
                label: clarifyLabel('ratings', selectedRatings), 
                onRemove: () => setReviewsState({...reviewsState, selectedRatings: []})
            }
        )
    }

    const createNewView = async (name: string) => {

        const newViewData = {name, sortSelected, queryValue, selectedProducts, selectedRatings}

        const result = await fetch('/api/review-table-views', {method: 'POST', body: JSON.stringify({data: newViewData}), headers: {'Content-Type':'application/json'}})
        
        const data = await result.json()
        
        savedViews.current = [...savedViews.current, data]

        setReviewsState({
            ...reviewsState, 
            selected: itemStrings.length
        })

        return true

    }

    const editAndSaveView = async () => {

        const viewToEditAndSave = savedViews.current[selected-1]
        const id = viewToEditAndSave.id

        const { queryValue, sortSelected, selectedProducts, selectedRatings } = reviewsState

        const editedViewData = arraysToStrings({selectedProducts, selectedRatings, sortSelected, queryValue}, 'reviews')
        
        const res = await fetch('/api/review-table-views', {method: 'POST', body: JSON.stringify({action: 'edit', id, updatedData: editedViewData}), headers: {'Content-Type':'application/json'}})

        const updatedView = await res.json()

        savedViews.current = savedViews.current.filter(view => view.id !== id)
        savedViews.current = [...savedViews.current, updatedView]

        return true

    }

    const primaryAction : IndexFiltersProps['primaryAction'] = 
    
        selected === 0 ?

        {
            type: 'save-as',
            onAction: createNewView
        } 

        :

        {
            type: 'save',
            onAction: () => editAndSaveView()
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

            await fetch('/api/reviews/admin/delete', {body: JSON.stringify({ids: selectedResources}), method: 'POST', headers: {'Content-Type': 'application/json'}})

            removeSelectedResources(selectedResources)

            navigate('.', {replace: true})

        }, [selectedResources])

        const publishSelectedReviews = useCallback(async () => {

            await fetch('/api/reviews/admin/publish', {body: JSON.stringify({ids: selectedResources}), method: 'POST', headers: {'Content-Type': 'application/json'}})

            removeSelectedResources(selectedResources)

            navigate('.', {replace: true})

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

        const handleFileUpload = useCallback((e: any) => {

            const acceptedTypes = ['vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'csv']

            const uploadedFile: any = Array.from(e.target.files)[0]

            if (!acceptedTypes.includes(uploadedFile.type.split('/')[1])) {

                setFileImportState({...fileImportState, heading: 'Invalid File Type', errors: true, fileUploaded: false})

            } else {

                setFileImportState({...fileImportState, file: uploadedFile, heading: uploadedFile.name, errors: false, fileUploaded: true})

            }

        }, [fileImportState])

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
                            <div className={styles.importContainer} id="importFileReviewsContainer">
                                <label className={styles.label} id="importFileReviews">
                                    <Text as="p" variant="bodyMd" tone={fileUploaded && !errors ? 'success' : errors ? 'critical' : 'base'}>{heading}</Text>
                                    <input onChange={handleFileUpload} className={styles.input} id="importFileReviews" type="file" accept=".csv" />
                                </label>
                            </div>
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
                        sortSelected={sortSelected}
                        onSort={value => setReviewsState({...reviewsState, sortSelected: value})}
                        filters={filters}
                        appliedFilters={appliedFilters}
                        mode={mode}
                        setMode={setMode}
                        queryValue={queryValue}
                        queryPlaceholder="Search by name, title, body, product, or date"
                        onQueryChange={(value) => setReviewsState({...reviewsState, queryValue: value})}
                        onQueryClear={() => setReviewsState({...reviewsState, queryValue: ''})}
                        onClearAll={() => setReviewsState({...reviewsState, selectedProducts: [], selectedRatings: []})}
                        cancelAction={{onAction: () => updateViewState(selected)}}
                        primaryAction={primaryAction}
                        tabs={tabs}
                        onCreateNewView={createNewView}
                        onSelect={(index: number) => updateViewState(index)}
                        selected={selected}
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
                    {content: 'Delete', destructive: true, disabled: selectedResources.length === 0, onAction: deleteSelectedReviews}
                ]}
                />
            }
        </Page>
    )
}