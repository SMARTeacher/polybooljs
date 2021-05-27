
var Util = require('./util');

var TAU = Math.PI * 2;
var HALF_PI = Math.PI * 0.5;

var makePoly = function(poly, index1, index2) {
    var result = [];
    for (var i = index1; i !== index2 + 1; ++i) {
        i = Util.normalizeIndex(poly, i);
        result.push(poly[i]);
    }
    return result;
}
var splitPoly = function(poly, index1, index2) {
    return [ makePoly(poly, index1, index2), makePoly(poly, index2, index1) ];
}

var getPolyTurns = function(poly) {
    // Check for too few points
    if (poly.length < 3)
        return 0;

    var oldPoly = poly[poly.length - 2];
    var newPoly = poly[poly.length - 1];
    var oldX = oldPoly[0];
    var oldY = oldPoly[1];
    var newX = newPoly[0];
    var newY = newPoly[1];
    var newDirection = Math.atan2(newY - oldY, newX - oldX);
    var angleSum = 0;

    // Check each point, the side ending there, its angle, and accumulate angles
    for (var ndx = 0; ndx < poly.length; ++ndx) {
        var newPoint = poly[ndx];

        // Update point coordinates and side direction, check side length
        oldX = newX;
        oldY = newY;
        if (oldX === newPoint[0] && oldY === newPoint[1])
            continue;
        var oldDirection = newDirection;
        newX = newPoint[0];
        newY = newPoint[1];
        newDirection = Math.atan2(newY - oldY, newX - oldX);

        // Calculate and check the normalized direction change angle
        var angle = newDirection - oldDirection;
        while (angle <= -Math.PI)
            angle += TAU;
        while (angle > Math.PI)
            angle -= TAU;

        // Accumulate the direction change angle
        angleSum += angle;
    }

    // Check that the total number of full turns is plus or minus 1
    return Math.round(angleSum / TAU);
}

var normalizeAngle = function(angle) {
    while (angle <= -Math.PI)
        angle += TAU;
    while (angle > Math.PI)
        angle -= TAU;
    return angle;
}

var getTangent = function(v1x, v1y, v2x, v2y) {
    var v1Length = Math.sqrt(v1x * v1x + v1y * v1y);
    var v2Length = Math.sqrt(v2x * v2x + v2y * v2y);

    return [
        v1x / v1Length + v2x / v2Length,
        v1y / v1Length + v2y / v2Length
    ];
}

var extractPointData = function(poly, orientation) {
    var points = poly.map(function(p) { return {
        x: p[0],
        y: p[1]
    }});

    var oldPoint = points[points.length - 2];
    var newPoint = points[points.length - 1];
    var newDirection = Math.atan2(newPoint.y - oldPoint.y, newPoint.x - oldPoint.x);
    for (var ndx = 0; ndx < poly.length; ++ndx) {
        oldPoint = newPoint;
        newPoint = points[ndx];
        var oldDirection = newDirection;
        newDirection = Math.atan2(newPoint.y - oldPoint.y, newPoint.x - oldPoint.x);
        var angle = normalizeAngle(newDirection - oldDirection);
        oldPoint.isConvex = orientation * angle >= 0;
    }

    return points;
}

var Convex = {
    /**
     * Check if a polygon is convex
     * @param {number[][]} poly - An array of points defining a polygon
     * @returns {boolean} True if the polygon is convex
     */
    isConvex: function(poly) {
        // From https://stackoverflow.com/questions/471962/how-do-i-efficiently-determine-if-a-polygon-is-convex-non-convex-or-complex/45372025#45372025

        // Check for too few points
        if (poly.length < 3)
            return false;

        var oldPoly = poly[poly.length - 2];
        var newPoly = poly[poly.length - 1];
        var oldX = oldPoly[0];
        var oldY = oldPoly[1];
        var newX = newPoly[0];
        var newY = newPoly[1];
        var newDirection = Math.atan2(newY - oldY, newX - oldX);
        var angleSum = 0;
        var orientation;

        // Check each point, the side ending there, its angle, and accumulate angles
        for (var ndx = 0; ndx < poly.length; ++ndx) {
            var newPoint = poly[ndx];

            // Update point coordinates and side direction, check side length
            oldX = newX;
            oldY = newY;
            if (oldX === newPoint[0] && oldY === newPoint[1])
                continue;
            var oldDirection = newDirection; 
            newX = newPoint[0];
            newY = newPoint[1];
            newDirection = Math.atan2(newY - oldY, newX - oldX);
            
            // Calculate and check the normalized direction change angle
            var angle = normalizeAngle(newDirection - oldDirection);
            if (typeof orientation === 'undefined') {
                // First time through the loop, initialize orientation
                if (angle === 0)
                    continue;
                orientation = angle > 0 ? 1 : -1;
            } else if (orientation * angle < 0) { // Check orientation is stable
                return false;
            }
            // Accumulate the direction change angle
            angleSum += angle;
        }

        // Check that the total number of full turns is plus or minus 1
        return Math.abs(Math.round(angleSum / TAU)) === 1;
    },

    /**
     * Split a single polygon into multiple convex polygons. Does not handle complex polygons (those that intersect themselves).
     * @param {number[][]} poly - An array of points defining a polygon
     * @returns {number[][][]} An array of convex polygons
     */
    makeConvex: function(poly) {
        // Check for too few points
        if (poly.length < 3)
            return [];
        else if (poly.length === 3)
            return [poly];

        var orientation = getPolyTurns(poly);
        if (Math.abs(orientation) !== 1)
            throw 'Convex.makeConvex does not support complex polygons. Poly given was: ' + JSON.stringify(poly);

        var points = extractPointData(poly, orientation);
        var concavePoint = -1;
        for (var i = 0; i < points.length; ++i) {
            var iPoint = points[i];
            if (!iPoint.isConvex) {
                concavePoint = i;
                for (var j = i + 2; j < points.length; ++j) {
                    var jPoint = points[j];
                    if (!jPoint.isConvex) {
                        if (i === 0 && j === points.length - 1) {
                            var split = splitPoly(poly, 0, poly.length >> 1);
                            return [split[0]].concat(this.makeConvex(split[1]));
                        } else {
                            var intersects = Util.segmentIntersectsPoly([[iPoint.x, iPoint.y], [jPoint.x, jPoint.y]], poly);
                            var inside = Util.isPointInsidePoly([(iPoint.x + jPoint.x) * 0.5, (iPoint.y + jPoint.y) * 0.5], poly);
                            if (!intersects && inside) {
                                var split = splitPoly(poly, i, j);
                                return this.makeConvex(split[0]).concat(this.makeConvex(split[1]));
                            }
                        }
                    }
                }
            }
        }

        if (concavePoint >= 0) {
            var split = splitPoly(poly, concavePoint, Util.normalizeIndex(poly, concavePoint + (poly.length >> 1)));
            return this.makeConvex(split[0]).concat(this.makeConvex(split[1]));
        }

        return [poly];
    }
};

module.exports = Convex;
