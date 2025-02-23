import Alpine from "alpinejs";
import { checkForFirstFocus } from "./utils/onfirstfocus";
import { registerWindows } from "./utils/windows";
import { game } from "./game";

registerWindows();

checkForFirstFocus(() => game.play('bg', { volume: 0.2, loop: true }))

Alpine.start();