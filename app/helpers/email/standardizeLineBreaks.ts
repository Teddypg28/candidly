import { ReviewRequestEmailSettings } from "~/types/types"

// convert each email body to consistent line break format
export default function standardizeLineBreaks(settings: ReviewRequestEmailSettings) {
    Object.keys(settings).forEach(key => {
        if (key === 'initialEmailBody' || key === 'followUpEmailBody') {
            settings[key] = settings[key].replace(/\r\n/g, '\n')
        } 
    })
}   
