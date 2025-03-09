import { Vec2 } from "kaplay";
import { clearBeans, paintInterpolation, planeToWorldX, planeToWorldY, syncBeans } from "./game";


export default {
    line: {
        name: 'Línea',
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
                vec2(iX, iY)
            ];

            for (let i = 0; i < steps; i++) {
                iX += incrementX;
                iY += incrementY;

                const mark = paintInterpolation();

                mark.pos = vec2(
                    planeToWorldX(iX),
                    planeToWorldY(iY),
                )

                data.push(vec2(
                    parseFloat(iX.toFixed(3)),
                    parseFloat(iY.toFixed(3))
                ));
            }

            return data;
        }
    },
    triangle: {
        name: 'Triángulo',
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
                    const d1 = (vector1.x - vector2.x) * (y - vector1.y) - (vector1.y - vector2.y) * (x - vector1.x);
                    const d2 = (vector2.x - vector3.x) * (y - vector2.y) - (vector2.y - vector3.y) * (x - vector2.x);
                    const d3 = (vector3.x - vector1.x) * (y - vector3.y) - (vector3.y - vector1.y) * (x - vector3.x);

                    if ((d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0)) {
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

} as Algorithms