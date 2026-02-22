// ==========================================================================
// Mandelbrot Web Worker — off-thread pixel computation
// Receives view parameters, returns the raw pixel buffer via transfer
// ==========================================================================

importScripts('mandelbrot-palettes.js');

var LOG2 = Math.log(2);
var ESC = MandelbrotPalettes.ESCAPE_RADIUS_SQ;
var CYCLE = MandelbrotPalettes.COLOR_CYCLE_FACTOR;
var palettes = MandelbrotPalettes.palettes;

self.onmessage = function (e) {
    var d = e.data;
    var centerX = d.centerX, centerY = d.centerY, zoom = d.zoom;
    var maxIter = d.maxIter, pw = d.width, ph = d.height;
    var dpr = d.dpr, W = d.W, H = d.H;
    var colorFn = palettes[d.palette] || MandelbrotPalettes.infernoColor;

    var buffer = new Uint8ClampedArray(pw * ph * 4);
    var invDpr = 1 / dpr;
    var halfW = W / 2, halfH = H / 2;
    var invZoom = 1 / zoom;

    for (var py = 0; py < ph; py++) {
        var y0base = centerY + (py * invDpr - halfH) * invZoom;
        for (var px = 0; px < pw; px++) {
            var x0 = centerX + (px * invDpr - halfW) * invZoom;
            var y0 = y0base;
            var x = 0, y = 0, iter = 0, xx = 0, yy = 0;

            while (xx + yy <= ESC && iter < maxIter) {
                y = 2 * x * y + y0;
                x = xx - yy + x0;
                xx = x * x; yy = y * y;
                iter++;
            }

            var idx = (py * pw + px) * 4;
            if (iter === maxIter) {
                buffer[idx] = 0; buffer[idx + 1] = 0; buffer[idx + 2] = 0;
            } else {
                var nu = Math.log(Math.log(Math.sqrt(xx + yy)) / LOG2) / LOG2;
                var smoothIter = iter + 1 - nu;
                var t = smoothIter / maxIter;
                t = Math.max(0, Math.min(1, t));
                t = (t * CYCLE) % 1;
                var color = colorFn(t);
                buffer[idx] = color[0]; buffer[idx + 1] = color[1]; buffer[idx + 2] = color[2];
            }
            buffer[idx + 3] = 255;
        }
    }

    self.postMessage({ buffer: buffer.buffer }, [buffer.buffer]);
};
