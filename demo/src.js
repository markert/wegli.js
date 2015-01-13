$(document).ready(function () {
  /* global define */
  'use strict';
  var lineCanvas = document.getElementById('linectx');
  var hmCanvas = document.getElementById('hmctx');
  var wfCanvas = document.getElementById('wfctx');
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

  var lineRenderer = AttachPloygonShader(ctx);
  var hmRenderer = AttachHeatmapShader(ctxh, {
    x: w,
    y: h
  });
  var wfRenderer = AttachWaterfallShader(ctxw, {
    x: w,
    y: h
  });
  /*  hmRenderer.transform({
      translate: {
        x: 0.5,
        y: 0,
        z: -1
      },
      rotate: {
        x: 0.9,
        y: 0.8,
        z: 0.0
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

  var run = function () {
    phaseShift = (phaseShift + Math.PI / w) % (32 * Math.PI);
    setTimeout(function () {

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
        d[cnt] = (Math.sin(2 * Math.PI * (phaseShift + (cnt) / (h))) + 1) / 2;
      }
      wfRenderer.setColumn(d);
      wfRenderer.drawC(wfRenderer.buffer, 'POINTS');

      run();
    }, 25);
  };
  run();
});
