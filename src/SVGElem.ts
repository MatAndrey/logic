interface Attributes {
    [t: string]: string | number;
}

export abstract class SVGElem {
    x: number;
    y: number;
    width: number;
    height: number;
    $svgPart: SVGElement;
    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.$svgPart = this.createSvgPart();
    }

    createSvgPart() {
        const $part = this.createSvgElement("svg", {
            x: this.x,
            y: this.y,
            style: "pointer-events: bounding-box;",
        });
        return $part;
    }

    createSvgElement(tagName: string, atttibutes?: Attributes) {
        const $element: SVGElement = document.createElementNS("http://www.w3.org/2000/svg", tagName);
        if (atttibutes) this.setAttributes($element, atttibutes);
        return $element;
    }

    setAttributes($svgElement: SVGElement, attributes: Attributes) {
        Object.keys(attributes).forEach((key) => {
            $svgElement.setAttribute(key, String(attributes[key]));
        });
    }
}
