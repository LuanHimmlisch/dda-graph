import { Vec2 } from "kaplay";
import {
    clearBeans,
    paintInterpolation,
    planeToWorldX,
    planeToWorldY,
    syncBeans,
} from "./game";

export default {
    line: {
        name: "Línea",
        beans: 2,
        calculate(points: Vec2[]): Array<Vec2> {
            // Plane coords
            const [vector1, vector2] = points;

            clearBeans();
            syncBeans();

            const deltaX = vector2.x - vector1.x;
            const deltaY = vector2.y - vector1.y;

            const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));

            const incrementX = deltaX / steps;
            const incrementY = deltaY / steps;

            let iX = vector1.x;
            let iY = vector1.y;

            const data = [
                vec2(iX, iY),
            ];

            for (let i = 0; i < steps; i++) {
                iX += incrementX;
                iY += incrementY;

                const mark = paintInterpolation();

                mark.pos = vec2(
                    planeToWorldX(iX),
                    planeToWorldY(iY),
                );

                data.push(vec2(
                    parseFloat(iX.toFixed(3)),
                    parseFloat(iY.toFixed(3)),
                ));
            }

            return data;
        },
    },
    triangle: {
        name: "Triángulo",
        beans: 3,
        calculate(points: Vec2[]): Array<Vec2> {
            const [vector1, vector2, vector3] = points;

            clearBeans();
            syncBeans();

            const minX = Math.min(vector1.x, vector2.x, vector3.x);
            const maxX = Math.max(vector1.x, vector2.x, vector3.x);
            const minY = Math.min(vector1.y, vector2.y, vector3.y);
            const maxY = Math.max(vector1.y, vector2.y, vector3.y);

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const d1 = (vector1.x - vector2.x) * (y - vector1.y) -
                        (vector1.y - vector2.y) * (x - vector1.x);
                    const d2 = (vector2.x - vector3.x) * (y - vector2.y) -
                        (vector2.y - vector3.y) * (x - vector2.x);
                    const d3 = (vector3.x - vector1.x) * (y - vector3.y) -
                        (vector3.y - vector1.y) * (x - vector3.x);

                    if (
                        (d1 >= 0 && d2 >= 0 && d3 >= 0) ||
                        (d1 <= 0 && d2 <= 0 && d3 <= 0)
                    ) {
                        const mark = paintInterpolation();

                        mark.pos = vec2(
                            planeToWorldX(x),
                            planeToWorldY(y),
                        );
                    }
                }
            }

            return [];
        },
    },
    circle: {
        name: "Círculo",
        beans: 2,
        calculate(points) {
            const [vector1, vector2] = points;

            clearBeans();
            syncBeans();

            const midX = vector1.x;
            const midY = vector1.y;
            const radius = Math.round(vector1.dist(vector2));

            const radiusSqr = radius * radius;

            for (let x = -radius; x < radius; x++) {
                const hh = Math.round(
                    Math.sqrt(radiusSqr - x * x),
                );

                const rx = midX + x;
                const ph = midY + hh;

                for (let y = midY - hh; y < ph; y++) {
                    const mark = paintInterpolation();

                    mark.pos = vec2(
                        planeToWorldX(rx),
                        planeToWorldY(y),
                    );
                }
            }

            return [];
        },
    },
    elipsis: {
        name: "Elipsis",
        beans: 3,
        calculate(points: Vec2[]) {
            const [midPoint, radXPoint, radYPoint] = points;

            clearBeans();
            syncBeans();

            const Xc = midPoint.x;
            const Yc = midPoint.y;

            const Rx = Math.round(midPoint.dist(radXPoint));
            const Ry = Math.round(midPoint.dist(radYPoint));

            const draw = (
                x: number,
                y: number,
                Xc: number,
                Yc: number,
            ) => {
                for (let i = -x; i <= x; i++) {
                    for (const [dx, dy] of [[1, 1], [1, -1]]) {
                        const mark = paintInterpolation();

                        mark.pos = vec2(
                            planeToWorldX(Xc + i * dx),
                            planeToWorldY(Yc + y * dy),
                        );
                    }
                }
            };

            let x = 0;
            let y = Ry;
            const Rx2 = Rx * Rx;
            const Ry2 = Ry * Ry;
            let px = 0;
            let py = 2 * Rx2 * y;

            // Región I
            let p1 = Ry2 - Rx2 * Ry + 0.25 * Rx2;
            while (px < py) {
                draw(x, y, Xc, Yc);
                x++;
                px += 2 * Ry2;
                if (p1 < 0) {
                    p1 += Ry2 + px;
                } else {
                    y--;
                    py -= 2 * Rx2;
                    p1 += Ry2 + px - py;
                }
            }

            // Región II
            let p2 = Ry2 * (x + 0.5) ** 2 + Rx2 * (y - 1) ** 2 - Rx2 * Ry2;
            while (y >= 0) {
                draw(x, y, Xc, Yc);
                y--;
                py -= 2 * Rx2;
                if (p2 > 0) {
                    p2 += Rx2 - py;
                } else {
                    x++;
                    px += 2 * Ry2;
                    p2 += Rx2 - py + px;
                }
            }

            return [];
        },
    },
} as Algorithms;
