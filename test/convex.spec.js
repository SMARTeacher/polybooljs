
var Convex = require('../lib/convex');
var TestUtil = require('./testUtil');

describe('Convex', () => {
    var convexPolys = {
        box: [[0, 0], [1, 0], [1, 1], [0, 1]],
        triangle: [[0, 0], [0, 1], [.5, .5]],
        roundPoly: [[0, 0], [1, 0], [2, 2], [3, 5], [2, 8], [0, 6]],
        polyWithColinearSides: [[0, 0], [1, 0], [2, 2], [3, 5], [2, 8], [0, 6], [0, 2]]
    };

    var concavePolys = {
        indentedBox: [[0, 0], [1, 1], [2, 1], [3, 0], [3, 2], [0, 2]],
        collapsedBox: [[0, 0], [1, 0], [1, 1], [0.6, .5]],
        tie: [[0, 0], [1, 0], [2, 2], [3, 5], [2, 8], [0, 6], [.1, 2]],
        wavyToppedBlock: [[400, 200], [400, 174], [396, 177], [383, 174], [381, 174], [372, 174], [368, 170], [356, 170], [353, 166], [350, 166], [350,200]],
        hourglass: [[0, 0], [3, 0], [2, 1], [3, 2], [0, 2], [1, 1]],
        rainbow: [[0, 115], [21, 50], [84, 0], [169, 25], [201, 112], [154, 112], [126, 63], [79, 64], [44, 113]],
        gameExampleCC1: [[2613.5454545454545, 4940], [2460, 4940], [2460, 5139.28], [2467, 5139], [2519, 5172], [2538, 5228], [2510, 5274], [2480, 5294], [2480.277777777778, 5295], [2460, 5295], [2460, 5340], [2509.7323943661972, 5340], [2510.321504237288, 5319.0865995762715], [2544, 5301], [2552, 5279], [2563, 5270], [2586, 5253], [2610, 5217], [2609, 5133], [2553, 5132], [2516, 5105], [2507.301886792453, 5070.207547169812], [2504, 5022], [2520, 4975], [2561, 4948], [2607, 4944]],
        gameExampleCC2: [[2367, 5499], [2460, 5499], [2460, 5340], [2060, 5340], [2325, 5346], [2395, 5346], [2395, 5406], [2325, 5406], [2325, 5346], [2060, 5340]],
    };

    describe('#isConvex', () => {
        describe('should properly identify convex polygons', () => {
            it.each(Object.keys(convexPolys))('%s', (polyName) => {
                expect(Convex.isConvex(convexPolys[polyName])).toBe(true);
            });
        });

        describe('should properly identify concave polygons', () => {
            it.each(Object.keys(concavePolys))('%s', (polyName) => {
                expect(Convex.isConvex(concavePolys[polyName])).toBe(false);
            });
        });
    });

    describe('#makeConvex', () => {
        describe('should break down concave polygons into convex polygons', () => {
            it.each(Object.keys(concavePolys))('%s', (polyName) => {
                var convexParts = Convex.makeConvex(concavePolys[polyName]);
                var offset = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
                for (var poly of convexParts) {
                    for (var point of poly) {
                        offset[0] = Math.min(offset[0], point[0]);
                        offset[1] = Math.max(offset[1], point[0]);
                    }
                }
                var debug = TestUtil.regionsToFormat([concavePolys[polyName]], [0, 0], 3) + TestUtil.regionsToFormat(convexParts, [(offset[1] - offset[0]) * 1.25, 0], 3);
                expect(convexParts.every((subPoly) => Convex.isConvex(subPoly))).toBe(true);
            });
        });
    });
});
