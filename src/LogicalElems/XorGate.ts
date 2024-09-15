import { Board } from "../Board.js";
import { LogicalElem } from "./LogicalElem.js";
import { InputSocket, OutputSocket } from "../Socket.js";
import { circleRadius, strokeWidth } from "../main.js";

export class XorGate extends LogicalElem {
    state: boolean;
    output: OutputSocket;
    inputs: InputSocket[];
    constructor(board: Board, x: number, y: number, id: number = 0) {
        super(board, x, y, 100, 75, id);
        this.state = false;
        this.inputs = [
            new InputSocket(board, this, circleRadius, this.height / 4, false),
            new InputSocket(board, this, circleRadius, (this.height / 4) * 3, false),
        ];
        this.output = new OutputSocket(board, this, this.width - circleRadius, this.height / 2, false);
        this.draw();
    }

    draw() {
        this.setAttributes(this.$svgPart, {
            class: "xorGate",
            "stroke-width": strokeWidth,
        });

        this.$svgPart.append(
            this.createSvgElement("path", {
                d: `
                    M 0 0
                    a 70 70 1 0 1 0 75
                    M 5 0
                    a 70 70 1 0 1 0 75
                    h 40
                    C 65,70 85,55 ${this.width - circleRadius},${this.height / 2}
                    M 5 0
                    h 40
                    C 65,5 85,20 ${100 - circleRadius},${this.height / 2}
                    `,
                fill: "none",
            })
        );

        this.$svgPart.append(this.inputs[0].getSvg());
        this.$svgPart.append(this.inputs[1].getSvg());
        this.$svgPart.append(this.output.getSvg());

        this.board.$board.append(this.$svgPart);
        return this;
    }

    render() {
        super.render();
        this.inputs[0].x = circleRadius + this.x;
        this.inputs[0].y = this.y + this.height / 4;
        this.inputs[1].x = circleRadius + this.x;
        this.inputs[1].y = this.y + (this.height / 4) * 3;
        this.output.x = this.x + this.width - circleRadius;
        this.output.y = this.y + this.height / 2;

        this.output.state = this.inputs[0].state != this.inputs[1].state;
        this.output.state ? this.$svgPart.classList.add("active") : this.$svgPart.classList.remove("active");
    }
}
