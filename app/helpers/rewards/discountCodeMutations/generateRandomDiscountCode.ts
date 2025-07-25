export const generateRandomDiscountCode = () => {
    const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

    const discountCodeTemplate = `XX${Math.floor(Math.random()*9)}X-${Math.floor(Math.random()*9)}XXXXX-${Math.floor(Math.random()*9)}XXXX`

    const discountCode = discountCodeTemplate.replace(/[X]/g, (c) => {
        return alphabet[Math.floor(Math.random() * alphabet.length)]
    })

    return discountCode
}