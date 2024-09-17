import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Card, ChoiceList, IndexFilters, IndexFiltersProps, IndexTable, Link, Page, useSetIndexFiltersMode, Modal, TextField, Button, BlockStack, InlineStack, RangeSlider, Form, Thumbnail, useIndexResourceState, PageActions } from "@shopify/polaris";

import db from '../db.server'

import { authenticate } from "~/shopify.server";
import { useLoaderData, useSubmit } from "@remix-run/react";

import { json } from "@remix-run/node";
import { useRef, useState } from "react";
import { ImportReviewsFormState, ReviewsTableFilterState, SavedView } from "~/types/types";

export const action = async ({request} : ActionFunctionArgs) => {

    const { session } = await authenticate.admin(request)

    const reviewIdsToDelete = await request.json()

    await Promise.all(reviewIdsToDelete.map(async (id: string) => {
        return await db.productReview.delete({where: {id: parseInt(id), AND: {store: {equals: session.shop}}}})
    }))

    return true
}

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

      const product = await (await result.json()).data.product.title

      return {product, id: id.toString(), ...rest}
      
  }))

  const savedTableViews = await db.savedReviewsTableViews.findMany({where: {store: {equals: session.shop}}, omit: {store: true}})

  const formattedTableViews = savedTableViews.map(tableView => {

      const splitSelectedProducts = tableView.selectedProducts?.split(',')
      const splitSelectedRatings = tableView.selectedRatings?.split(',')

      return {...tableView, sortSelected: [tableView.sortSelected], selectedProducts: splitSelectedProducts, selectedRatings: splitSelectedRatings}

  })

  return json({reviews: updatedReviews, savedTableViews: formattedTableViews, totalReviews, newReviewsToday, reviewsPastMonth, averageRating})

}

