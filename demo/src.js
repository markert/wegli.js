/* global createWebglContext, attachPloygonShader, attachWaterfallShader, attachHeatmapShader, attachTextureShader */
$(document).ready(function () {
  'use strict';
  var lineCanvas = document.getElementById('linectx');
  var hmCanvas = document.getElementById('hmctx');
  var wfCanvas = document.getElementById('wfctx');
  var teCanvas = document.getElementById('tectx');
  var cnt;
  var w = 400,
    h = 200;

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

  var run = function () {
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
    var i = 0.3;
    for (cnt = 0; cnt < w; cnt++) {
      var x = cnt;
      var y = Math.floor((Math.sin(2 * Math.PI * (phaseShift + (cnt) / (w)) + Math.PI) * w / 2 + w / 2) / 2);
      hmRenderer.setPixel(x, y, i);
      y += 1 % h;
      hmRenderer.setPixel(x, y, i);
      y += 1 % h;
      hmRenderer.setPixel(x, y, i);
      y += 1 % h;
      hmRenderer.setPixel(x, y, i);
      y += 1 % h;
      hmRenderer.setPixel(x, y, i);
    }
    hmRenderer.drawC(hmRenderer.buffer, 'POINTS');

    // render waterfall
    var d = [];
    for (cnt = 0; cnt < h; cnt++) {
      d[cnt] = ampl * (Math.sin(Math.PI + 2 * Math.PI * (phaseDrift + (cnt) / (h))) + 1) / 2;
    }
    var sign = Math.random();
    if (sign > 0.5) {
      phaseDrift += Math.random() / 500 * Math.PI;
      ampl += (Math.random() / 50);
    } else {
      phaseDrift -= Math.random() / 500 * Math.PI;
      ampl -= (Math.random() / 50);
    }
    if (ampl > 1) {
      ampl = 1;
    } else if (ampl < 0) {
      ampl = 0;
    }
    wfRenderer.setColumn(d);
    wfRenderer.drawC(wfRenderer.buffer, 'POINTS');
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
