// ==========================================================================
// Mandelbrot Set — extracted module for SPA tab integration
// Exposes: window.VizMandelbrot = { init(), pause(), resume(), reset(), adjustSlider() }
// All DOM IDs are prefixed with "mandelbrot-"
// ==========================================================================

window.VizMandelbrot = (function () {
    'use strict';

    var initialized = false;
    var active = false;

    // Canvas setup
    var canvas, ctx;
    var dpr = 1;
    var W = 800, H = 600;

    // DOM references
    var hudPhase, hudFill, hudDetail, hudCoords, caption;
    var iterSlider, iterVal, colorSelect;
    var btnZoomOut, btnReset;

    // View state
    var centerX = -0.5;
    var centerY = 0.0;
    var zoom = 200;
    var maxIter = 200;

    var DEFAULT_CX = -0.5;
    var DEFAULT_CY = 0.0;
    var DEFAULT_ZOOM = 200;

    // Named constants
    var MIN_ZOOM = 50;
    var ZOOM_FACTOR = 2;

    // Use shared palettes from MandelbrotPalettes
    var palettes;
    var currentPalette = 'inferno';

    // Hoisted constant
    var LOG2 = Math.log(2);

    // Rendering state
    var rendering = false;
    var renderRow = 0;
    var imageData = null;
    var worker = null;

    // Try to create a Web Worker for off-thread Mandelbrot computation
    try {
        worker = new Worker('js/mandelbrot-worker.js');
    } catch (e) {
        worker = null;
    }

    // Worker error fallback
    if (worker) {
        worker.onerror = function (e) {
            console.warn('Mandelbrot worker error, falling back to main thread:', e.message);
            worker = null;
            if (rendering) startRender();
        };
    }

    function startRender() {
        if (!active) return;
        rendering = true;
        renderRow = 0;

        var pw = W * dpr, ph = H * dpr;

        if (hudPhase) hudPhase.textContent = 'RENDERING';
        if (hudFill) hudFill.style.transform = 'scaleX(0)';

        if (worker) {
            worker.postMessage({
                centerX: centerX, centerY: centerY, zoom: zoom,
                maxIter: maxIter, width: pw, height: ph,
                dpr: dpr, W: W, H: H, palette: currentPalette
            });
            worker.onmessage = function (e) {
                if (!active) return;
                var buf = new Uint8ClampedArray(e.data.buffer);
                var img = new ImageData(buf, pw, ph);
                ctx.putImageData(img, 0, 0);
                rendering = false;
                hudPhase.textContent = 'COMPLETE';
                hudFill.style.transform = 'scaleX(1)';
                hudDetail.textContent = maxIter + ' max iterations';
                updateCoordsHUD();
            };
        } else {
            imageData = ctx.createImageData(pw, ph);
            requestAnimationFrame(renderBatch);
        }
    }

    function renderBatch() {
        if (!rendering || !active) return;

        var colorFn = palettes[currentPalette];
        var data = imageData.data;
        var pw = W * dpr, ph = H * dpr;
        var batchSize = Math.ceil(ph / 20);
        var endRow = Math.min(renderRow + batchSize, ph);
        var invDpr = 1 / dpr;
        var halfW = W / 2, halfH = H / 2;
        var invZoom = 1 / zoom;
        var ESC = MandelbrotPalettes.ESCAPE_RADIUS_SQ;
        var CYCLE = MandelbrotPalettes.COLOR_CYCLE_FACTOR;

        for (var py = renderRow; py < endRow; py++) {
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
                    data[idx] = 0; data[idx + 1] = 0; data[idx + 2] = 0;
                } else {
                    var nu = Math.log(Math.log(Math.sqrt(xx + yy)) / LOG2) / LOG2;
                    var smoothIter = iter + 1 - nu;
                    var t = smoothIter / maxIter;
                    t = Math.max(0, Math.min(1, t));
                    t = (t * CYCLE) % 1;
                    var color = colorFn(t);
                    data[idx] = color[0]; data[idx + 1] = color[1]; data[idx + 2] = color[2];
                }
                data[idx + 3] = 255;
            }
        }

        renderRow = endRow;
        var progress = renderRow / ph;
        hudFill.style.transform = 'scaleX(' + progress + ')';
        hudDetail.textContent = Math.round(progress * 100) + '% rendered';

        if (renderRow >= ph) {
            ctx.putImageData(imageData, 0, 0);
            rendering = false;
            hudPhase.textContent = 'COMPLETE';
            hudFill.style.transform = 'scaleX(1)';
            hudDetail.textContent = maxIter + ' max iterations';
            updateCoordsHUD();
        } else {
            requestAnimationFrame(renderBatch);
        }
    }

    function updateCoordsHUD() {
        hudCoords.textContent = 'Re: ' + centerX.toFixed(6) + '  Im: ' + centerY.toFixed(6) + '  Zoom: ' + zoom.toFixed(0) + 'x';
    }

    // --- Public interface ---

    function init() {
        if (initialized) return;
        initialized = true;
        active = true;

        // Use shared palettes
        palettes = MandelbrotPalettes.palettes;

        canvas      = document.getElementById('mandelbrot-canvas');
        ctx         = canvas.getContext('2d');
        if (!ctx) {
            console.warn('VizMandelbrot: canvas context unavailable');
            return;
        }
        hudPhase    = document.getElementById('mandelbrot-hud-phase');
        hudFill     = document.getElementById('mandelbrot-hud-progress-fill');
        hudDetail   = document.getElementById('mandelbrot-hud-detail');
        hudCoords   = document.getElementById('mandelbrot-hud-coords');
        caption     = document.getElementById('mandelbrot-caption');
        iterSlider  = document.getElementById('mandelbrot-iter-slider');
        iterVal     = document.getElementById('mandelbrot-iter-val');
        colorSelect = document.getElementById('mandelbrot-color-select');
        btnZoomOut  = document.getElementById('mandelbrot-btn-zoom-out');
        btnReset    = document.getElementById('mandelbrot-btn-reset');

        dpr = window.devicePixelRatio || 1;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.scale(dpr, dpr);

        // Click to zoom
        canvas.addEventListener('click', function (e) {
            var rect = canvas.getBoundingClientRect();
            var scaleX = W / rect.width;
            var scaleY = H / rect.height;
            var px = (e.clientX - rect.left) * scaleX;
            var py = (e.clientY - rect.top) * scaleY;
            centerX = centerX + (px - W / 2) / zoom;
            centerY = centerY + (py - H / 2) / zoom;
            zoom *= ZOOM_FACTOR;
            startRender();
        });

        // Right-click to zoom out
        canvas.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            zoom = Math.max(MIN_ZOOM, zoom / ZOOM_FACTOR);
            startRender();
        });

        // Mouse move: show coordinates
        canvas.addEventListener('mousemove', function (e) {
            if (rendering) return;
            var rect = canvas.getBoundingClientRect();
            var scaleX = W / rect.width;
            var scaleY = H / rect.height;
            var px = (e.clientX - rect.left) * scaleX;
            var py = (e.clientY - rect.top) * scaleY;
            var re = centerX + (px - W / 2) / zoom;
            var im = centerY + (py - H / 2) / zoom;
            hudCoords.textContent = 'Re: ' + re.toFixed(6) + '  Im: ' + im.toFixed(6) + '  Zoom: ' + zoom.toFixed(0) + 'x';
        });

        btnZoomOut.addEventListener('click', function () {
            zoom = Math.max(MIN_ZOOM, zoom / ZOOM_FACTOR);
            startRender();
        });

        btnReset.addEventListener('click', function () {
            resetView();
        });

        iterSlider.addEventListener('input', function () {
            maxIter = parseInt(this.value);
            iterVal.textContent = maxIter;
            iterSlider.setAttribute('aria-valuenow', maxIter);
            startRender();
        });

        colorSelect.addEventListener('change', function () {
            currentPalette = this.value;
            startRender();
        });

        startRender();
    }

    function resetView() {
        centerX = DEFAULT_CX; centerY = DEFAULT_CY; zoom = DEFAULT_ZOOM;
        startRender();
    }

    function adjustSlider(direction) {
        var step = parseInt(iterSlider.step) || 50;
        var newVal = parseInt(iterSlider.value) + direction * step;
        newVal = Math.max(parseInt(iterSlider.min), Math.min(parseInt(iterSlider.max), newVal));
        iterSlider.value = newVal;
        maxIter = newVal;
        iterVal.textContent = maxIter;
        iterSlider.setAttribute('aria-valuenow', maxIter);
        startRender();
    }

    function pause() {
        active = false;
        rendering = false;
    }

    function resume() {
        if (!initialized) return init();
        active = true;
        startRender();
    }

    return {
        init: init,
        pause: pause,
        resume: resume,
        reset: resetView,
        adjustSlider: adjustSlider
    };
})();
