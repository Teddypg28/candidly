export default function generateMatrix(sampleText: string) {
    // remove punctuation
    const noPunc = sampleText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'<>[\]\\|]/g, ' ')
    // remove double spaces
    const cleanedString = noPunc.replace(/\s{2,}/g, ' ').toLowerCase();

    const wordCount: {[key:string]: number} = {}
    const matrix: {[key: string]: {[key:string]: number}} = {}

    for (let i = 0; i<cleanedString.length - 1; i++) {
        if (!matrix[cleanedString[i]]) {
            matrix[cleanedString[i]] = {}
        }

        if (!matrix[cleanedString[i]][cleanedString[i+1]]) {
            matrix[cleanedString[i]][cleanedString[i+1]] = 0
        }

        matrix[cleanedString[i]][cleanedString[i+1]]++

        wordCount[cleanedString[i]] = (wordCount[cleanedString[i]] || 0) + 1
    }

    for (const first in matrix) {
        for (const second in matrix[first]) {
            matrix[first][second] = parseFloat((matrix[first][second] / wordCount[first]).toFixed(2))
        }
    }

    return matrix
}