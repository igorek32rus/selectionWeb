const $main = document.querySelector('.main')
const $selector = document.querySelector('.selection')

const TEMPLATE = {
  id: 0,
  elem: null,
  changes: false,
  selected: false
}

const elems = []
let selected = []

let dragElem = false
let mainElem = null
let elemStartX = 0
let elemStartY = 0

const TRANSITION_START = "none"
const TRANSITION_END = "transform .15s ease-in-out"

let dragstart = false
let moving = false
let startX = 0
let startY = 0
let selWidth = 0
let selHeight = 0
let selTop = 0
let selLeft = 0

const downElem = (e) => {
  e.stopPropagation()

  elemStartX = e.pageX
  elemStartY = e.pageY
  mainElem = e.target

  if (!selected.find(item => item.elem === mainElem)) {   // если перетаскивается один элемент
    const elem = elems.find(item => item.elem === mainElem)
    elems.map(item => item.selected = false)
    elem.selected = true
    selected = [elem]

    elems.forEach((item) => {
      if (item.selected) {
        item.elem.classList.add('selected')
        return
      }

      item.elem.classList.remove('selected')
    })
  }

  let count = 0
  selected.forEach((item) => {
    const elem = item.elem

    let coordX = (e.pageX - elemStartX) + (mainElem.offsetLeft - elem.offsetLeft) + (count * 10)
    let coordY = (e.pageY - elemStartY) + (mainElem.offsetTop - elem.offsetTop) + (count * 10)
    elem.style.transition = TRANSITION_START
    elem.style.transform = 'translateX(' + coordX + 'px)'
    elem.style.transform += 'translateY(' + coordY + 'px)'

    count++
  })

  dragElem = true
}

for (let i = 0; i < 50; i++) {
  const elem = document.createElement('div')
  elem.classList.add('elem')
  const newBlock = { ...TEMPLATE, id: i, elem }
  $main.insertAdjacentElement('beforeend', elem)
  elem.addEventListener('mousedown', downElem)
  elems.push(newBlock)
}

$main.ondragstart = function() {
  return false;
};

function intersects( a, b ) {
    return(
        (
          (
            ( a.x>=b.x && a.x<=b.x1 )||( a.x1>=b.x && a.x1<=b.x1  )
          ) && (
            ( a.y>=b.y && a.y<=b.y1 )||( a.y1>=b.y && a.y1<=b.y1 )
          )
        )||(
          (
            ( b.x>=a.x && b.x<=a.x1 )||( b.x1>=a.x && b.x1<=a.x1  )
          ) && (
            ( b.y>=a.y && b.y<=a.y1 )||( b.y1>=a.y && b.y1<=a.y1 )
          )
        )
      )||(
        (
          (
            ( a.x>=b.x && a.x<=b.x1 )||( a.x1>=b.x && a.x1<=b.x1  )
          ) && (
            ( b.y>=a.y && b.y<=a.y1 )||( b.y1>=a.y && b.y1<=a.y1 )
          )
        )||(
          (
            ( b.x>=a.x && b.x<=a.x1 )||( b.x1>=a.x && b.x1<=a.x1  )
          ) && (
            ( a.y>=b.y && a.y<=b.y1 )||( a.y1>=b.y && a.y1<=b.y1 )
          )
        )
      );
}


let downListener = (e) => {
  dragstart = true
  startX = e.pageX
  startY = e.pageY

  selLeft = e.pageX
  selTop = e.pageY

  $selector.style.width = 0
  $selector.style.height = 0
  $selector.style.top = startY + "px"
  $selector.style.left = startX + "px"
  $selector.style.display = "block"

  elems.forEach((item) => {
    item.changes = false
  })
}

let moveListener = (e) => {
  if (dragstart) {
    let posX = e.pageX - startX
    let posY = e.pageY - startY

    if (posX < 0) {
        selLeft = e.pageX
        $selector.style.left = e.pageX + "px"
    }

    if (posY< 0) {
        selTop = e.pageY
        $selector.style.top = e.pageY + "px"
    }

    selWidth = Math.abs(posX)
    selHeight = Math.abs(posY)

    $selector.style.width = selWidth + "px"
    $selector.style.height = selHeight + "px"

    elems.forEach((item) => {
      const elem = item.elem

      const rect1 = {
        x: elem.offsetLeft, 
        y: elem.offsetTop, 
        x1: elem.offsetLeft + elem.offsetWidth, 
        y1: elem.offsetTop + elem.offsetHeight
      }

      const rect2 = {
        x: selLeft, 
        y: selTop, 
        x1: selLeft + selWidth, 
        y1: selTop + selHeight
      }

      const intersect = intersects(rect1, rect2)

      if (e.ctrlKey && intersect && !item.changes) {
        item.selected = !item.selected
        item.changes = true
        return
      }

      if (!intersect) {
        item.selected = false
        return
      }

      item.selected = true
    })
    
    selected = elems.filter(item => item.selected)

    elems.forEach((item) => {
      if (item.selected) {
        item.elem.classList.add('selected')
        return
      }

      item.elem.classList.remove('selected')
    })
  }

  if (dragElem) {
    let count = 0
    
    selected.forEach((item) => {
      const elem = item.elem

      let coordX = (e.pageX - elemStartX) + (mainElem.offsetLeft - elem.offsetLeft) + (count * 10)
      let coordY = (e.pageY - elemStartY) + (mainElem.offsetTop - elem.offsetTop) + (count * 10)
      elem.style.transform = 'translateX(' + coordX + 'px)'
      elem.style.transform += 'translateY(' + coordY + 'px)'
      count++
    })
  }
}

let upListener = (e) => {
  if (dragstart) {
    $selector.style.display = "none"
    dragstart = false
    return
  }

  if (dragElem) {
    selected.forEach(item => {
      const elem = item.elem
      elem.style.transition = TRANSITION_END
      elem.style.transform = 'translateY(' + 0 + 'px)'
      elem.style.transform += 'translateX(' + 0 + 'px)'
    })

    dragElem = false
    return
  }
}

// const clickListener = (e) => {
//   console.log(dragstart, dragElem);
//   if (dragstart || dragElem) {
//     dragstart = false
//     dragElem = false
//     return
//   }

//   selected = []
//   elems.map(item => item.selected = false)
  
//   elems.forEach((item) => {
//     if (item.selected) {
//       item.elem.classList.add('selected')
//       return
//     }

//     item.elem.classList.remove('selected')
//   })
// }

$main.addEventListener('mousedown', downListener)
$main.addEventListener('mouseup', upListener)
$main.addEventListener('mousemove', moveListener)
// $main.addEventListener('click', clickListener)