const Convex = require("../lib/convex");

var TestUtil = {
    regionsToFormat: function (regions, location, format) {
        var offset = [0,0];
        if (location) {
            var min = regions.reduce((min, r) =>
                {
                    var regionMin = r.reduce((min, p) => [Math.min(min[0], p[0]), Math.min(min[1], p[1])], [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]);
                    return [Math.min(min[0], regionMin[0]), Math.min(min[1], regionMin[1])];
                },
                [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
            );
            offset = [location[0] - min[0], location[1] - min[1]];
        }
        var conversionFunction = this['regionToFormat' + format] ? this['regionToFormat' + format] : regionToFormat1;
        return regions.map(r => conversionFunction(r, offset)).join('');
    },

    regionToFormat1: function (region, offset) {
        var color = Convex.isConvex(region) ? 'grey' : 'red';
        var result = '{"loc":"0 0","fill":"' + color + '","stroke":"black","strokeWidth":1,"category":"PolygonDrawing","geo":"F';
        result += ' M' + region.map(p => (p[0] + offset[0]) + ' ' + (p[1] + offset[1])).join(' L');
        result += 'z"},\n';
        return result;
    },

    regionToFormat2: function (region, offset) {
        var color = Convex.isConvex(region) ? '#aaa' : '#f00';
        var result = '<path stroke="#000" fill="' + color + '" d="';
        result += 'm ' + region.map(p => (p[0] + offset[0]) + ',' + (p[1] + offset[1])).join(' l');
        result += 'z" />\n';
        return result;
    },

    regionToFormat3: function (region, offset) {
        return ' M ' + region.map(p => (p[0] + offset[0]) + ' ' + (p[1] + offset[1])).join(' L ') + ' Z';
    }
};

module.exports = TestUtil;
