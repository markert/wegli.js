/* global createWebglContext, attachPloygonShader, attachWaterfallShader, attachHeatmapShader, attachTextureShader */
$(document).ready(function () {
  'use strict';
  var lineCanvas = document.getElementById('linectx');
  var hmCanvas = document.getElementById('hmctx');
  var wfCanvas = document.getElementById('wfctx');
  var teCanvas = document.getElementById('tectx');
  var cnt;
  var w = 256,
    h = 256;

  var ctx = createWebglContext(lineCanvas, {
    types: ['webgl', 'experimental-webgl'],
    attrs: {
      antialias: true
    }
  });

  var ctxh = createWebglContext(hmCanvas, {
    types: ['webgl', 'experimental-webgl'],
    attrs: {
      antialias: true
    }
  });

  var ctxw = createWebglContext(wfCanvas, {
    types: ['webgl', 'experimental-webgl'],
    attrs: {
      antialias: true
    }
  });

  var ctxt = createWebglContext(teCanvas, {
    types: ['webgl', 'experimental-webgl'],
    attrs: {
      antialias: true
    }
  });

  var lineRenderer = attachPloygonShader(ctx);
  var hmRenderer = attachHeatmapShader(ctxh, {
    x: w,
    y: h
  });
  hmRenderer.setPointSize(3);
  var wfRenderer = attachWaterfallShader(ctxw, {
    x: w,
    y: h
  });
  var teRenderer = attachTextureShader(ctxt);
  /*wfRenderer.transform({
     translate: {
       x: -0.3,
       y: 0,
       z: -1
     },
     rotate: {
       x: -2.7,
       y: -2.8,
       z: -1.0
     },
     aspectRatio: 1,
     scaling: 0.7,
     distance: 1.0,
     plane: {
       far: 1,
       near: -1
     }

   });*/
  var phaseShift = 0;
  var num = 0;
  var phaseDrift = Math.PI;
  var ampl = 0.8;

  var getTime = function () {
    if (performance && performance.now) {
      return performance.now();
    }
    return 1;
  };

  var textStyle = {
    font: '18px/30px Arial, serif',
    fill: '#000000',
    stroke: '#000000',
    plane: 'n',
    pos: [0.0, 0.0, 0.0]
  };
  teRenderer.setTextureSize(256, 256);
  var fft = new Fft(512);
  var frequency = 512 * Math.random();
  var frequency2 = 512 * Math.random();

  var fftArray = [];

  var run = function () {
    fftArray.length = 0;
    for (cnt = 0; cnt < 512; cnt++) {
      fftArray.push(Math.sin(frequency * Math.PI * (phaseShift + (cnt) / (512))) + Math.sin(frequency2 * Math.PI * (phaseShift + (cnt) / (512))));
    }
    var res = fft.forward(fftArray, 'hanning');
    res[0] = 0;
    res[511] = 0;
    var db = fft.magToDb(fft.magnitude(res));
    var max = -Number.MAX_VALUE;
    for (cnt = 0; cnt < 512; cnt++) {
      if (db[cnt] > max) {
        max = db[cnt];
      }
    }
    for (cnt = 0; cnt < 512; cnt++) {
      db[cnt] -= max;
    }
    var time = getTime();
    textStyle.pos = [-0.2, 0.0, 0.0];
    teRenderer.writeText('ms per Fame', textStyle);
    textStyle.pos = [0.6, 0.0, 0.0];
    teRenderer.writeText('' + (num).toFixed(1), textStyle);
    phaseShift = (phaseShift + Math.PI / w) % (32 * Math.PI);

    // render wave
    var p = [];
    var c = [];
    for (cnt = 0; cnt < w; cnt++) {
      p.push((2 * cnt) / (w) - 1);
      p.push(Math.sin(2 * Math.PI * (phaseShift + (cnt) / (w))));
      c.push(cnt / w);
      c.push((w - cnt) / w);
      c.push(cnt / w);
    }
    lineRenderer.draw(p, c, 'LINE_STRIP');
    // render heatmap wave
    hmRenderer.age(0.015);
    var i = 0.5;

    var yPrev = (Math.sin(2 * Math.PI * (phaseShift + (0) / (w)) + Math.PI) * w / 2 + w / 2);
    for (cnt = 1; cnt < w; cnt++) {
      var x = cnt;
      var y = (Math.sin(2 * Math.PI * (phaseShift + (cnt) / (w)) + Math.PI) * w / 2 + w / 2);
      var yDiff = y - yPrev;
      for (var j = 0; j <= Math.ceil(Math.abs(yDiff)); j++) {
        if (yDiff >= 0) {
          hmRenderer.setPixel(x, Math.floor(y + j), i);
        } else if (yDiff < 0) {
          hmRenderer.setPixel(x, Math.floor(y - j), i);
        }
      }
      yPrev = y;
    }
    hmRenderer.drawC('POINTS');

    // render waterfall
    var d = [];
    for (cnt = 0; cnt < h; cnt++) {
      d[cnt] = (180 + db[cnt]) / 180;
    }
    var sign = Math.random();
    if (sign > 0.5) {
      phaseDrift += Math.random() / 500 * Math.PI;
      ampl += (Math.random() / 50);
      frequency = (frequency - 1) % 512;
      frequency2 = (frequency2 - 0.5) % 512;
    } else {
      phaseDrift -= Math.random() / 500 * Math.PI;
      ampl -= (Math.random() / 50);
      frequency = (frequency + 0.5) % 512;
      frequency2 = (frequency2 + 1) % 512;
    }
    if (ampl > 1) {
      ampl = 1;
    } else if (ampl < 0) {
      ampl = 0;
    }
    wfRenderer.setColumn(d);
    wfRenderer.drawC('POINTS');
    var tnum = getTime() - time;
    if (num === 0) {
      num = 10;
    } else {
      num = tnum * 0.04 + num * 0.96;
    }
    setTimeout(function () {
      requestAnimationFrame(run);
    }, 30);
  };
  requestAnimationFrame(run);
});
