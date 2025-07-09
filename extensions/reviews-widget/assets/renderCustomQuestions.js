 const renderCustomQuestions = () => {
     if (reviewSettings.customQuestions.length > 0) {
        reviewSettings.customQuestions.forEach((question) => {
            insertCustomQuestion(question)
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
                customQuestionMultipleChoices.forEach(dropdown => {
                    const questionId = dropdown.id.split('-')[1]
                    const dropdownTop = document.querySelector(`#dropdownTop-${questionId}`)
                    const selectedOptionsContainer = document.querySelector(`#selectedOptionsContainer-${questionId}`)
                    const chevronContainer = document.querySelector(`#chevronContainer-${questionId}`)
                    let isDropdownOpen = false
                    dropdownTop.addEventListener('click', () => {
                        isDropdownOpen = !isDropdownOpen
                        const closeDropdown = (e) => {
                            if (e.target.classList.contains('checkbox') === false && e.target.classList.contains('dropdownItem') === false) {
                                dropdownItemsContainer.classList.add('hidden')
                                chevronContainer.innerHTML = '<i class="fa-solid fa-chevron-down" style="color: #ffffff;"></i>'
                                isDropdownOpen = false
                                document.removeEventListener('click', closeDropdown)
                            }
                        }
                        const dropdownItemsContainer = document.querySelector(`#dropdownItemsContainer-${questionId}`)
                            if (dropdownItemsContainer.classList.contains('hidden')) {
                            dropdownItemsContainer.classList.remove('hidden')
                            chevronContainer.innerHTML = '<i class="fa-solid fa-chevron-up" style="color: #ffffff;"></i>'                              
                        } else {                              
                            dropdownItemsContainer.classList.add('hidden')
                            chevronContainer.innerHTML = '<i class="fa-solid fa-chevron-down" style="color: #ffffff;"></i>'
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
                                        }
                                        else {
                                            selectedOptionsContainer.textContent = selectedAnswers
                                        }
                                        userInputState['customQuestionAnswers'][`customQuestion-${questionId}`] = {...userInputState['customQuestionAnswers'][`customQuestion-${question.id}`], value: checkedAnswerIds.length > 0 ? checkedAnswerIds : ['']}
                                    })
                                })
                            })
                        }
                    })
        }
 }
 