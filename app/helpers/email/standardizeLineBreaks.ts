// convert each email body to consistent line break format
export default function standardizeLineBreaks(settings: {[key: string]: any}) {
    Object.keys(settings).forEach(key => {
        if (key === 'initialEmailBody' || key === 'followUpEmailBody' || key === 'body') {
            settings[key] = settings[key].replace(/\r\n/g, '\n')
        } 
    })
}   
