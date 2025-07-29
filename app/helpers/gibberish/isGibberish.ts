import sampleText from "../gibberish/sampleText"
import commonReviewWords from "./commonReviewWords";
import generateMatrix from "./generateMatrix";

export default function isGibberish(text: string) {
    const matrix = generateMatrix(sampleText)

    const probabilities: number[] = []

    for (let i = 0; i<text.length - 1; i++) {
        if (matrix[text[i].toLowerCase()] && matrix[text[i].toLowerCase()][text[i+1].toLowerCase()]){
            probabilities.push(-Math.log(matrix[text[i].toLowerCase()][text[i+1].toLowerCase()])) 
        } else {
            probabilities.push(20)
        }
    }

    let score = probabilities.reduce((a, b) => a + b, 0) / (text.length - 1)

    const words = text.split(" ")
    const averageWordLength = words.reduce((a, b) => a + b.length, 0) / words.length

    if (averageWordLength > 10 || (words.length > 5 && averageWordLength < 3)) score += 10
    if (words.some(word => commonReviewWords.includes(word))) score -= 20

    if (score > 6) {
        return true
    }

    return false
}