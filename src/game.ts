import type { GameObj, KAPLAYCtx, OpacityComp, PosComp, Vec2 } from "kaplay";
import { importAssets } from "./assets";
import algorithms from "./algorithms";
// import Alpine from "alpinejs";

const k: KAPLAYCtx = kaplay({
    canvas: document.querySelector('#game')! as HTMLCanvasElement
});

importAssets(k);

const START_X = 32 * 4;
const END_Y = 32 * 20;

/*
 * Game objects
 */

let elInputs: Array<[HTMLInputElement, HTMLInputElement]> = [];

const beans = new Set<GameObj<PosComp | OpacityComp>>();

let selectedAlgorithm: Algo = algorithms['line'];

const initBeans = () => {
    beans.forEach((v) => v.destroy());
    beans.clear();

    for (let index = 0; index < selectedAlgorithm.beans; index++) {
        beans.add(
            k.add([sprite("bean"), pos(0, 0), opacity(0), z(15), anchor('center')])
        );
    }
}

export function selectAlgorithm(name: string) {

    clearBeans();

    selectedAlgorithm = algorithms[name];

    dispatch('algo', { algo: selectedAlgorithm, name });

    window.Alpine.nextTick(() => {
        elInputs = [];
        document.querySelectorAll('input[id^=coord-]').forEach((v) => {
            const i = parseInt(v.id.slice(-1));
            const els = elInputs[i] ?? [];

            if (v.id.startsWith('coord-x-')) {
                els[0] = v as HTMLInputElement;
            } else if (v.id.startsWith('coord-y-')) {
                els[1] = v as HTMLInputElement;
            }

            elInputs[i] = els;
        })
    })

    initBeans();
}

function dispatch(name: string, data: { [key: string]: any } = {}) {
    window.dispatchEvent(new CustomEvent(name, {
        detail: data
    }));
}

export function getCoords(plane = false): Array<Vec2> {
    return elInputs.map((v) => {
        let x = parseInt(v[0].value);
        let y = parseInt(v[1].value);

        if (isNaN(x)) x = 0;
        if (isNaN(y)) y = 0;

        if (plane) return vec2(x, y);

        return vec2(planeToWorldX(x), planeToWorldY(y));
    })
}

let interpolations: Array<GameObj> = [];

export function newParticles(x: number, y: number) {
    const data = getSprite('sun')!.data!;
    const particle = k.add([
        pos(x, y),
        particles(
            {
                max: 20,
                lifeTime: [1, 2.5],
                speed: [100, 200],
                damping: [0, 0.5],
                angle: [0, 360],
                angularVelocity: [0, 100],
                scales: [1.0, 0.5, 0.0],
                opacities: [1.0, 0.0],
                texture: data.tex,
                quads: data.frames,
            },
            {
                shape: new Rect(vec2(0), 32, 32),
                lifetime: 5, //
                rate: 5,
                direction: 0,
                spread: 180,
            },
        ),
        z(20),
    ]);

    particle.onEnd(() => destroy(particle));

    particle.emit(5);

    return particle;
}

const mouseHorizontal = k.add([
    // @ts-ignore
    rect(k.width() * 2, 1, { fill: rgb() }),
    pos(0, 0),
    z(20),
])
const mouseVertical = k.add([
    // @ts-ignore
    rect(1, k.height() * 2, { fill: rgb() }),
    pos(0, 0),
    z(20),
])

/*
 * HTML Elements
 */

const elTextCoords: HTMLParagraphElement = document.querySelector('#mouse-text')!;

// @ts-ignore
setBackground('#2a303c');

function initPlane() {
    const width = k.width() * 2;
    const height = k.height() * 2;

    const vertical = k.add([
        rect(3, height * 2),
        pos(START_X - 2, -height / 2),
        color(71, 81, 102)
    ]);

    const horizontal = k.add([
        rect(width * 2, 3),
        pos(0 - width - START_X / 2, END_Y - 2),
        color(71, 81, 102)
    ]);

    let x = vertical.pos.x - (Math.floor(width / 32) / 2 * 32);

    while (x < width) {
        x += 32;

        k.add([
            rect(1, height * 2),
            pos(x, -height / 2),
            color(53, 61, 76)
        ])
    }

    let y = -height / 2

    while (y < (height * 2)) {
        y += 32;

        k.add([
            rect(width * 2, 1),
            pos(-width / 2, y),
            color(53, 61, 76)
        ])
    }
}

