import { Board } from "../Board.js";
import { LogicalElem } from "./LogicalElem.js";
import { InputSocket, OutputSocket } from "../Socket.js";
import { circleRadius, strokeWidth } from "../main.js";

export class NotGate extends LogicalElem {
    state: boolean;
    output: OutputSocket;
    inputs: InputSocket;
    constructor(board: Board, x: number, y: number, id: number = 0) {
        super(board, x, y, 100, 75, id);
        this.state = false;
        this.inputs = new InputSocket(board, this, circleRadius, this.height / 2, false);
        this.output = new OutputSocket(board, this, this.width - circleRadius, this.height / 2, false);
        this.draw();
    }

    draw() {
        this.setAttributes(this.$svgPart, {
            class: "notGate",
            "stroke-width": strokeWidth,
        });

        this.$svgPart.append(
            this.createSvgElement("path", {
                d: `M${circleRadius} 0 
                    v75
                    L${this.width - circleRadius} ${this.height / 2} 
                    Z`,
                fill: "none",
            })
        );

        this.$svgPart.append(this.inputs.getSvg());
        this.$svgPart.append(this.output.getSvg());

        this.board.$board.append(this.$svgPart);
        return this;
    }

    render() {
        super.render();
        this.inputs.x = circleRadius + this.x;
        this.inputs.y = this.y + this.height / 2;
        this.output.x = this.x + this.width - circleRadius;
        this.output.y = this.y + this.height / 2;

        this.output.state = !this.inputs.state;
        this.output.state ? this.$svgPart.classList.add("active") : this.$svgPart.classList.remove("active");
    }
}
