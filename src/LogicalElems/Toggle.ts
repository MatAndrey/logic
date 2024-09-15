import { Board } from "../Board.js";
import { LogicalElem } from "./LogicalElem.js";
import { InputSocket, OutputSocket } from "../Socket.js";
import { circleRadius, strokeWidth } from "../main.js";

export class Toggle extends LogicalElem {
    state: boolean;
    output: OutputSocket;
    inputs: InputSocket;
    constructor(board: Board, x: number, y: number, id: number = 0) {
        super(board, x, y, 150, 35, id);
        this.state = false;
        this.inputs = new InputSocket(board, this, circleRadius, 25, false);
        this.output = new OutputSocket(board, this, this.width - circleRadius, 25, false);
        this.draw();
    }

    toggle() {
        this.state = !this.state;
    }

    draw() {
        this.setAttributes(this.$svgPart, {
            class: "toggle",
            "stroke-width": strokeWidth,
        });

        this.$svgPart.addEventListener("click", () => {
            this.toggle();
        });

        this.$svgPart.append(this.inputs.getSvg());
        this.$svgPart.append(this.output.getSvg());

        this.$svgPart.append(
            this.createSvgElement("line", {
                x1: circleRadius,
                y1: 25,
                x2: circleRadius + 40,
                y2: 25,
            })
        );

        this.$svgPart.append(
            this.createSvgElement("line", {
                x1: this.width - circleRadius,
                y1: 25,
                x2: this.width - circleRadius - 40,
                y2: 25,
            })
        );

        this.$svgPart.append(
            this.createSvgElement("line", {
                x1: circleRadius + 40,
                y1: 25,
                x2: this.width - circleRadius - 40,
                y2: this.state ? 25 : 5,
                id: "switch",
            })
        );

        this.board.$board.append(this.$svgPart);
        return this;
    }

    render() {
        super.render();
        this.inputs.x = this.x + circleRadius;
        this.inputs.y = this.y + 25;
        this.output.x = this.x + this.width - circleRadius;
        this.output.y = this.y + 25;
        const $switch = this.$svgPart.querySelector("#switch")!;
        $switch.setAttribute("y2", String(this.state ? 25 : 5));

        this.output.state = this.state && this.inputs.state;
        this.output.state ? this.$svgPart.classList.add("active") : this.$svgPart.classList.remove("active");
    }
}
