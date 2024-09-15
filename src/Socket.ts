import { LogicalElem } from "./LogicalElems/LogicalElem.js";
import { SVGElem } from "./SVGElem.js";
import { circleRadius, strokeWidth } from "./main.js";
import { Wire } from "./Wire";
import { Board } from "./Board.js";

abstract class Socket extends SVGElem {
    board: Board;
    state: boolean;
    gate: LogicalElem;
    $circle: SVGElement;
    constructor(board: Board, gate: LogicalElem, x: number, y: number, state = false) {
        super(x, y, circleRadius * 2, circleRadius * 2);
        this.board = board;
        this.state = state;
        this.gate = gate;
        this.$circle = this.getCircle();
    }

    getCircle() {
        const $circle = this.createSvgElement("circle", {
            cx: this.x,
            cy: this.y,
            r: circleRadius - strokeWidth / 2,
            fill: "none",
            "stroke-width": strokeWidth,
            class: "socket",
        });
        return $circle;
    }

    render() {
        this.state ? this.$circle.classList.add("active") : this.$circle.classList.remove("active");
    }
}

export class InputSocket extends Socket {
    wire: Wire | null;
    constructor(board: Board, gate: LogicalElem, x: number, y: number, state: boolean) {
        super(board, gate, x, y, state);
        this.wire = null;
    }

    getSvg() {
        this.$circle.classList.add("input");
        this.$circle.addEventListener("click", (e) => {
            const outputSocket = this.gate.board.activeSocket;

            if (outputSocket && outputSocket.gate !== this.gate) {
                if (this.wire) {
                    this.wire.remove();
                    outputSocket.$circle.classList.remove("highlight");
                    this.gate.board.activeSocket = null;
                } else {
                    new Wire(this.gate.board, this, outputSocket);
                    outputSocket.$circle.classList.remove("highlight");
                    this.gate.board.activeSocket = null;
                }
            }

            e.stopPropagation();
        });
        return this.$circle;
    }
}

export class OutputSocket extends Socket {
    wires: Wire[];
    constructor(board: Board, gate: LogicalElem, x: number, y: number, state: boolean) {
        super(board, gate, x, y, state);
        this.wires = [];
    }

    getSvg() {
        this.$circle.classList.add("output");
        this.$circle.addEventListener("click", (e) => {
            const activeSocket = this.gate.board.activeSocket;
            if (activeSocket === this) {
                this.$circle.classList.remove("highlight");
                this.gate.board.activeSocket = null;
            } else {
                if (activeSocket) {
                    activeSocket.$circle.classList.remove("highlight");
                    this.gate.board.activeSocket = null;
                }
                this.gate.board.activeSocket = this;
                this.$circle.classList.add("highlight");
            }

            e.stopPropagation();
        });

        return this.$circle;
    }
}
