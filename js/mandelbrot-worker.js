// ==========================================================================
// Mandelbrot Web Worker — off-thread pixel computation
// Receives view parameters, returns the raw pixel buffer via transfer
// ==========================================================================

var LOG2 = Math.log(2);

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

var palettes = {
    inferno: infernoColor,
    gold: goldColor,
    ocean: oceanColor,
    grayscale: grayscaleColor
};

self.onmessage = function (e) {
    var d = e.data;
    var centerX = d.centerX, centerY = d.centerY, zoom = d.zoom;
    var maxIter = d.maxIter, pw = d.width, ph = d.height;
    var dpr = d.dpr, W = d.W, H = d.H;
    var colorFn = palettes[d.palette] || infernoColor;

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

            while (xx + yy <= 4 && iter < maxIter) {
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
                t = (t * 8) % 1;
                var color = colorFn(t);
                buffer[idx] = color[0]; buffer[idx + 1] = color[1]; buffer[idx + 2] = color[2];
            }
            buffer[idx + 3] = 255;
        }
    }

    self.postMessage({ buffer: buffer.buffer }, [buffer.buffer]);
};
