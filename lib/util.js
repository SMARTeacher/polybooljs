
var Util = {
    normalizeIndex: function (array, index) {
        while (index < 0)
            index += array.length;
        while (index >= array.length)
            index -= array.length;
        return index;
    },

    segmentIntersectsPoly: function(segment, poly) {
        for (var i = poly.length - 2; i >= 0; --i) {
            if (Util.segmentsIntersect(segment, [poly[i], poly[i + 1]]))
                return true;
        }
        return false;
    },

    segmentsIntersect: function(segment1, segment2) {
        return doIntersect(segment1[0], segment1[1], segment2[0], segment2[1]);
    },

    dot: function(v1x, v1y, v2x, v2y) {
        return v1x * v2x + v1y * v2y;
    },

    isPointInsidePoly: function(point, poly) {
        var segment = [point, [point[0] + 10000, point[1]]];
        var intersections = 0;
        for (var i = poly.length - 2; i >= 0; --i) {
            if (Util.segmentsIntersect(segment, [poly[i], poly[i + 1]]))
                ++intersections;
        }
        return (intersections & 1) > 0;
    }
};

// Given three colinear points p, q, r, the function checks if
// point q lies in line segment 'pr'
function inSegment(p, q, r) {
    if (q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
        q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]) &&
        (q[0] !== p[0] || q[1] !== p[1]) && (q[0] !== r[0] || q[1] !== r[1]))
        return true;

    return false;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r)
{
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    var val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);

    if (val == 0) return 0; // colinear

    return (val > 0) ? 1 : 2; // clock or counter-clockwise
}

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function doIntersect(p1, q1, p2, q2)
{
    // Find the four orientations needed for general and
    // special cases
    var o1 = orientation(p1, q1, p2); if (o1 === 0) return false;
    var o2 = orientation(p1, q1, q2); if (o2 === 0) return false;
    var o3 = orientation(p2, q2, p1); if (o3 === 0) return false;
    var o4 = orientation(p2, q2, q1); if (o4 === 0) return false;

    // General case
    if (o1 !== o2 && o3 !== o4)
        return true;

    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies in segment p1q1
    if (o1 === 0 && inSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are colinear and q2 lies in segment p1q1
    if (o2 === 0 && inSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are colinear and p1 lies in segment p2q2
    if (o3 === 0 && inSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are colinear and q1 lies in segment p2q2
    if (o4 === 0 && inSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
}

module.exports = Util;
