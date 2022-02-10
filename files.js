export class Img {
    images = new Map();
    sourses = new Map();  // src: base64

    updateImage(image, data) {
        image.height = data.height;
        image.width = data.width;
        image.style.left = data.x + 'px';
        image.style.top = data.y + 'px';
    }
    addSourse(src, base) {
        this.sourses.set(src, base);
    }

    addImage(src, data) {
        if (this.images.has(src)) // if in images already exists image with this src
        {
            this.images.set(
                src, 
                {
                    ...this.images.get(src),
                    ...data,
                },
            );
            this.updateImage(image, data);
            return;
        }
        const image = new Image();
        image.src = src;
        this.updateImage(image, data);
        this.images.set(
            src, 
            {
                ...data,
                image,
            },
        );
    }
}

