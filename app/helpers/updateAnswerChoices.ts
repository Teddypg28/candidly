import { RadioAnswerChoice } from '@prisma/client'
import db from '../db.server'

export default async function updateAnswerChoices(currentAnswerChoices: RadioAnswerChoice[], oldAnswerChoices: RadioAnswerChoice[], questionId: string) {

    if (currentAnswerChoices.length === oldAnswerChoices.length) {
        await Promise.all(oldAnswerChoices.map(async (answerChoice, index) => {
            await db.radioAnswerChoice.update({where: {id: answerChoice.id}, data: {...currentAnswerChoices[index]}})
        }))
    } else if (currentAnswerChoices.length > oldAnswerChoices.length) {

        // update current answer choices
        await Promise.all(oldAnswerChoices.map(async (answerChoice, index) => {
            return await db.radioAnswerChoice.update({where: {id: answerChoice.id}, data: {...currentAnswerChoices[index]}})
        }))

        // create new answer choices using remaining data
        const remainingData = currentAnswerChoices.filter((answerChoice, index) => index > oldAnswerChoices.length - 1)
        const remainingDataWithQuestionId = remainingData.map((answerChoice) => {return {...answerChoice, questionId}})
        await db.radioAnswerChoice.createMany({data: remainingDataWithQuestionId})

    } else {

        // delete removed answer choices
        const numChoicesToDelete = oldAnswerChoices.length - currentAnswerChoices.length
        const remainingAnswerChoices = [...oldAnswerChoices]

        const deletedAnswerChoices = []
        for (let i = 0; i<numChoicesToDelete; i++) {
            // remove the num of choices to delete from end of old answer choices
            // store each id of popped answer choice in array
            const deletedAnswerChoice = remainingAnswerChoices.pop()
            deletedAnswerChoices.push(deletedAnswerChoice)
        }

        // use array of ids to delete each answer choice from db
        await Promise.all(deletedAnswerChoices.map(async (deletedChoice) => {
            return await db.radioAnswerChoice.delete({where: {id: deletedChoice?.id}})
        }))

        // see if remaining answer choice data is clean - if not, update records
        const remainingAnswerChoiceDataClean = JSON.stringify(currentAnswerChoices) === JSON.stringify(remainingAnswerChoices)
        if (remainingAnswerChoiceDataClean) {
            // data clean - no need to update
            return true
        } else {
            await Promise.all(remainingAnswerChoices.map(async (answerChoice, index) => {
                return await db.radioAnswerChoice.update({where: {id: answerChoice.id}, data: {...currentAnswerChoices[index]}})
            }))
        }
    }
}
