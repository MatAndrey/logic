import { Board } from "../Board.js";
import { LogicalElem } from "./LogicalElem.ts";
import { InputSocket } from "../Socket.js";
import { circleRadius, strokeWidth } from "../main.js";

export class Lamp extends LogicalElem {
    inputs: InputSocket;
    output: null;
    constructor(board: Board, x: number, y: number, id: number = 0) {
        super(board, x, y, 50 + circleRadius, 50, id);
        this.inputs = new InputSocket(board, this, circleRadius, 25, false);
        this.output = null;
        this.draw();
    }

    draw() {
        this.setAttributes(this.$svgPart, {
            class: "lamp",
        });

        this.$svgPart.append(
            this.createSvgElement("circle", {
                cx: this.height / 2 + circleRadius,
                cy: this.height / 2,
                r: this.height / 2 - 1,
                "stroke-width": strokeWidth,
            })
        );

        this.$svgPart.append(this.inputs.getSvg());

        this.board.$board.append(this.$svgPart);
        return this;
    }

    render() {
        this.inputs.x = circleRadius + this.x;
        this.inputs.y = this.height / 2 + this.y;
        this.inputs.state ? this.$svgPart.classList.add("active") : this.$svgPart.classList.remove("active");
    }
}
