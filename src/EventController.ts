import { Board } from "./Board";
import { LogicalElem } from "./LogicalElems/LogicalElem";

export class EventController {
    board: Board;
    selectedElemets: LogicalElem[];

    constructor(board: Board) {
        this.board = board;
        this.selectedElemets = [];

        this.addBoardMoveEvents();
        this.addZoomEvents();
        this.addSelectEvents();
        this.addCopyPasteElents();
        window.addEventListener("beforeunload", () => this.board.saveToLacalStorage());
    }

    addElementToSelected(element: LogicalElem | LogicalElem[]) {
        if (Array.isArray(element)) {
            element.forEach((el) => {
                this.selectedElemets.push(el);
                el.$svgPart.classList.add("selected");
            });
        } else {
            this.selectedElemets.push(element);
            element.$svgPart.classList.add("selected");
        }
    }

    clearSelectedElements() {
        this.selectedElemets.forEach((el) => el.$svgPart.classList.remove("selected"));
        this.selectedElemets = [];
    }

    addCopyPasteElents() {
        let copyBuffer: LogicalElem[] = [];
        // Copy & Paste
        document.body.addEventListener("keydown", (e) => {
            if (e.ctrlKey) {
                if (e.key == "c") {
                    if (this.selectedElemets) {
                        copyBuffer = this.selectedElemets;
                    }
                }
                if (e.key == "v") {
                    if (copyBuffer) {
                        const copies = this.board.copyElements(copyBuffer);
                        this.board.addElem(copies);
                        this.clearSelectedElements();
                        this.addElementToSelected(copies);
                    }
                }
            }
            if (e.key === "Delete") {
                this.board.removeElem(this.selectedElemets);
            }
        });
    }

    addBoardMoveEvents() {
        // Move board viewBox
        let rigthDown = { x: 0, y: 0 };
        let startCoords = { x: 0, y: 0 };
        let isRightDown = false;
        this.board.$board.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
        this.board.$board.addEventListener("mousedown", (e) => {
            if (e.button === 2) {
                isRightDown = true;
                rigthDown = { x: e.clientX, y: e.clientY };
                startCoords = { x: this.board.x, y: this.board.y };
            }
        });
        this.board.$board.addEventListener("mouseup", () => {
            isRightDown = false;
        });
        this.board.$board.addEventListener("mousemove", (e) => {
            if (isRightDown) {
                const ratio = this.board.$container.clientHeight / this.board.height;

                this.board.x = (rigthDown.x - e.clientX) / ratio + startCoords.x;
                this.board.y = (rigthDown.y - e.clientY) / ratio + startCoords.y;
            }
        });
    }

    addZoomEvents() {
        // Zoom in & Zoom out
        this.board.$board.addEventListener("wheel", (e) => {
            const { deltaY, offsetX, offsetY } = e;
            const zoomFactor = 1.5;
            if (deltaY === -100) {
                if (this.board.width > 50 && this.board.height > 50) {
                    const oldRatio = this.board.$container.clientHeight / this.board.height;

                    this.board.width = this.board.width / zoomFactor;
                    this.board.height = this.board.height / zoomFactor;

                    const newRatio = this.board.$container.clientHeight / this.board.height;
                    this.board.x = this.board.x + offsetX / oldRatio - offsetX / newRatio;
                    this.board.y = this.board.y + offsetY / oldRatio - offsetY / newRatio;
                }
            } else {
                if (this.board.width < 5000 && this.board.height < 5000) {
                    const oldRatio = this.board.$container.clientHeight / this.board.height;

                    this.board.width = this.board.width * zoomFactor;
                    this.board.height = this.board.height * zoomFactor;

                    const newRatio = this.board.$container.clientHeight / this.board.height;
                    this.board.x = this.board.x + offsetX / oldRatio - offsetX / newRatio;
                    this.board.y = this.board.y + offsetY / oldRatio - offsetY / newRatio;
                }
            }
        });
    }

    addSelectEvents() {
        // Select elements
        let isLeftDown = false;
        let leftDown = { x: 0, y: 0 };
        let selectOptions = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
        document.addEventListener("dblclick", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const sel = document.getSelection();
            sel?.removeAllRanges();
        });
        let selectFrame: SVGElement | null = null;
        this.board.$board.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
                isLeftDown = true;
                leftDown = { x: e.clientX, y: e.clientY };
            }
        });
        this.board.$board.addEventListener("mouseup", (e) => {
            isLeftDown = false;

            if (leftDown.x === e.x && leftDown.y === e.y) {
                this.clearSelectedElements();
            }

            if (selectFrame) {
                this.clearSelectedElements();
                this.board.elements.forEach((el) => {
                    if (
                        el.x >= selectOptions.x &&
                        el.y >= selectOptions.y &&
                        el.x + el.width <= selectOptions.x + selectOptions.width &&
                        el.y + el.height <= selectOptions.y + selectOptions.height
                    ) {
                        this.addElementToSelected(el);
                    }
                });
            }

            selectFrame?.remove();
            selectFrame = null;
        });
        this.board.$board.addEventListener("mousemove", (e) => {
            if (isLeftDown) {
                const ratio = this.board.$container.clientHeight / this.board.height;
                if (selectFrame) {
                    selectOptions = {
                        x: Math.min(leftDown.x, e.clientX) / ratio + this.board.x,
                        y: Math.min(leftDown.y, e.clientY) / ratio + this.board.y,
                        width: Math.abs(e.clientX - leftDown.x) / ratio,
                        height: Math.abs(e.clientY - leftDown.y) / ratio,
                    };
                    this.board.setAttributes(selectFrame, {
                        ...selectOptions,
                        "stroke-width": 1 / ratio,
                    });
                } else {
                    selectFrame = this.board.createSvgElement("rect", {
                        class: "select-frame",
                    });
                    this.board.$board.append(selectFrame);
                }
            }
        });
    }
}
