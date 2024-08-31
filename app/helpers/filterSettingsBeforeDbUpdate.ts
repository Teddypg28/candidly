export default function filterSettingsBeforeDbUpdate(object: any) {
    
    return Object.fromEntries(
        Object.entries(object).filter(entry => !entry[0].includes('id') && !entry[0].includes('isReviewsWidgetDisabled') && !entry[0].includes('isRestockFormDisabled'))
    )

}