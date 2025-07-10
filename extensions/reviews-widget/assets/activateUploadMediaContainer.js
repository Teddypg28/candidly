const activateUploadMediaContainer = () => {
    const uploadMediaContainer = document.querySelector('.uploadMediaContainer')
    const uploadedMediaContainer = document.querySelector('.uploadedMediaContainer')
    const uploadMediaBtn = document.querySelector('.uploadMediaBtn')
    const uploadError = document.querySelector('.uploadError')

    const conditionallyRenderUploadMediaLabel = () => {
        if (Array.from(uploadMediaBtn.files).length > 0) {
            document.querySelector('.uploadMediaLabel').classList.add("hidden")
        } else {
            document.querySelector('.uploadMediaLabel').classList.remove("hidden")
        }
    }

    const verifyFileType = (file) => {
        if (file.type.split('/')[0] !== 'image' && file.type.split('/')[0] !== 'video') {
            return uploadError.innerText = 'Only image or video files are allowed'
        } 
        uploadError.innerText = ''
        // verify no duplicate files are being added -- uses array to verify since file list changes if multiple drag and drops are used
        if (!addedFiles.find(uploadedFile => uploadedFile.name === file.name)) {
            // push files to saved uploaded files array and update input element file list since file list changes if user drags and drops multiple sets of files
            addedFiles.push(file)
            const dt = new DataTransfer()
            addedFiles.forEach(file => {
                dt.items.add(file)
            })
            uploadMediaBtn.files = dt.files
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = () => {
                const imageContainer = document.createElement('figure')
                imageContainer.className = 'uploadedImage'

                const img = document.createElement('img')
                img.src = reader.result

                imageContainer.appendChild(img)
                imageContainer.innerHTML += `<figcaption>${file.name}</figcaption>`

                const removeUploadedMediaContainer = document.createElement('div')
                removeUploadedMediaContainer.className = 'removeUploadedMediaContainer'
                removeUploadedMediaContainer.id = 'removeUploadedMediaContainer deleteMedia'
                removeUploadedMediaContainer.dataset.fileName = file.name

                const trashCanIconContainer = document.createElement('div')
                trashCanIconContainer.className = "removeUploadedMedia hidden"
                trashCanIconContainer.dataset.fileName = file.name

                const trashCanIcon = document.createElement('i')
                trashCanIcon.className = "fa-solid fa-trash-can fa-2xl"
                trashCanIcon.id = "deleteMedia"
                trashCanIcon.dataset.fileName = file.name
                trashCanIcon.style.color = "#ffffff"

                trashCanIconContainer.appendChild(trashCanIcon)

                removeUploadedMediaContainer.appendChild(trashCanIconContainer)

                removeUploadedMediaContainer.addEventListener('mouseover', () => {                      
                    removeUploadedMediaContainer.style.backgroundColor = 'rgb(0, 0, 0, 0.6)'
                    trashCanIconContainer.classList.remove('hidden')
                })

                removeUploadedMediaContainer.addEventListener('mouseleave', () => {
                    removeUploadedMediaContainer.style.backgroundColor = 'transparent'
                    trashCanIconContainer.classList.add('hidden')
                })

                removeUploadedMediaContainer.addEventListener('click', (e) => {                     
                    if (e.target.id.includes('deleteMedia')) {
                        // remove deleted file from file list  
                        const dt = new DataTransfer()
                        const currentFiles = Array.from(uploadMediaBtn.files)
                        currentFiles.forEach(file => {
                            if (file.name !== e.target.dataset.fileName) {
                                dt.items.add(file)
                            }
                        })
                        uploadMediaBtn.files = dt.files
                        // remove deleted files from saved uploaded files array
                        addedFiles = addedFiles.filter(uploadedFile => uploadedFile !== file)
                        imageContainer.remove()
                    }

                    conditionallyRenderUploadMediaLabel()
                })

                imageContainer.appendChild(removeUploadedMediaContainer)
                uploadedMediaContainer.appendChild(imageContainer)

                conditionallyRenderUploadMediaLabel()
            }
        }
    }

    const active = () => uploadMediaContainer.style.border = `2px dotted #b0d7f4`
    const inactive = () => uploadMediaContainer.style.border = '2px dotted lightgray';

    ['dragenter', 'dragover'].forEach(event => uploadMediaContainer.addEventListener(event, active));
    ['dragleave', 'drop'].forEach(event => uploadMediaContainer.addEventListener(event, inactive));

    uploadMediaBtn.addEventListener('change', () => {
        Array.from(uploadMediaBtn.files).forEach(verifyFileType)
    })
}