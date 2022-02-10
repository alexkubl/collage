import {Img}  from './files.js';
import {move, transform} from './manip.js';
import { download } from './download.js';

const Images = new Img();

let input = null;

const foreground = document.getElementById('foreground');
const background = document.getElementById('background');




window.addEventListener('DOMContentLoaded', (event) => {
    uploadTemplate();
});

window.addEventListener('load', function() {
    document.querySelector('button[id="compose"]').addEventListener('click', compose);
})

window.addEventListener('load', function() { // button.classname
    document.querySelector('input[id="uploadObjects"]').addEventListener('change', uploadForegroundObjects);
})

window.addEventListener('load', function() {
    document.querySelector('input[id="uploadBackground"]').addEventListener('change', uploadBack);
})

window.addEventListener('load', function() {
    document.querySelector('button[id="clearSpace"]').addEventListener('click', clearSpace);
})

window.addEventListener('load', function() {
    document.querySelector('button[id="downloadComp"]').addEventListener('click', download);
})

window.addEventListener('load', function() {
    document.querySelector('button[id="clearForeground"]').addEventListener('click', clearForeground);
})

foreground.addEventListener('mousedown',  (event)=> { move(event) });
foreground.addEventListener('dblclick', (event)=> { transform(event) });

function getRandomProp() { // returns value from 0.2 to 0.7
    return (Math.random() * 0.5 + 0.3); 
}

function uploadBack() {
    clearBackground();
    input = this.files[0];
    let image = new Image();
    let reader = new FileReader();
    reader.readAsDataURL(input);
    reader.onload = function() {
        let base = reader.result;
        base = base.split(',')[1]
        Images.addSourse(
            image.src, 
            base
        )
    };
    image.onload = function () {
        background.appendChild(image).setAttribute('id', 'backImg');
        loadBack();
        compose();
    }
    image.src = URL.createObjectURL(input);
}

function uploadForegroundObjects() {
    let filesInput = document.getElementById('uploadObjects');
    for (let i of filesInput.files) {
        input = i;
        let img = new Image();
        let reader = new FileReader();
        img.src = URL.createObjectURL(input);
        reader.readAsDataURL(input);

        reader.onload = function() {
            let base = reader.result;
            base = base.split(',')[1]
            Images.addSourse(
                img.src,
                base,
            )
        };
        img.onload = function () {
            Images.addImage(
                img.src, 
                {
                    x: 0,
                    y: 0,
                    height: this.naturalHeight, 
                    width: this.naturalWidth,
                }, 
            );
            let div = document.createElement('div');
            
            foreground.appendChild(div).setAttribute('id', img.src);

            div.insertBefore(Images.images.get(img.src).image, div.firstChild);
            
            addObject(img.src, background.getAttribute('height'), background.getAttribute('width'));
        };
    }
}


function compose() {
    // send query - call function in 
    // update values in "images"
    // display updated objects
    // createRequest(); // send request to server
    let h = background.getAttribute('height'), w = background.getAttribute('width');
    for (const node of foreground.childNodes) {
        if (node.nodeType == 1) {
            console.log(node);
            let img = node.getAttribute('id');
            addObject(img, h, w);
        }
    }
} 

function loadBack () {
    let node = document.getElementById('backImg');
    let h = node.height/node.width, w = node.width;
    if (h > 1) {
        w = window.innerHeight * 0.8 / h; 
        h = window.innerHeight * 0.8;
    }
    else {
        w = window.innerHeight * 0.8;
        h *= w;
    }
    Images.addImage(
        node.src, {
            x: 0,
            y: 0,
            height: h,
            width: w,
        },
    );
    node.hidden = false;
    node.setAttribute('style', `position: relative;`);
    node.setAttribute('width', w);
    node.setAttribute('height', h);
    background.setAttribute('width', w);
    background.setAttribute('height', h);
    background.setAttribute('style', `position: relative;`);
}

function uploadTemplate() {
    // // upload back
    loadBack();
    let h = background.getAttribute('height'), w = background.getAttribute('width');
    // // upload front
    for (const node of (foreground.childNodes)) {
        if (node.nodeType == 1) {
            let img = node.firstElementChild; 
            node.setAttribute('id', img.src);
            addObject(img.src, h, w);
        }
    }
    
}

function addObject(src, h, w) {
    let node = document.getElementById(src);
    let img = node.firstElementChild;
    let imgHeight = img.height;
    let imgWidth = img.width;
    let imgNewHeight = imgHeight, imgNewWidth = imgWidth;

    if (imgHeight > imgWidth) {
        imgNewHeight = getRandomProp() * h;
        imgNewWidth = imgWidth/imgHeight * imgNewHeight;
    }
    else {
        imgNewWidth = getRandomProp() * w;
        imgNewHeight = imgHeight/imgWidth * imgNewWidth;
    }
    
    let x0 = (w - imgNewWidth) * getRandomProp(), 
        y0 = (h - imgNewHeight) * getRandomProp();
    Images.updateImage(img, {
        x: x0,
        y: y0,
        height: imgNewHeight,
        width: imgNewWidth,
    })
    node.hidden = false;
    node.setAttribute('id', img.src);
    node.setAttribute('width', imgNewWidth);
    node.setAttribute('height', imgNewHeight);
    node.setAttribute('style', `position: absolute; left:${x0}px; top:${y0}px; z-index:auto; cursor: grab;`);           
}

function clearBackground() {
    let back = document.getElementById('backImg');
    if (null != back) {
        document.getElementById('backImg').remove();
    }
}
function clearForeground() {
    for (const node of (foreground.childNodes)) {
        if (node.nodeType == 1)
            node.remove();
    }
}
function clearSpace() {
    clearForeground();
    clearBackground();
}