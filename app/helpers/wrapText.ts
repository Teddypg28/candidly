export default function wrapText(text: string) {
    const words = text.trim().split(' ')
    if (words.length > 3) {
        return words.slice(0, 3).join(" ") + "\n" + words.slice(3).join(" ");
    } else {
        return text
    }
}