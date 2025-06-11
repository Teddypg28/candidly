const generatePaginatorButtonMarkup = (start, end) => {
    const buttonMarkup = []
    for (let i = start; i<=end; i++) {
        buttonMarkup.push(`<div data-page=${i} class="paginatorNumber">${i}</div>`)
    }
    return buttonMarkup.join('')
}

const generatePaginationButtons = (currentPage, numOfPages) => {
    const numOfTabsToShow = Math.min(numOfPages, 5)
    const middleIndex = Math.floor(5 / 2)
    // if currentPage is near the beginning, no need to shift the middle tab
    if (currentPage <= middleIndex + 1) {
        return generatePaginatorButtonMarkup(1, numOfTabsToShow)
    } else {
        // if there are not enough pages to center the current page
        if (currentPage + middleIndex > numOfPages) {
            return generatePaginatorButtonMarkup(numOfPages - numOfTabsToShow + 1, numOfPages)
        } else {
            // normal case: currentPage is somewhere in the middle
            return generatePaginatorButtonMarkup(currentPage - middleIndex, currentPage + middleIndex)
        }
    }
}

const generatePaginator = (currentPage, numOfPages) => {
    return (
    `<div class='paginator'>
        <div class='paginatorBtn paginatorPrev'> < Prev </div>
        <div class='paginatorNumbersContainer'>
            ${generatePaginationButtons(currentPage, numOfPages)}
        </div>
        <div class='paginatorBtn paginatorNext'> Next > </div>
    </div>`)
}
