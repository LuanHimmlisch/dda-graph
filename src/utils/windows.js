import { makeDraggable } from "./draggable";

function registerWindows() {
    document.querySelectorAll('.window')
        .forEach((v) => makeDraggable(v));
}

export {
    registerWindows
};