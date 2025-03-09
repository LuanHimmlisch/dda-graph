/// <reference path="../node_modules/kaplay/dist/declaration/global.d.ts" />

type Algo = {
    name: string,
    beans: number,
    calculate: (points: Vec2[]) => Array<Vec2>,
}

type Algorithms = { [key: string]: Algo };

declare function calculatePoint(event: Event);

declare function selectAlgorithm(name: string);

declare var algorithms: Algorithms;
