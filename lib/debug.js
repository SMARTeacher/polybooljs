var Convex = require("./convex");

var Debug = {
    regionsToFormat: function (regions, location, format) {
        var offset = [0,0];
        if (location) {
            var min = regions.reduce(
                function (min, r) {
                    var regionMin = r.reduce(function (min, p) { return [Math.min(min[0], p[0]), Math.min(min[1], p[1])]; }, [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]);
                    return [Math.min(min[0], regionMin[0]), Math.min(min[1], regionMin[1])];
                },
                [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
            );
            offset = [location[0] - min[0], location[1] - min[1]];
        }
        var conversionFunction = this['regionToFormat' + format] ? this['regionToFormat' + format] : regionToFormat1;
        return regions.map(function(r) { return conversionFunction(r, offset); }).join('');
    },

    regionToFormat1: function (region, offset) {
        var color = Convex.isConvex(region) ? 'grey' : 'red';
        var result = '{"loc":"0 0","fill":"' + color + '","stroke":"black","strokeWidth":1,"category":"PolygonDrawing","geo":"F';
        result += ' M' + region.map(function(p) { return (p[0] + offset[0]) + ' ' + (p[1] + offset[1]); }).join(' L');
        result += 'z"},\n';
        return result;
    },

    regionToFormat2: function (region, offset) {
        var color = Convex.isConvex(region) ? '#aaa' : '#f00';
        var result = '<path stroke="#000" fill="' + color + '" d="';
        result += 'M ' + region.map(function(p) { return (p[0] + offset[0]) + ',' + (p[1] + offset[1]); }).join(' L');
        result += 'z" />\n';
        return result;
    },

    regionToFormat3: function (region, offset) {
        return ' M ' + region.map(function(p) { return (p[0] + offset[0]) + ' ' + (p[1] + offset[1]); }).join(' L ') + ' Z';
    },

    getRegionCollectionLog: function (format, regionsCollection) {
        var result = '';

        var offset = [0, 0];
        for (var i = 0; i < regionsCollection.length; ++i) {
            var polys = regionsCollection[i];
            result += this.regionsToFormat(polys, offset, format);

            var minMax = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
            for (var j = 0; j < polys.length; ++j) {
                var poly = polys[j];

                for (var k = 0; k < poly.length; ++k) {
                    var point = poly[k];

                    minMax[0] = Math.min(minMax[0], point[0]);
                    minMax[1] = Math.max(minMax[1], point[0]);
                }
            }

            offset[0] += (minMax[1] - minMax[0]) * 1.25;
        }

        return result;
    }
};

module.exports = Debug;
global['polyBoolDebug'] = Debug;
