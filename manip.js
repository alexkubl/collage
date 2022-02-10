const background = document.getElementById('background');
const foreground = document.getElementById('foreground');
let movable = foreground;

let currentMovable = null;
const currentMovableOffset = {
    x: 0,
    y: 0,
};
let currentTrans = null;
const currentTransOffset = {
    x: 0,
    y: 0,
};
const currentTransSize = {
    w: 0,
    h: 0,
}

function moveHandler(event) {   
    const docRect = background.getBoundingClientRect();
    docRect.width = background.getAttribute('width');
    docRect.height = background.getAttribute('height');
    const rect = currentMovable.getBoundingClientRect();
 
    const x = Math.min(
        Math.max(0, event.clientX - docRect.left - currentMovableOffset.x),
        docRect.width - rect.width,
    );
    const y = Math.min(
        Math.max(0, event.clientY - docRect.top - currentMovableOffset.y),
        docRect.height - rect.height,
    );

    currentMovable.setAttribute('style', `position: absolute; left:${x}px; top:${y}px; z-index:auto; cursor: grab;`);
    currentMovable.children[0].setAttribute('style', 'border: dotted black;');
}

function upHandler(event) {
    if ( event.button !== 0 ) return;
    background.removeEventListener('mousemove', moveHandler);
    background.removeEventListener('mouseup', upHandler);
    background.classList.remove('moving');
    if (currentMovable) {   
        currentMovable.children[0].removeAttribute('style');
        currentMovable.classList.remove('moving');
        currentMovable = null;
    }
}

export function move(event) {
    if ((event.button !== 0) || !(movable.contains(event.target))) return;

    background.addEventListener('mousemove', moveHandler);
    background.addEventListener('mouseup', upHandler);
    currentMovable = document.getElementById(event.target.src);
    
    currentMovable.classList.add('moving');
                
    const rect = currentMovable.getBoundingClientRect();
                
    currentMovableOffset.x = event.clientX - rect.left;
    currentMovableOffset.y = event.clientY - rect.top;
}

export function transform(event) {
    currentTrans = document.getElementById(event.target.src);
    currentTransSize.w = currentTrans.getAttribute('width');
    currentTransSize.h = currentTrans.getAttribute('height');
    currentTrans.classList.add('transform');
    currentTrans.children[0].setAttribute('style', 'border: dotted white;');
    
    background.addEventListener('mousemove', transHandler);
    background.addEventListener('mouseup', stopTrans);
    const rect = currentTrans.getBoundingClientRect();
    // currentTrans.children[0].removeAttribute('style');
    currentTransOffset.x = event.clientX - rect.left;
    currentTransOffset.y = event.clientY - rect.top;
}

function transHandler(event) {
    const rect = currentTrans.getBoundingClientRect();
    const docRect = background.getBoundingClientRect();
    docRect.width = background.getAttribute('width');
    docRect.height = background.getAttribute('height');

    const x = Math.min(
        Math.abs(event.clientX - currentMovableOffset.x), 
        docRect.right - rect.left) / rect.width; 
    const y = Math.min(
        Math.abs(event.clientY - currentMovableOffset.y), 
        docRect.bottom - rect.top) / rect.height;

    let ratio = Math.min(x, y);
    currentTrans.children[0].setAttribute('style', 
        `transform-origin: top left; transform:scale(${ratio}); border: dotted white;`);
}

function stopTrans(event) {
    if ( event.button !== 0 ) return;
    background.removeEventListener('mousemove', transHandler);
    background.removeEventListener('click', stopTrans);
        
    if (currentTrans) {   
        let ratio = currentTrans.children[0].style.transform.split('(')[1];
        ratio = ratio.split(')')[0];

        currentTrans.setAttribute('width', ratio * currentTransSize.w);
        currentTrans.setAttribute('height', ratio * currentTransSize.h);
        currentTrans.children[0].width = ratio * currentTransSize.w;
        currentTrans.children[0].height = ratio * currentTransSize.h;
        currentTrans.children[0].removeAttribute('style');
        currentTrans = null;
    }
}
