let button = null;
let reader = new FileReader();
let container = null; 
const foreground = document.getElementById("foreground");
const background = document.getElementById("background");


const images = new Map();
const sourses = new Map(); // src: base64

function addSourse(src, base) {
    sourses.set(src, base);
}

function updateImage(image, data) {
    image.width = data.width;
    image.height = data.height;
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


function newObject() {
    let input = this.files[0];
    let image = new Image();
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

function uploadBack() {

    let input = this.files[0];
    let image = new Image();
    
    reader.readAsDataURL(input);
    reader.onload = function() {
        let base = reader.result;
        base = base.split(',')[1]
        addSourse(
            image.src, 
            base
        )
    };
    image.src = URL.createObjectURL(input);
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
        background.appendChild(images.get(image.src).image);
        background.setAttribute('style', `position: relative; width:${w}px; height:${h}px;`);
    }
}


function main() {
    button = document.getElementById("compose");
    button.addEventListener("click", compose, false);
}

window.addEventListener('load', function() {
    document.querySelector('button[id="compose"]').addEventListener('click', compose);
})

window.addEventListener('load', function() { // button.classname
    document.querySelector('input[id="uploadObjects"]').addEventListener('change', newObject);
})

window.addEventListener('load', function() {
    document.querySelector('input[id="uploadBackground"]').addEventListener('change', uploadBack);
})

window.addEventListener('load', function() {
    document.querySelector('button[id="template"]').addEventListener('click', uploadTemplate);
})

function compose() {
    // send query - call function in 
    // update values in "images"
    // display updated objects
    
    // createRequest(); // send request to server
    let x0 = 50, y0 = 50, z = 2;
    for (const node of foreground.childNodes) {
        if (node.nodeType == 1) {
            const img = node.firstElementChild;
            updateImage(img, {
                x: 100,
                y: 100,
                height: img.height/5,
                width: img.width/5,
            })
            node.hidden = false;
            //console.log(node);
            node.setAttribute('id', img.src);
            node.setAttribute('style', `position: absolute; left:${img.x}px; top:${img.y}px; z-index:${z}; cursor: grab;`);
            z += 1;   
            x0 += 50;
            y0 += 50;                
        }
    }
}
        
function getClass(width, height) {
    // Math.random()
    // (images.get(src).width, images.get(src).height) => {return ()};
    if (width > height)
        return 'car', 'bench';
    else 
        return 'person', 'tv';
}

function createRequest() {
    /* input JSON
    {“background”: “base64”,
        “foreground”: [{“object”: “base64”, “class”: “person”}, 
            {“object”: “base64”, “class”: “cat”}]} 
    output 
    {
        “composition”: [“base64”, 
            “base64”], 
        “properties“: [prop, prop]
        prop — [{“x“: x, “y“: y, “w“: w, “h“: h}, ...]
    }
    */
    let img = background.lastChild;
    let src = img.src;
    let objects = [];
    let base = sourses.get(src);
    let params = new Object;
    params["background"] = base;

    for (const node of (foreground.childNodes)) {
        if (node.nodeType == 1) {
            img = node.firstChild;
            src = img.src;
            base = sourses.get(src);
            objects.push({
                "object": `${base}`,
                "class": "person",
            });
        }
    }

    params["foreground"] = objects;
    let json = JSON.stringify(params);
    
    fetch(
        'http://109.188.135.85:5813/composition',
        {
            method: 'POST',
            // headers: { 'Content-Type': 'application/json' },
            mode:'no-cors',
            body: json,
        }
    )
    .then(( response ) => console.log(response.json()))
	.then( ( data ) => console.log( data ) ); 
}

function uploadTemplate() {}

const movable = foreground; 
let currentMovable = null;
const currentMovableOffset = {
	x: 0,
	y: 0,
};

function moveHandler( event )
{
	const docRect = document.documentElement.getBoundingClientRect();
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


