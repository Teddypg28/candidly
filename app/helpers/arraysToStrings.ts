export default function arraysToStrings(objectToUpdate: any, type: string) {

    const selectedProducts = objectToUpdate.selectedProducts ? objectToUpdate.selectedProducts.toString() : null
    const sortSelected = objectToUpdate.sortSelected.toString()

    if (type === 'questions') {

        const selectedQuestionTypes = objectToUpdate.selectedRatings ? objectToUpdate.selectedRatings.toString() : null
    
        return {...objectToUpdate, selectedProducts, selectedQuestionTypes, sortSelected}

    }

    const selectedRatings = objectToUpdate.selectedRatings ? objectToUpdate.selectedRatings.toString() : null

    return {...objectToUpdate, selectedProducts, selectedRatings, sortSelected}


}