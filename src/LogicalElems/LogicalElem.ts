import { Board } from "../Board";

import { InputSocket, OutputSocket } from "../Socket";

import { SVGElem } from "../SVGElem";

export abstract class LogicalElem extends SVGElem {
    board: Board;
    id: number;
    abstract inputs: InputSocket[] | InputSocket | null;
    abstract output: OutputSocket | null;
    constructor(board: Board, x: number, y: number, width: number, height: number, id: number = 0) {
        super(x, y, width, height);
        this.board = board;
        this.id = id || board.getActualId();
        this.$svgPart = this.createSvgPart();
    }

    createSvgPart() {
        let isDown = false;
        let mouseDown = { x: 0, y: 0 };
        this.$svgPart = super.createSvgPart();
        let startPosition = { x: 0, y: 0 };

        this.$svgPart.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
                isDown = true;
                mouseDown = { x: e.clientX, y: e.clientY };
                startPosition = { x: this.x, y: this.y };
            }

            e.stopPropagation();
        });

        this.$svgPart.addEventListener("mouseup", (e) => {
            isDown = false;
            e.preventDefault();
            e.stopPropagation();
        });

        this.$svgPart.addEventListener("mousemove", (e) => {
            e.preventDefault();

            if (isDown) {
                const ratio = this.board.$container.clientHeight / this.board.height;
                const offsetX = (e.clientX - mouseDown.x) / ratio;
                const offsetY = (e.clientY - mouseDown.y) / ratio;
                mouseDown = { x: e.clientX, y: e.clientY };
                if (this.board.eventController.selectedElemets.includes(this)) {
                    this.board.eventController.selectedElemets.forEach((el) => {
                        el.x += offsetX;
                        el.y += offsetY;
                        el.setAttributes(el.$svgPart, {
                            x: el.x,
                            y: el.y,
                        });
                    });
                } else {
                    this.x += offsetX;
                    this.y += offsetY;

                    this.setAttributes(this.$svgPart, {
                        x: this.x,
                        y: this.y,
                    });
                }
            }
        });

        return this.$svgPart;
    }

    draw(): LogicalElem {
        return this;
    }

    render() {
        if (this.output?.wires) {
            this.output.wires.forEach((el) => {
                el.render();
            });
        }
    }
}
