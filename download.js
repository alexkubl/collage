
export function download() {
    let canvas = document.createElement('canvas');
    canvas = document.body.appendChild(canvas);
    let image = document.getElementById('backImg');
    canvas.setAttribute('width',  `${image.width}`);
    canvas.setAttribute('height', `${image.height}`);

    let ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    canvas.setAttribute('style', 'display: none;');

    let objects = document.getElementById('foreground').children;
    for (let each of objects) {
        let img = each.children[0];
        let top = each.style.top.split('px')[0];
        let left = each.style.left.split('px')[0];
        ctx.drawImage(img, left, top, img.width, img.height); 
    }

    let anchor = document.createElement("a");
    anchor.download = "download.png";
    anchor.href = canvas.toDataURL('image/' + 'png');
   
    anchor.click();
    anchor.remove();

    document.body.removeChild(document.querySelector('canvas'));
}