export function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function planeToWorldX(planeX: number) {
    return START_X + planeX * 32;
}

export function planeToWorldY(planeY: number) {
    return END_Y - planeY * 32;
}

function getPlaneMousePos() {
    const mouse = mousePos();
    const worldPos = toWorld(mouse);

    return {
        x: Math.round((worldPos.x - START_X) / 32),
        y: Math.round((END_Y - worldPos.y) / 32),
    }
}

export function syncBeans() {
    const allBeans = [...beans.values()];

    getCoords().forEach((vector, i) => {
        allBeans[i].pos = vector;
        allBeans[i].opacity = 1;
    })
}

export function clearBeans() {
    interpolations.forEach((v) => v.destroy());
    interpolations = [];
}

export function paintInterpolation(x: number = 0, y: number = 0) {
    const mark = k.add([
        sprite('mark'),
        pos(x, y),
        scale(0.5),
        anchor('center'),
    ]);

    interpolations.push(mark);

    return mark;
}

let previousPositions: Array<Vec2> = [];

export function calculatePoint() {
    const algo = selectedAlgorithm;
    const points = getCoords(true)

    const data = algo.calculate(points);

    k.play('explosion-' + (getRandomInt(4) + 1))

    const allBeans = [...beans.values()];

    for (let index = 0; index < algo.beans; index++) {
        const prevVector = previousPositions[index] ?? vec2(0, 0);
        const currentVector = allBeans[index].pos;

        if (!prevVector.eq(currentVector)) {
            newParticles(currentVector.x, currentVector.y);
        }

        previousPositions[index] = prevVector.clone();
    }

    k.shake(40)

    dispatch('calculated', data);
}

export function centerToPoints() {
    const points = getCoords();

    const x = points.reduce((prev, v) => prev + v.x, 0) / points.length;
    const y = points.reduce((prev, v) => prev + v.y, 0) / points.length;

    k.setCamPos(x, y);
}

let currentPoint = 0;

k.onMousePress((action) => {
    const mouse = getPlaneMousePos();

    if (action === 'left') {
        currentPoint += 1;
    } else if (action === 'right') {
        currentPoint -= 1;
    } else {
        return;
    }

    if (currentPoint < 0) {
        currentPoint = selectedAlgorithm.beans - 1;
    } else if (currentPoint >= selectedAlgorithm.beans) {
        currentPoint = 0;
    }

    elInputs[currentPoint][0].value = `${mouse.x}`;
    elInputs[currentPoint][1].value = `${mouse.y}`;

    calculatePoint();
})

k.onScroll((delta) => {
    const toVector = k.getCamScale().sub(
        k.vec2(delta.y).scale(0.001)
    );

    toVector.x = Math.max(Math.min(toVector.x, 1.5), 0.5);
    toVector.y = Math.max(Math.min(toVector.y, 1.5), 0.5);


    k.setCamScale(toVector);
})

k.onKeyPress('space', () => {
    k.setCamPos(k.center());
    k.setCamScale(1);
});

k.onMouseMove((mouse, delta) => {
    if (k.isMouseDown('middle')) {
        k.setCamPos(
            k.getCamPos().sub(delta)
        );
    }

    elTextCoords.textContent = `${mouse.x},${mouse.y}`;

    const worldPos = toWorld(mouse);

    mouseVertical.pos = k.vec2(worldPos.x, worldPos.y - mouseVertical.height / 2)
    mouseHorizontal.pos = k.vec2(worldPos.x - mouseHorizontal.width / 2, worldPos.y)
});

k.onLoad(() => {
    selectAlgorithm('line');

    window.Alpine.nextTick(() => {
        dispatch('loaded')
    });
})

initPlane();

export { k as game };