export default function Index() {
    
    const { reviews, savedTableViews } = useLoaderData<typeof loader>()

    const initialState: ReviewsTableFilterState = {
        sortSelected: ['date asc'],
        queryValue: '',
        itemStrings: ['All Reviews', ...savedTableViews.map(table => table.name)],
        selected: 0,
        selectedProducts: undefined,
        selectedRatings: undefined
    }

    const initialImportReviewsState: ImportReviewsFormState = {
        isImportingReviews: false,
        numberOfReviews: 10,
        selectedImportRatings: [],
        productLink: '',
        selectedProductData: undefined,
        importFormErrors: {}
    }

    const [importReviewsFormState, setImportReviewsFormState] = useState(initialImportReviewsState)

    const { isImportingReviews, numberOfReviews, selectedImportRatings, productLink, selectedProductData, importFormErrors } = importReviewsFormState

    const [isFormSubmitting, setIsFormSubmitting] = useState(false)

    const handleNumOfReviewsChange = (value: number) => {
        setImportReviewsFormState({...importReviewsFormState, numberOfReviews: value})
    }

    const [reviewsState, setReviewsState] = useState<ReviewsTableFilterState>(initialState)
    const savedViews = useRef<SavedView[]>(savedTableViews)
    
    const { itemStrings, queryValue, selected, sortSelected, selectedProducts, selectedRatings } = reviewsState
    
    const {mode, setMode} = useSetIndexFiltersMode()

    const submit = useSubmit()

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
        || review.product.toLowerCase().includes(queryValue.toLowerCase()) || review.name.toLowerCase().includes(queryValue.toLowerCase())

    }).filter(review => {

        if (selectedProducts && selectedProducts.length > 0) {

            return selectedProducts.includes(review.product)

        }

        return review

    }).filter(review => {
        
        if (selectedRatings && selectedRatings.length > 0) {

            return selectedRatings.includes(review.rating.toString())

        }

        return review
    })

    const { handleSelectionChange, allResourcesSelected, selectedResources, removeSelectedResources } = useIndexResourceState(filteredReviews)

    const updateViewState = (viewName: string, index: number) => {

        if (viewName === 'All Reviews') {
           return setReviewsState({
            ...reviewsState, 
            queryValue: '', 
            selectedProducts: undefined, 
            selectedRatings: undefined, 
            sortSelected: ['date asc'],
            selected: index
        })}

        const viewStateObject = savedViews.current.find((view: SavedView) => view.name === viewName)

        setReviewsState({
            ...reviewsState, 
            ...viewStateObject,
            selected: index
        })
        
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
            <IndexTable.Row selected={selectedResources.includes(review.id)} id={review.id} position={index}>
                <IndexTable.Cell>{new Date(review.date).toLocaleDateString()}</IndexTable.Cell>
                <IndexTable.Cell>{review.product}</IndexTable.Cell>
                <IndexTable.Cell>{review.name}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Link url={`/app/review/${review.id}`}>{review.title}</Link>
                </IndexTable.Cell>
                <IndexTable.Cell>{renderReviewBody()}</IndexTable.Cell>
                <IndexTable.Cell>{review.rating}</IndexTable.Cell>
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
        return review.product
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
            label: 'Product', 
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

    const tabs: IndexFiltersProps['tabs'] = itemStrings.map((itemName, index) => {
        return {
            content: itemName,
            id: index.toString(),
            actions: index === 0 ? [] : [

                {type: 'rename', onPrimaryAction: (newName: string) => {

                    const updatedStringNames = itemStrings.map((name, innerIndex) => {

                        if (innerIndex === index) {
                            
                            return newName

                        }

                        return name

                    })

                    const updatedViewState = savedViews.current.map((view) => {

                        if (view.name === itemName) {

                            const payload = {...view, name: newName}

                            submit(JSON.stringify({data: payload}), {method: 'POST', encType: 'application/json', action: '/api/review-table-view', navigate: false})

                            return payload

                        }

                        return view

                    })

                    setReviewsState({...reviewsState, itemStrings: updatedStringNames})

                    savedViews.current = updatedViewState

                    }

                },

                {type: 'duplicate', onPrimaryAction: async (nameOfDuplicatedView: string) => {

                    setReviewsState(
                        {
                            ...reviewsState, 
                            itemStrings: [...itemStrings, nameOfDuplicatedView], 
                            selected: itemStrings.length
                        })
                    
                    const newViewPayload = {id: undefined, name: nameOfDuplicatedView, sortSelected, queryValue, selectedProducts, selectedRatings}

                    const result = await fetch('/api/review-table-view', {method: 'POST', body: JSON.stringify({data: newViewPayload}), headers: {'Content-Type':'application/json'}})
                    
                    const updatedView = await result.json()

                    savedViews.current = [...savedViews.current, updatedView]

                    return true
                    
                }},

                {type: 'delete', onPrimaryAction: (viewName: string) => {
                  
                    const viewStateObjectToDelete = savedViews.current.find(view => {
                        return view.name === viewName
                    })

                    if (viewStateObjectToDelete) {

                        const filteredViewState = savedViews.current.filter(view => {
                            return JSON.stringify(view) !== JSON.stringify(viewStateObjectToDelete)
                        })
    
                        const filteredStrings = itemStrings.filter(string => {
                            return string !== viewName
                        })
    
                        setReviewsState({...initialState, itemStrings: filteredStrings})
    
                        savedViews.current = filteredViewState
    
                        submit(JSON.stringify({action: 'delete', data: {id: viewStateObjectToDelete.id, name: viewStateObjectToDelete.name}}), 
                            {method: 'POST', encType: 'application/json', action: '/api/review-table-view', navigate: false})

                    }

                }}
            ]
        }
    })

    const appliedFilters: IndexFiltersProps['appliedFilters'] = []

    const clarifyLabel = (key: string, value: any[]) => {

        if (key === 'ratings') {
            return value.map(value => {
                return `${value} ${value === '1' ? 'star' : 'stars'}`
            }).join(', ')
        }

        return value.join(', ')

    }

    if (selectedProducts) {
        appliedFilters.push(
            {
                key: 'products', 
                label: clarifyLabel('products', selectedProducts), 
                onRemove: () => { 
                    setReviewsState({...reviewsState, selectedProducts: undefined})
                    savedViews.current = savedViews.current.map(view => {
                        return {...view, selectedProducts: undefined}
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
                onRemove: () => setReviewsState({...reviewsState, selectedRatings: undefined})
            }
        )
    }

    const createNewView = async (name: string) => {

        const newViewData = {id: undefined, name, sortSelected, queryValue, selectedProducts, selectedRatings}

        const result = await fetch('/api/review-table-view', {method: 'POST', body: JSON.stringify({data: newViewData}), headers: {'Content-Type':'application/json'}})
        
        const data = await result.json()
        
        savedViews.current = [...savedViews.current, data]

        setReviewsState({
            ...reviewsState, 
            itemStrings: [...itemStrings, name], 
            selected: itemStrings.length,
        })

        return true

    }

    const saveView = async (viewName: string) => {

        const view = savedViews.current.find(view => view.name === viewName)

        if (view) {

            const payload = {
                ...view,
                queryValue,
                sortSelected: sortSelected?.toString(),
                selectedProducts: selectedProducts?.toString(),
                selectedRatings: selectedRatings?.toString()
            }
    
            const updatedSavedViews = savedViews.current.map(view => {
                if (view.name === viewName) {
                    return {
                        ...view,
                        queryValue,
                        sortSelected,
                        selectedProducts,
                        selectedRatings
                    }
                }
    
                return view
            })
    
            savedViews.current = updatedSavedViews
    
            submit(JSON.stringify({data: payload}), {method: 'POST', encType: 'application/json', action: '/api/review-table-view', navigate: false})
    
            return true      

        }

        return false

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
            onAction: () => saveView(itemStrings[selected])
        }
    
        const ratingChoices = ['1', '2', '3', '4', '5'].map(rating => {
            return {label: `${rating} ${rating === '1' ? 'star' : 'stars'}`, value: rating}
        })

        const importReviews = () => {

            setImportReviewsFormState({...importReviewsFormState, isImportingReviews: true})

        }

        const isFormErrors = () => {

            const acceptedDomains = ['amazon.com', 'aliexpress.us', 'walmart.com']

            const errors: any = {}

            if (!selectedProductData) {
                errors.selectProduct = true
            }

            if (productLink.trim() === '') {
                errors.productLink = 'Product link is required'
            } 

            if (productLink.trim() !== '') {

                errors.productLink = 'Amazon, AliExpress, and Walmart are the only supported sites'

                for (let i = 0; i<acceptedDomains.length; i++) {

                    if (productLink.includes(acceptedDomains[i])) {
                        delete errors['productLink']
                        break
                    }
                }
            }

            if (selectedImportRatings.length === 0) {
                errors.ratings = true
            }

            setImportReviewsFormState({...importReviewsFormState, importFormErrors: errors})

            return Object.keys(errors).length > 0

        }

        const verifyReadyToImport = async () => {

            setIsFormSubmitting(true)

            const errors = isFormErrors()

            if (!errors) {

                const id = selectedProductData.id.split('/Product/')[1]

                const payload = { productLink, selectedImportRatings, numberOfReviews, id }

                const response = await fetch('/api/reviews/import', {method: 'POST', body: JSON.stringify(payload)})

                setIsFormSubmitting(false)

                const responseMessage = (await response.json()).message

                if (!response.ok) {

                    return setImportReviewsFormState({...importReviewsFormState, importFormErrors: {productLink: responseMessage}})

                }

                return shopify.toast.show('Import Successful!', {duration: 3000})
                
            } 
        }

        const selectProduct = async () => {
            const selectedProduct = await window.shopify.resourcePicker({
                type: 'product',
                action: 'select',
                multiple: false
            })

            if (selectedProduct) {

                setImportReviewsFormState({...importReviewsFormState, selectedProductData: {id: selectedProduct[0].id, image: selectedProduct[0].images[0].originalSrc}})
    
            }
            
        }

        const deleteSelectedReviews = () => {

            submit(JSON.stringify(selectedResources), {method: 'POST', encType: 'application/json'})
            removeSelectedResources(selectedResources)

        }

    return (
        <Page
        title="All Product Reviews"
        primaryAction={{content: 'Import', onAction: importReviews}}
        secondaryActions={[{content: 'Export', disabled: filteredReviews.length === 0}]}
        >
            <Modal title='Import Reviews' onClose={() => setImportReviewsFormState(initialImportReviewsState)} open={isImportingReviews}>
                <Card>
                    <Form onSubmit={verifyReadyToImport}>
                        <BlockStack gap='300'>
                            { selectedProductData ? 
                            <InlineStack align="space-between">
                                <Thumbnail source={selectedProductData.image} alt="product image thumbnail" /> 
                                <Button variant="plain" onClick={selectProduct}>Change Product</Button>
                            </InlineStack>

                            :

                            <InlineStack>
                                <Button onClick={selectProduct}>Select Product</Button>
                            </InlineStack>

                            }
                            {importFormErrors.selectProduct && <p style={{color: 'red', fontSize: '12px'}}>You must specify a product</p>}
                            <TextField value={productLink} onChange={(value: string) => setImportReviewsFormState({...importReviewsFormState, productLink: value})} autoComplete="off" label='Product Link' placeholder="Enter URL of product here" />
                            {importFormErrors.productLink && <p style={{color: 'red', fontSize: '12px'}}>{importFormErrors.productLink}</p>}
                            <RangeSlider output label='Number of Reviews (Default: 10)' value={numberOfReviews} onChange={handleNumOfReviewsChange} min={1} max={25} />
                            <ChoiceList title='Ratings' onChange={(value: string[]) => setImportReviewsFormState({...importReviewsFormState, selectedImportRatings: value})} selected={selectedImportRatings} allowMultiple choices={ratingChoices} />
                            {importFormErrors.ratings && <p style={{color: 'red', fontSize: '12px'}}>Ratings are required</p>}
                            <InlineStack>
                                <Button submit variant="primary" loading={isFormSubmitting}>Import Reviews</Button>
                            </InlineStack>
                        </BlockStack>
                    </Form>
                </Card>
            </Modal>
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
                onClearAll={() => setReviewsState({...reviewsState, selectedProducts: undefined, selectedRatings: undefined})}
                cancelAction={{onAction: () => updateViewState(itemStrings[selected], selected)}}
                primaryAction={primaryAction}
                tabs={tabs}
                onCreateNewView={createNewView}
                onSelect={(index: number) => updateViewState(itemStrings[index], index)}
                selected={selected}
                />
                <IndexTable
                headings={[{title: 'Date'}, {title: 'Product'}, {title: 'Name'}, {title: 'Title'}, {title: 'Body'}, {title: 'Rating'}]}
                itemCount={filteredReviews.length}
                onSelectionChange={handleSelectionChange}
                selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                >
                    {indexTableMarkup}
                </IndexTable>
            </Card>
            <PageActions 
            secondaryActions={[
                {content: 'Delete', destructive: true, disabled: selectedResources.length === 0, onAction: deleteSelectedReviews}
            ]}
            />
        </Page>
    )
}