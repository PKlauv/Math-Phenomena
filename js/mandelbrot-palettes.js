// ==========================================================================
// Mandelbrot Color Palettes — shared between main thread and Web Worker
// Used by viz-mandelbrot.js and mandelbrot-worker.js
// ==========================================================================

(function (root) {
    'use strict';

    var ESCAPE_RADIUS_SQ = 4;
    var COLOR_CYCLE_FACTOR = 8;

    function infernoColor(t) {
        var r, g, b;
        if (t < 0.25) {
            var s = t / 0.25;
            r = Math.floor(10 + 68 * s); g = Math.floor(7 + 5 * s); b = Math.floor(46 + 72 * s);
        } else if (t < 0.5) {
            var s = (t - 0.25) / 0.25;
            r = Math.floor(78 + 90 * s); g = Math.floor(12 + 46 * s); b = Math.floor(118 - 35 * s);
        } else if (t < 0.75) {
            var s = (t - 0.5) / 0.25;
            r = Math.floor(168 + 58 * s); g = Math.floor(58 + 74 * s); b = Math.floor(83 - 69 * s);
        } else {
            var s = (t - 0.75) / 0.25;
            r = Math.floor(226 + 26 * s); g = Math.floor(132 + 122 * s); b = Math.floor(14 + 238 * s);
        }
        return [r, g, b];
    }

    function goldColor(t) {
        return [Math.floor(30 + 170 * t), Math.floor(10 + 152 * t), Math.floor(5 + 101 * t)];
    }

    function oceanColor(t) {
        return [Math.floor(5 + 40 * t), Math.floor(20 + 130 * t), Math.floor(60 + 195 * t)];
    }

    function grayscaleColor(t) {
        var v = Math.floor(255 * t); return [v, v, v];
    }

    var exports = {
        ESCAPE_RADIUS_SQ: ESCAPE_RADIUS_SQ,
        COLOR_CYCLE_FACTOR: COLOR_CYCLE_FACTOR,
        infernoColor: infernoColor,
        goldColor: goldColor,
        oceanColor: oceanColor,
        grayscaleColor: grayscaleColor,
        palettes: {
            inferno: infernoColor,
            gold: goldColor,
            ocean: oceanColor,
            grayscale: grayscaleColor
        }
    };

    // Works in both main thread and Web Worker contexts
    if (typeof self !== 'undefined' && typeof self.importScripts === 'function') {
        self.MandelbrotPalettes = exports;
    } else {
        root.MandelbrotPalettes = exports;
    }
})(typeof window !== 'undefined' ? window : self);
