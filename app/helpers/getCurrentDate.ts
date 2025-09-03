export const getCurrentDate = () => {
    const currentDate = new Date()
    const currentUTCHours = currentDate.getUTCHours()
    if (currentUTCHours >= 0 && currentUTCHours < 5) {
        currentDate.setDate(currentDate.getDate() - 1)
    }
    currentDate.setUTCHours(0, 0, 0, 0)
    return currentDate
}