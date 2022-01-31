let button = null;
let input = null;
let container = null; 


const foreground = document.getElementById("foreground");
const background = document.getElementById("background");


const images = new Map();
const sourses = new Map(); // src: base64

window.addEventListener('DOMContentLoaded', (event) => {
    
});
function main() {
    uploadTemplate();
}


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


function addSourse(src, base) {
    sourses.set(src, base);
}

function updateImage(image, data) {
    image.height = data.height;
    image.width = data.width;
    image.style.left = data.x + 'px';
    image.style.top = data.y + 'px';
}

function addImage(src, data) 
{
    if (images.has(src)) // if in images already exists image with this src
    {
        images.set(
            src, 
            {
                ...images.get(src),
                ...data,
            },
        );
        updateImage(image, data);
        return;
    }
    const image = new Image();
    image.src = src;
    updateImage(image, data);
    images.set(
        src, 
        {
            ...data,
            image,
        },
    );
}



function getRandomProp() { // returns value from 0.2 to 0.7
    return (Math.random() * 0.7 + 0.005); 
}
function uploadBack() {
    if (null != document.getElementById("backImg"))
        document.getElementById("backImg").remove();

    input = this.files[0];
    let image = new Image();
    let reader = new FileReader();
    reader.readAsDataURL(input);
    reader.onload = function() {
        let base = reader.result;
        base = base.split(',')[1]
        addSourse(
            image.src, 
            base
        )
    };
    image.onload = function () {
        let h = this.height/this.width, w = this.width;
        if (h > 1) {
            w = window.innerHeight * 0.7 / h; 
            h = window.innerHeight * 0.7;
        }
        else {
            w = window.innerHeight * 0.7;
            h *= w;
        }
        addImage(
            image.src, 
            {
                x: 0,
                y:0,
                height: h,
                width: w,
            },
        );
        background.appendChild(images.get(image.src).image).setAttribute('id', 'backImg');
        background.setAttribute('style', `position: relative; width:${w}px; height:${h}px;`);
        //background.firstElementChild;
    }
    image.src = URL.createObjectURL(input);
}

function uploadForegroundObjects() {
    let filesInput = document.getElementById("uploadObjects");
    for (let i of filesInput.files) {
        input = i;
        let image = new Image();
        let reader = new FileReader();
        image.src = URL.createObjectURL(input);
        reader.readAsDataURL(input);

        reader.onload = function() {
            let base = reader.result;
            base = base.split(',')[1]
            addSourse(
                image.src,
                base,
            )
        };
        image.onload = function () {
            addImage(
                image.src, 
                {
                    x: 100,
                    y: 100,
                    height: this.height,
                    width: this.width,
                }, 
            );
            let img = images.get(image.src).image;
            let div = document.createElement("div");
            div.hidden = true;
            foreground.appendChild(div);
            div.insertBefore(img, div.firstChild);
        }
    }
}


function compose() {
    // send query - call function in 
    // update values in "images"
    // display updated objects
    
    // createRequest(); // send request to server
    let back = document.getElementById("backImg");
    let h = back.height, w = back.width;
    
    for (const node of foreground.childNodes) {
        
        if (node.nodeType == 1) {
            const img = node.firstElementChild;
            let imgHeight = img.height, imgNewHeight = getRandomProp() * h;
            let imgNewWidth = img.width/imgHeight * imgNewHeight;
            let x0 = (w - imgNewWidth) * getRandomProp(), y0 = (h - imgNewHeight) * getRandomProp(), z = 2;
            updateImage(img, {
                x: x0,
                y: y0,
                height: imgNewHeight,
                width: imgNewWidth,
            })
            node.hidden = false;
            node.setAttribute('id', img.src);
            node.setAttribute('style', `position: absolute; left:${x0}px; top:${y0}px; z-index:${z}; cursor: grab;`);
            z += 1;              
        }
    }
} 

function clearSpace() {
    for (const node of (foreground.childNodes)) {
        if (node.nodeType == 1)
            node.remove();
    }
    document.getElementById("backImg").remove();
}

