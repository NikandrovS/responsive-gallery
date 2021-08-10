const container = document.getElementById('container')
const heightOnChange = 130
let resizeStatus = false

function ready() {
    container.addEventListener('drop', handleDrop, false)
    document.getElementById('upload').addEventListener('change', onChange) //file input upload
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const input = document.getElementById('input').value
        const row = document.getElementsByClassName('container__row')[0]

        if (input === "") return

        const img = new Image()
        img.src = input
        row.prepend(img)

        img.onclick = function () {
            remover(this)
        }
        img.onerror = function () {
            img.src = './img/default-image.jpg'
        }
        img.onload = function () {
            resize(row)
            checkRowsSizes()

            containerContain(row)
        }
    })

    window.addEventListener("resize", () => {
        checkRowsSizes()
    })
}

function remover(image) {
    const parent = image.parentNode
    image.remove()
    if (parent.childElementCount) {
        resize(parent)
        checkRowsSizes()
    } else {
        parent.remove()
    }
}

function containerContain(row) {
    if (row.childElementCount) {
        container.classList.add('container_full')
    } else {
        container.classList.remove('container_full')
    }
}

function onChange(event) {
    const reader = new FileReader()
    reader.onload = onReaderLoad
    if (event.target.files[0]) {
        reader.readAsText(event.target.files[0])
        return
    }
    console.log('Please attach *.json file')
}

function resize(row) {
    row.classList.remove('container__row_resized')
    const childrenCount = row.childElementCount
    const children = row.children
    let imagesWidth = 0

    if (row.parentNode && row.parentNode.childElementCount === 1) {
        adaptation()
        return
    }

    if (row.parentNode && row.parentNode.lastChild === row) {
        let previousRowHeight = row.previousSibling.offsetHeight

        for (let i = 0; i < childrenCount; i++) {
            children[i].style.removeProperty('width')
            children[i].style.height = `${ previousRowHeight }px`
        }
        if (row.offsetHeight > previousRowHeight * 2) {
            adaptation()
        } else {
            resizeStatus = false
            return
        }
    }

    adaptation()

    function adaptation() {
        //set default size
        for (let i = 0; i < childrenCount; i++) {
            children[i].style.width = ""
            children[i].style.height = "100px"
        }
        // count images width
        for (let i = 0; i < childrenCount; i++) {
            if (children[i].offsetWidth === 0) {
                children[i].style.height = "100px"
            }
            imagesWidth += children[i].offsetWidth
        }

        // set relative width
        for (let i = 0; i < childrenCount; i++) {
            const margin = childrenCount > 1 ? 0.6 : 0
            let ratio = children[i].offsetWidth / imagesWidth * 100 - margin
            children[i].style.width = `${ ratio }%`
            children[i].style.height = ""
        }
        row.classList.add('container__row_resized')
        resizeStatus = false
    }
}

function checkRowsSizes() {
    const gallery = document.getElementsByClassName('container__row')
    if (!gallery[0].childElementCount) {
        containerContain(gallery[0])
    }
    // check rows height on resize
    for (let i = 0; i < gallery.length; i++) {
        // remove item from row if narrow
        if (gallery[i].offsetHeight < heightOnChange && !resizeStatus && gallery[i].childElementCount > 1) {
            resizeStatus = true
            increaseRow(gallery[i])
        }
        // add item from neighbour row if large
        if (gallery[i].offsetHeight > heightOnChange && window.innerWidth > 650 && !resizeStatus) {
            resizeStatus = true
            squeezeRow(gallery[i])
        }
        if (container.childElementCount > 1) {
            gallery[gallery.length - 1].classList.remove('container__row_resized')
        }
    }
}

function increaseRow(row) {
    const lastItem = row.lastChild
    if (!lastItem) {
        resizeStatus = false
        return
    }

    let nextRow = row.nextSibling
    if (nextRow === null) {
        nextRow = document.createElement('div')
        nextRow.classList.add('container__row')
        row.after(nextRow)
    }

    row.removeChild(lastItem)
    resize(row)

    nextRow.prepend(lastItem)
    resize(nextRow)
}

function squeezeRow(row) {
    if (row.nextSibling && row.nextSibling.nodeName === "#text") row.nextSibling.remove()
    if (row.parentNode.lastChild === row) {
        resize(row)
        return
    }

    const nextRow = row.nextSibling
    const newImage = nextRow.firstChild

    nextRow.firstChild.remove()
    nextRow.childElementCount === 0 ? nextRow.remove() : resize(nextRow)
    row.append(newImage)

    resize(row)
}

function createSpinner() {
    const wrapper = document.createElement('div')
    const spinner = document.createElement('div')

    wrapper.append(spinner)
    wrapper.id = "mySpinner"
    spinner.classList.add("lds-facebook")

    for (let i = 0; i < 4; i++) {
        spinner.append(document.createElement('div'))
    }

    container.parentNode.insertBefore(wrapper, container)
}

