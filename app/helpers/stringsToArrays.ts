export default function stringsToArrays(objectToUpdate: any) {

    const selectedProducts = objectToUpdate.selectedProducts ? [objectToUpdate.selectedProducts] : undefined
    const selectedRatings = objectToUpdate.selectedRatings ? [objectToUpdate.selectedRatings] : undefined
    const sortSelected = [objectToUpdate.sortSelected]

    return {...objectToUpdate, selectedProducts, selectedRatings, sortSelected}

}