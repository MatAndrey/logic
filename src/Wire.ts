import { Board } from "./Board";
import { LogicalElem } from "./LogicalElems/LogicalElem";
import { SVGElem } from "./SVGElem";
import { InputSocket, OutputSocket } from "./Socket";
import { circleRadius, strokeWidth } from "./main";

export class Wire extends SVGElem {
    board: Board;
    state: boolean;
    input: InputSocket;
    output: OutputSocket;
    constructor(board: Board, input: InputSocket, output: OutputSocket) {
        super(0, 0, 0, 0);
        this.board = board;
        this.input = input;
        this.output = output;
        this.state = input.state;
        output.wires.push(this);
        input.wire = this;
        this.draw();
    }

    remove() {
        this.input.wire = null;
        this.input.state = false;
        const index = this.output.wires.indexOf(this);
        if (index > -1) {
            this.output.wires.splice(index, 1);
            this.$svgPart.remove();
        }
    }

    render() {
        this.state = this.output.state;
        this.input.state = this.state;

        this.state ? this.$svgPart.classList.add("active") : this.$svgPart.classList.remove("active");

        const oX = this.output.x - this.x + 10;
        const oY = this.output.y - this.y + 10;
        const iX = this.input.x - this.x + 10;
        const iY = this.input.y - this.y + 10;

        const dx = iX - oX;
        const dy = iY - oY;

        const path = this.$svgPart.children[0] as SVGElement;

        if (path) {
            this.setAttributes(path, {
                d: dx > 20 + circleRadius ? `m${oX},${oY} h20 v${dy} h${dx - 20}` : `m${oX},${oY} h10 v${dy / 2} h${dx - 20} v${dy / 2} h10`,
            });
            this.x = Math.min(this.output.x, this.input.x);
            this.y = Math.min(this.output.y, this.input.y);
            this.width = Math.abs(this.output.x - this.input.x);
            this.height = Math.abs(this.output.y - this.input.y);

            this.setAttributes(this.$svgPart, {
                x: this.x - 10,
                y: this.y - 10,
                width: this.width + 20,
                height: this.height + 20,
            });
        }
    }

    draw() {
        this.setAttributes(this.$svgPart, { class: "wire" });

        this.$svgPart.append(
            this.createSvgElement("path", {
                "stroke-width": strokeWidth,
                fill: "none",
            })
        );

        this.board.$board.prepend(this.$svgPart);
        return this;
    }

    static connectElements(board: Board, from?: LogicalElem, to?: LogicalElem) {
        if (from && to) {
            if (Array.isArray(to.inputs)) {
                new Wire(board, to.inputs[0].wire ? to.inputs[1] : to.inputs[0], from.output as OutputSocket);
            } else {
                new Wire(board, to.inputs as InputSocket, from.output as OutputSocket);
            }
        }
    }
}