function createFirstRow() {
    let div = document.getElementsByClassName('container__row')[0]
    if (!div) div = document.createElement('div')
    div.classList.add('container__row')
    container.append(div)
    return div
}

function onReaderLoad(event) {
    const container = document.getElementById('container')

    createSpinner()

    container.classList.add('container_onLoad')

    const rowsDefaultHeight = 140

    const div = createFirstRow()
    const obj = JSON.parse(event.target.result) //file input upload

    appendLoadedImgIntoDOM()
    setDefaultHeight()
    //time for read and load json images
    setTimeout(() => {
        splitRows(div)
    }, 200)


    function splitRows(row) {
        const rowHeight = row.offsetHeight - 4
        if (rowHeight > rowsDefaultHeight) {
            const containerWidth = container.offsetWidth

            const newRow = document.createElement('div')
            newRow.classList.add('container__row')
            row.before(newRow)

            let acc = 0
            for (let i = 0; i < row.childElementCount; i++) {
                acc += row.children[i].offsetWidth
                if (acc < containerWidth || row.children[i].offsetWidth > containerWidth) {
                    const child = row.children[i]
                    row.removeChild(child)
                    newRow.append(child)
                    i--
                }
            }
            splitRows(row)
        }

        const splittedRows = document.getElementsByClassName('container__row')
        for (let i = 0; i < splittedRows.length; i++) {
            setHeight(splittedRows[i])
        }
    }

    function setHeight(row) {
        row.classList.remove('container__row_resized')
        const childrenCount = row.childElementCount
        const children = row.children

        if (row.parentNode.childElementCount === 1) {
            defaultAdaptation(row)
            return
        }
        if (row.parentNode.lastChild === row) {
            let previousRowHeight = row.previousSibling.offsetHeight
            for (let i = 0; i < childrenCount; i++) {
                children[i].style.removeProperty('width')
                children[i].style.height = `${ previousRowHeight }px`
            }
            if (row.offsetHeight > previousRowHeight * 2) {
                defaultAdaptation(row)
            } else {
                return
            }
        }

        defaultAdaptation(row)
    }


    function appendLoadedImgIntoDOM() {
        for (let i = 0; i < obj.galleryImages.length; i++) {
            const img = new Image()

            img.src = obj.galleryImages[i].url
            img.onclick = function () {
                remover(this)
            }
            div.append(img)
        }

        containerContain(div)
    }

    function setDefaultHeight() {
        const rows = document.getElementsByClassName('container__row')

        for (let i = 0; i < rows.length; i++) {
            const childrenCount = rows[i].childElementCount
            const children = rows[i].children

            for (let j = 0; j < childrenCount; j++) {
                children[j].style.height = rowsDefaultHeight + "px"
            }
        }
    }

    function defaultAdaptation(row) {
        const childrenCount = row.childElementCount
        const children = row.children
        let totalWidth = 0

        for (let j = 0; j < childrenCount; j++) {
            totalWidth += children[j].offsetWidth
        }

        for (let j = 0; j < childrenCount; j++) {
            const margin = childrenCount > 1 ? 0.6 : 0
            let ratio = children[j].offsetWidth / totalWidth * 100 - margin
            children[j].style.width = `${ ratio }%`
            children[j].style.height = ''
        }
        row.classList.add('container__row_resized')

        const spinner = document.getElementById('mySpinner')
        if (spinner) spinner.remove()
        container.classList.remove('container_onLoad')
    }
}

//drag & drop
function handleDrop(e) {
    let dt = e.dataTransfer
    let files = dt.files

    handleFiles(files)
}

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    container.addEventListener(eventName, preventDefaults, false)
})

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

['dragenter', 'dragover'].forEach(eventName => {
    container.addEventListener(eventName, highlight, false)
});

['dragleave', 'drop'].forEach(eventName => {
    container.addEventListener(eventName, unhighlight, false)
})

function highlight(e) {
    container.classList.add('highlight')
}

function unhighlight(e) {
    container.classList.remove('highlight')
}

function handleFiles(files) {
    ([...files]).forEach(uploadFile)
}

function uploadFile(file) {
    const row = document.getElementsByClassName('container__row')[0]

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function () {
        const img = new Image()
        row.prepend(img)
        img.classList.add('container_onLoad')
        img.src = reader.result
        img.onclick = function () {
            remover(this)
        }

        setTimeout(() => {
            resize(row)
            checkRowsSizes()
            img.classList.remove('container_onLoad')
        }, 0)

        containerContain(row)
    }
}

document.addEventListener("DOMContentLoaded", ready)
