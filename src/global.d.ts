/// <reference path="../node_modules/kaplay/dist/declaration/global.d.ts" />

import type Alpine from "alpinejs";
import type { KAPLAYCtx } from "kaplay";

declare global {
    type Algo = {
        name: string,
        beans: number,
        calculate: (points: Vec2[]) => Array<Vec2>,
    }

    type Algorithms = { [key: string]: Algo };

    function calculatePoint(event: Event);
    function selectAlgorithm(name: string);

    var algorithms: Algorithms;
    var Alpine: Alpine;
}
