 const renderCustomQuestions = () => {
     if (reviewSettings.customQuestions.length > 0) {
        reviewSettings.customQuestions.forEach((question) => {
            insertCustomQuestion(question)
        })
        const customQuestionDropdowns = document.querySelectorAll('.customQuestionDropdown')
        const customQuestionMultipleChoices = document.querySelectorAll('.multipleChoicesContainer')
        // add event listeners to single choice dropdowns
        customQuestionDropdowns.forEach(dropdown => {    
            dropdown.value = userInputState['customQuestionAnswers'][dropdown.getAttribute("data-name")].value[0]          
            dropdown.addEventListener('change', (e) => {
                userInputState['customQuestionAnswers'][e.target.dataset.name] = {...userInputState['customQuestionAnswers'][e.target.dataset.name], value: [e.target.value]}
            })
        })
        // add event listeners to multiple choice dropdowns
        if (customQuestionMultipleChoices.length > 0) {

            // fill in saved selected answer choice(s)
            const selectedOptionsContainers = document.querySelectorAll(`.selectedOptionsContainer`)
            selectedOptionsContainers.forEach(container => {
                const questionId = container.id.split("selectedOptionsContainer-")[1]
                const checkedNames = []
                document.querySelectorAll(`.checkbox`).forEach(checkbox => {
                    if (userInputState['customQuestionAnswers'][ `customQuestion-${questionId}`].value.includes(checkbox.dataset.id)) {
                        checkbox.classList.add(`checked-${questionId}`)
                        checkbox.textContent = '•'
                        checkedNames.push(checkbox.dataset.name)
                    }
                })
                container.textContent = userInputState['customQuestionAnswers'][ `customQuestion-${questionId}`].value[0] === "" ? "Select" : checkedNames.join(", ")   
            })

            customQuestionMultipleChoices.forEach(dropdown => {
                const questionId = dropdown.id.split('multipleChoicesContainer-')[1]
                const dropdownTop = document.querySelector(`#dropdownTop-${questionId}`)
                const selectedOptionsContainer = document.querySelector(`#selectedOptionsContainer-${questionId}`)

                const chevronContainer = document.querySelector(`#chevronContainer-${questionId}`)
                let isDropdownOpen = false
                dropdownTop.addEventListener('click', () => {
                    isDropdownOpen = !isDropdownOpen
                    const closeDropdown = (e) => {
                        if (e.target.classList.contains('checkbox') === false && e.target.classList.contains('dropdownItem') === false) {
                            dropdownItemsContainer.classList.add('hidden')
                            chevronContainer.innerHTML = '<svg width="17px" height="17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10L12 15L17 10" stroke="#000000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'
                            isDropdownOpen = false
                            document.removeEventListener('click', closeDropdown)
                        }
                    }
                    const dropdownItemsContainer = document.querySelector(`#dropdownItemsContainer-${questionId}`)
                    if (dropdownItemsContainer.classList.contains('hidden')) {
                        dropdownItemsContainer.classList.remove('hidden')
                        chevronContainer.innerHTML = '<svg width="17px" height="17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10L12 15L17 10" stroke="#000000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'                              
                    } else {                              
                        dropdownItemsContainer.classList.add('hidden')
                        chevronContainer.innerHTML = '<svg width="17px" height="17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10L12 15L17 10" stroke="#000000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'
                    }

                    if (isDropdownOpen) {
                        setTimeout(() => document.addEventListener('click', closeDropdown), 100)
                    }
                })
                document.querySelectorAll(`#dropdownQuestion${questionId}Item`).forEach(element => {
                    element.addEventListener('click', (e) => {
                        if (e.target.id === `dropdownQuestion${questionId}Item`) {
                            if (e.target.children[0].classList.contains(`checked-${questionId}`)) {
                                e.target.children[0].textContent = ' '
                                e.target.children[0].classList.remove(`checked-${questionId}`)
                            } else {
                                e.target.children[0].textContent = '•'
                                e.target.children[0].classList.add(`checked-${questionId}`)
                            }
                        } else {
                            if (e.target.classList.contains(`checked-${questionId}`)) {
                                e.target.textContent = ' '
                                e.target.classList.remove(`checked-${questionId}`)
                            } else {
                                e.target.textContent = '•'
                                e.target.classList.add(`checked-${questionId}`)
                            }
                        }
                        const checkedNames = []
                        const checkedAnswerIds = []
                        document.querySelectorAll(`.checked-${questionId}`).forEach(checkedElement => {
                            checkedNames.push(checkedElement.dataset.name)
                            checkedAnswerIds.push(checkedElement.dataset.id)
                        })
                        const selectedAnswers = checkedNames.join(', ')
                        if (checkedNames.length === 0) {
                            selectedOptionsContainer.textContent = 'Select'                             
                        } else {
                            selectedOptionsContainer.textContent = selectedAnswers
                        }
                        userInputState['customQuestionAnswers'][`customQuestion-${questionId}`] = {...userInputState['customQuestionAnswers'][`customQuestion-${questionId}`], value: checkedAnswerIds.length > 0 ? checkedAnswerIds : ['']}
                    })
                })
            })
        }
    }
 }
 