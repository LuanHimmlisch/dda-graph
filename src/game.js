import { importAssets } from "./assets";

/** @type {import("kaplay").KAPLAYCtx} */
const k = kaplay({
    canvas: document.querySelector('#game')
});

importAssets(k);

const START_X = 32 * 4;
const END_Y = 32 * 20;

/*
 * Game objects
 */

const bean1 = k.add([sprite("bean"), pos(0, 0), opacity(0), z(15)]);
const bean2 = k.add([sprite("bean"), pos(0, 0), opacity(0), z(15)]);
let interpolations = [];

const newParticles = (x, y) => {
    const data = getSprite('sun').data;
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
    rect(k.width() * 2, 1, { fill: rgb() }),
    pos(0, 0),
    z(20),
])
const mouseVertical = k.add([
    rect(1, k.height() * 2, { fill: rgb() }),
    pos(0, 0),
    z(20),
])

/*
 * HTML Elements
 */

const elInputX = document.querySelector('#input-x');
const elInputY = document.querySelector('#input-y');
const elInputX2 = document.querySelector('#input-x2');
const elInputY2 = document.querySelector('#input-y2');
const elTextCoords = document.querySelector('#coords-text');

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

function getCoords(plane = false) {
    const x = elInputX.value;
    const y = elInputY.value;
    const x2 = elInputX2.value;
    const y2 = elInputY2.value;

    const data = { x, y, x2, y2 };

    Object.keys(data).forEach((k) => {
        data[k] = parseInt(data[k]);

        if (isNaN(data[k])) {
            data[k] = 0;
        }

        if (plane) return;

        if (k.startsWith('x')) {
            data[k] = planeToWorldX(data[k]);;
        } else {
            data[k] = planeToWorldY(data[k]);;
        }
    });

    return data;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function planeToWorldX(planeX) {
    return START_X + planeX * 32;
}

function planeToWorldY(planeY) {
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

function syncBeans() {
    const { x, y, x2, y2 } = getCoords();

    bean1.pos = new Vec2(x - bean1.width / 2, y - bean1.height / 2);
    bean2.pos = new Vec2(x2 - bean2.width / 2, y2 - bean2.height / 2);

    bean1.opacity = 1;
    bean2.opacity = 1;
}

function clearBeans() {
    interpolations.forEach((v) => v.destroy());
    interpolations = [];
}

let prev1 = new Vec2(0, 0);
let prev2 = new Vec2(0, 0);

function calculatePoint() {
    // Plane coords
    const { x, y, x2, y2 } = getCoords(true);

    clearBeans();
    syncBeans();

    const deltaX = x2 - x;
    const deltaY = y2 - y;

    const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));

    const incrementX = deltaX / steps;
    const incrementY = deltaY / steps;

    let iX = x;
    let iY = y;

    const data = [
        [iX, iY]
    ];

    for (let i = 0; i < steps; i++) {
        iX += incrementX;
        iY += incrementY;

        const mark = k.add([
            sprite('mark'),
            pos(),
            scale(0.5),
        ]);

        mark.pos = new Vec2(
            planeToWorldX(iX) - (mark.width * mark.scale.x / 2),
            planeToWorldY(iY) - (mark.height * mark.scale.y / 2),
        )

        data.push([iX.toFixed(3) * 1, iY.toFixed(3) * 1]);
        interpolations.push(mark);
    }

    k.play('explosion-' + (getRandomInt(4) + 1))

    if (!prev1.eq(bean1.pos)) {
        newParticles(bean1.pos.x, bean1.pos.y);
    }

    if (!prev2.eq(bean2.pos)) {
        newParticles(bean2.pos.x, bean2.pos.y);
    }

    prev1 = bean1.pos.clone();
    prev2 = bean2.pos.clone();

    k.shake(40)

    window.dispatchEvent(new CustomEvent('calculated', {
        detail: data
    }));
}

window.calculatePoint = (e) => {
    e.preventDefault();
    calculatePoint();

    return false;
}


k.onMousePress((action) => {
    const mouse = getPlaneMousePos();

    if (action === 'left') {
        elInputX.value = mouse.x;
        elInputY.value = mouse.y;
    } else if (action === 'right') {
        elInputX2.value = mouse.x;
        elInputY2.value = mouse.y;
    } else {
        return;
    }

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

initPlane();

export { k as game };