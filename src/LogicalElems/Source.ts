import { OutputSocket } from "../Socket";
import { LogicalElem } from "./LogicalElem";
import { Board } from "../Board";
import { circleRadius } from "../main";

export class Source extends LogicalElem {
    output: OutputSocket;
    inputs: null;
    constructor(board: Board, x: number, y: number, id: number = 0) {
        super(board, x, y, circleRadius * 2, circleRadius * 2, id);
        this.output = new OutputSocket(board, this, circleRadius, circleRadius, true);
        this.inputs = null;
        this.draw();
    }

    draw() {
        this.setAttributes(this.$svgPart, {
            class: "source",
        });

        this.$svgPart.append(this.output.getSvg());

        this.board.$board.append(this.$svgPart);
        return this;
    }

    render() {
        super.render();
        this.output.x = circleRadius + this.x;
        this.output.y = circleRadius + this.y;
    }
}
