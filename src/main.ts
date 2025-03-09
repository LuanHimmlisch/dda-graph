import { checkForFirstFocus } from "./utils/onfirstfocus";
import { registerWindows } from "./utils/windows";
import { calculatePoint, centerToPoints, game, selectAlgorithm } from "./game";
import algorithms from "./algorithms";

window.algorithms = algorithms;
window.calculatePoint = (e: Event) => {
    e.preventDefault();
    calculatePoint();
    centerToPoints();
}
window.selectAlgorithm = (name: string) => {
    selectAlgorithm(name);
}

registerWindows();

checkForFirstFocus(() => game.play('bg', { volume: 0.2, loop: true }))