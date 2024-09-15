import { AndGate } from "./LogicalElems/AndGate.js";
import { OrGate } from "./LogicalElems/OrGate.js";
import { Lamp } from "./LogicalElems/Lamp.js";
import { Source } from "./LogicalElems/Source.js";
import { Toggle } from "./LogicalElems/Toggle.js";
import { NotGate } from "./LogicalElems/NotGate.js";
import { SVGElem } from "./SVGElem";
import { LogicalElem } from "./LogicalElems/LogicalElem.js";
import { OutputSocket } from "./Socket";
import { Wire } from "./Wire.js";
import { EventController } from "./EventController.ts";
import { XorGate } from "./LogicalElems/XorGate.ts";

interface SaveData {
    id: number;
    x: number;
    y: number;
    name: string;
    outputs: number[] | undefined;
}

export const logicalConstructors = [AndGate, OrGate, Lamp, Source, Toggle, NotGate, XorGate];

export class Board extends SVGElem {
    $board: SVGElement;
    $grid: SVGElement;
    $container: HTMLElement;
    elements: LogicalElem[] = [];
    actualID = 1;
    eventController: EventController;
    activeSocket: OutputSocket | null;

    constructor(container: HTMLElement) {
        super(0, 0, container.clientWidth, container.clientHeight);
        this.$container = container;
        this.$board = this.createSvgElement("svg");
        this.$grid = this.drawGrid();

        this.activeSocket = null;
        this.eventController = new EventController(this);
        this.draw();
        // this.loadFromLocalStorage();
    }

    render() {
        this.setAttributes(this.$board, {
            viewBox: `${this.x} ${this.y} ${this.width} ${this.height}`,
        });

        if (this.$grid) {
            this.setAttributes(this.$grid, {
                x: this.x,
                y: this.y,
            });
        }

        this.elements.forEach((e) => e.render());
        setTimeout(() => {
            this.render();
        }, 10);
    }

    draw() {
        this.$container.append(this.$board);
        this.setAttributes(this.$board, {
            width: "100%",
            height: "100%",
            viewBox: `${this.x} ${this.y} ${this.width} ${this.height}`,
        });

        this.drawGrid();
        this.drawControlButtons();
        this.render();
    }

    drawControlButtons() {
        this.$container.append(
            ...logicalConstructors.map((item) => {
                const $button = document.createElement("button");
                $button.innerHTML = item.name;
                $button.onclick = () => {
                    const elem = new item(this, 10, 10);
                    this.addElem(elem);
                };
                return $button;
            })
        );
    }

    drawGrid(): SVGElement {
        const defs = this.createSvgElement("defs");
        this.$board.append(defs);

        const smallGridSize = 20;
        const bigGridSize = smallGridSize * 5;

        const smallGrid = this.createSvgElement("pattern", {
            id: "tenthGrid",
            width: smallGridSize,
            height: smallGridSize,
            patternUnits: "userSpaceOnUse",
        });
        defs.append(smallGrid);

        smallGrid.append(
            this.createSvgElement("path", {
                d: `M ${smallGridSize} 0 L 0 0 L 0 ${smallGridSize}`,
                fill: "none",
                stroke: "#eee",
                "stroke-width": "0.5",
            })
        );

        const grid = this.createSvgElement("pattern", {
            id: "grid",
            width: bigGridSize,
            height: bigGridSize,
            patternUnits: "userSpaceOnUse",
        });
        defs.append(grid);

        grid.append(
            this.createSvgElement("rect", {
                width: bigGridSize,
                height: bigGridSize,
                fill: "url(#tenthGrid)",
                stroke: "#ddd",
            })
        );

        const gridRect = this.createSvgElement("rect", {
            width: "100%",
            height: "100%",
            fill: "url(#grid)",
            stroke: "none",
            id: "grid-rect",
        });
        this.$board.append(gridRect);
        return gridRect;
    }

    getActualId() {
        return this.actualID++;
    }

    addElem(elem: LogicalElem | LogicalElem[]) {
        if (Array.isArray(elem)) {
            elem.forEach((el) => {
                el.id = this.getActualId();
                this.elements.push(el);
            });
        } else {
            elem.id = this.getActualId();
            this.elements.push(elem);
        }
    }

    removeElem(elem: LogicalElem | LogicalElem[]) {
        if (Array.isArray(elem)) {
            elem.forEach((el) => {
                this.removeElem(el);
            });
        } else {
            this.elements.splice(this.elements.indexOf(elem), 1);
            elem.$svgPart.remove();
            elem.output?.wires.forEach((wire) => wire.remove());
            if (Array.isArray(elem.inputs)) elem.inputs.forEach((inp) => inp.wire?.remove());
            else elem.inputs?.wire?.remove();
        }
    }

    copyElements(elements: LogicalElem[]): LogicalElem[] {
        const copies: LogicalElem[] = elements.map((el) => {
            const constructor = el.constructor as (typeof logicalConstructors)[number];
            return new constructor(this, el.x, el.y, el.id);
        });
        elements.forEach((original) => {
            const copyPrev = copies.find((el) => el.id === original.id);
            original.output?.wires.forEach((wire) => {
                const copyNext = copies.find((el) => el.id === wire.input.gate.id);
                Wire.connectElements(this, copyPrev, copyNext);
            });
        });
        return copies;
    }

    saveToLacalStorage() {
        const saveData: SaveData[] = [];
        this.elements.forEach((el) => {
            saveData.push({
                name: el.constructor.name,
                x: el.x,
                y: el.y,
                id: el.id,
                outputs: el.output?.wires.map((wire) => wire.input.gate.id),
            });
        });
        saveData.forEach((el) => {
            el.outputs?.forEach((out, outInd) => {
                if (saveData.findIndex((elem) => elem.id === out) === -1) {
                    el.outputs?.splice(outInd, 1);
                }
            });
        });
        localStorage.setItem("scheme", JSON.stringify(saveData));
    }

    loadFromLocalStorage() {
        const savedElements = this.getElemsFromLocalStorage();
        this.addElem(savedElements);
    }

    getElemsFromLocalStorage(): LogicalElem[] {
        const storageData = localStorage.getItem("scheme");
        if (storageData) {
            const saveData: SaveData[] = JSON.parse(storageData);
            const savedElements: LogicalElem[] = [];
            saveData.forEach((element) => {
                const logicalElem = this.createElementFromSaveData(element);
                if (logicalElem) savedElements.push(logicalElem);
            });
            saveData.forEach((element) => {
                const prevId = element.id;
                const prevEl = savedElements.find((el) => el?.id === prevId);
                element.outputs?.forEach((out) => {
                    const nextEl = savedElements.find((el) => el?.id === out);
                    Wire.connectElements(this, prevEl, nextEl);
                });
            });
            return savedElements;
        }
        return [];
    }

    createElementFromSaveData(elementData: SaveData) {
        const constructor = logicalConstructors.find((constructor) => constructor.name === elementData.name);
        if (constructor) return new constructor(this, elementData.x, elementData.y, elementData.id);
    }
}
