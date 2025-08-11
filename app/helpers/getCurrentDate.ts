export const getCurrentDate = () => {
    const currentDate = new Date()
    const currentUTCHours = currentDate.getUTCHours()
    if (currentUTCHours >= 0 && currentUTCHours < 5) {
        return new Date(currentDate.setDate(currentDate.getDate() - 1))
    } else {
        return currentDate
    }
}