function uploadTemplate() {
    // upload back
    let node = document.getElementById("backImg");
    let z = 1;
    let h = node.height/node.width, w = node.width;
    if (h > 1) {
            w = window.innerHeight * 0.7 / h; 
            h = window.innerHeight * 0.7;
        }
        else {
            w = window.innerHeight * 0.7;
            h *= w;
        }
        addImage(
            node.src, 
            {
                x: 0,
                y:0,
                height: h,
                width: w,
            },
        );
    node.hidden = false;
    node.setAttribute('style', `position: relative; width:${w}px; height:${h}px;`);
    background.setAttribute('style', `position: relative; width:${w}px; height:${h}px;`);
    

    // // upload front
    for (const node of (foreground.childNodes)) {
        if (node.nodeType == 1) {
            let img = node.firstElementChild; //firstChild;
            let imgHeight = img.height, imgNewHeight = getRandomProp() * h;
            let imgNewWidth = img.width/imgHeight * imgNewHeight;
            let x0 = (w - imgNewWidth) * getRandomProp(), y0 = (h - imgNewHeight) * getRandomProp(), z = 2;
            addImage(
                img.src, 
                {
                    x: x0,
                    y: y0,
                    height: imgNewHeight + 'px',
                    width: imgNewWidth + 'px',
                },
            );
            node.setAttribute('id', img.src);
            img.setAttribute('width', `${imgNewWidth}px`)
            img.setAttribute('height', `${imgNewHeight}px;`);
            node.hidden = false;
            node.setAttribute('style', `position: absolute; left:${x0}px; top:${y0}px; z-index:${z}; cursor: grab;`);
            z += 1;
        }
    }
}

const movable = foreground; 
let currentMovable = null;
const currentMovableOffset = {
	x: 0,
	y: 0,
};

function moveHandler( event )
{
	const docRect = background.getBoundingClientRect();
    //document.documentElement.getBoundingClientRect();
	const rect = currentMovable.getBoundingClientRect();
	
	const x = Math.min(
		Math.max( 0, event.pageX - currentMovableOffset.x ),
		docRect.width - rect.width,
	);
	const y = Math.min(
		Math.max( 0, event.pageY - currentMovableOffset.y ),
		docRect.height - rect.height,
	);
    currentMovable.setAttribute('style', `position: absolute; left:${x}px; top:${y}px; z-index:${3}; cursor: grab;`);
}

function upHandler( event )
{
	if ( event.button !== 0 )
		return;
	
	document.removeEventListener( 'mousemove', moveHandler );
	document.removeEventListener( 'mouseup', upHandler );
	document.querySelector('div#foreground').classList.remove( 'moving' );
	
	if ( currentMovable )
	{
		currentMovable.classList.remove( 'moving' );
		currentMovable = null;
	}
}

window.addEventListener('load', function() {
    movable.addEventListener(
        'mousedown',
        ( event ) =>
        {
            if ((event.button !== 0)
                || !(movable.contains(event.target))) return;
        
            document.addEventListener( 'mousemove', moveHandler );
            document.addEventListener( 'mouseup', upHandler );

            currentMovable = document.getElementById(`${event.target.src}`);
            
            currentMovable.classList.add( 'moving' );
            
            const rect = currentMovable.getBoundingClientRect();
    
            currentMovableOffset.x = event.clientX - rect.left;
            currentMovableOffset.y = event.clientY - rect.top;
        }
    );
})


/*
function getClass(width, height) {
    // Math.random()
    // (images.get(src).width, images.get(src).height) => {return ()};
    if (width > height)
        return 'car', 'bench';
    else 
        return 'person', 'tv';
}

function createRequest() {
    // input JSON
    // {“background”: “base64”,
    //     “foreground”: [{“object”: “base64”, “class”: “person”}, 
    //         {“object”: “base64”, “class”: “cat”}]} 
    // output 
    // {
    //     “composition”: [“base64”, 
    //         “base64”], 
    //     “properties“: [prop, prop]
    //     prop — [{“x“: x, “y“: y, “w“: w, “h“: h}, ...]
    // }
    
    let img = background.lastChild;
    let src = img.src;
    let objects = [];
    let base = sourses.get(src);
    let params = new Object;
    params['background'] = base;

    for (const node of (foreground.childNodes)) {
        if (node.nodeType == 1) {
            //console.log(node.firstChild);
            img = node.firstChild;
            //console.log(src);
            src = img.src;
            base = sourses.get(src);
            //console.log(base);
            objects.push({
                'object': `${base}`,
                'class': 'person',
            });
        }
    }
    // console.log(sourses);
    params['foreground'] = objects;
    let json = JSON.stringify(params);
    //console.log(json);
    
    fetch(
        'http://109.188.135.85:5813/composition',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode:'no-cors',
            body: json,
        }
    )
    .then(( response ) => console.log(response.json()))
	.then( ( data ) => console.log( data ) );  
    
    //json = response.json();

    //  {
    //     “composition”: [“base64”, 
    //         “base64”], 
    //     “properties“: [prop, prop]
    //     prop — [{“x“: x, “y“: y, “w“: w, “h“: h}, ...]
    // }
} */
