/* global createWebglContext, attachPloygonShader, attachWaterfallShader, attachHeatmapShader, attachTextureShader */
$(document).ready(function () {
  'use strict';
  var wfCanvas = document.getElementById('wfctx');
  var lineCanvas = document.getElementById('linectx');
  var lineCanvas2 = document.getElementById('linectx2');
  var cnt;
  var w = 512,
    h = 258;

  var ctxw = createWebglContext(wfCanvas, {
    types: ['webgl', 'experimental-webgl'],
    attrs: {
      antialias: true
    }
  });

  var ctx = createWebglContext(lineCanvas, {
    types: ['webgl', 'experimental-webgl'],
    attrs: {
      antialias: true
    }
  });

  var ctxf = createWebglContext(lineCanvas2, {
    types: ['webgl', 'experimental-webgl'],
    attrs: {
      antialias: true
    }
  });

  var lineRenderer = attachPloygonShader(ctx);
  var fftRenderer = attachPloygonShader(ctxf);

  var wfRenderer = attachWaterfallShader(ctxw, {
    x: w,
    y: h
  });
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

  var frequency = 6;
  var amplitude = 1;
  var amplitude2 = -0.02;
  var frequency2 = 200;

  var fft = new Fili.Fft(512);

  var fftArray = [];

  var wcalc = new Fili.Wt({
    bufferSize: 10000,
    depth: 4
  });

  var samples = 512;

  wcalc.enableDWT();

  Array.prototype.max = function () {
    return Math.max.apply(null, this);
  };

  Array.prototype.min = function () {
    return Math.min.apply(null, this);
  };

  var fillData = function (wb) {
    var d = [];
    for (var cnt = 0; cnt < wb.length; cnt++) {
      d[cnt] = [];
      for (var ccnt = 0; ccnt < wb[cnt].lowpassPointer / 1; ccnt++) {
        var temp = wb[cnt].highpassData[ccnt] / (Math.pow(2, cnt));
        if ((temp >= 0 && temp < 0.001) || (temp < 0 && temp > -0.001)) {
          temp = 0;
        }
        //temp = temp / (wb[wb.length-1].lowpassData[0]);
        temp += 0.5;
        for (var xcnt = 0; xcnt < Math.pow(2, cnt); xcnt++) {
          d[cnt].push(temp);
        }
      }
    }
    return d;

  }

  var p = [];
  var c = [];
  var fp = [];
  var fc = [];
  var drawArray = [];
  drawArray.length = 2 * samples;

  var run = function () {
    fftArray.length = 0;
    for (cnt = 0; cnt < samples; cnt++) {
      fftArray.push(amplitude * Math.sin(frequency * Math.PI * (phaseShift + (cnt) / (512))) + amplitude2 * Math.sin(frequency2 * Math.PI * (phaseShift + (cnt) / (512))));
    }
    p.length = 0;
    c.length = 0;
    for (var i = 0; i < samples; i++) {
      drawArray[i] = drawArray[i + samples];
      drawArray[i + samples] = fftArray[i];
    }

    var res = fft.forward(fftArray, 'hanning');
    var db = fft.magToDb(fft.magnitude(res));
    var max = -Number.MAX_VALUE;
    for (cnt = 0; cnt < w; cnt++) {
      if (db[cnt] > max) {
        max = db[cnt];
      }
    }
    for (cnt = 0; cnt < w; cnt++) {
      db[cnt] -= max;
    }

    for (cnt = 0; cnt < 2 * w; cnt++) {
      p.push((2 * cnt) / (w * 2) - 1);
      fp.push((2 * cnt) / (w * 2) - 1);
      p.push(drawArray[cnt] / 2);
      fp.push(db[Math.floor(cnt / 4)] / 180);
      c.push(0);
      c.push(0);
      c.push(0);
    }
    lineRenderer.draw(p, c, 'LINE_STRIP');
    fftRenderer.draw(fp, c, 'LINE_STRIP');

    fp.length = 0;
    fc.length = 0;



    phaseShift = (phaseShift + Math.PI / (4 * w)) % (512 * Math.PI);
    //  wcalc.pushData(fftArray.slice(fftArray.length/2));
    //wcalc.setPushBufferPosition(2048);
    wcalc.pushData(fftArray);
    if (wcalc.bufferLength() > 2000) {
    wcalc.clearSamples(800);
    }

    var wxd = wcalc.calculate();

    var wdata = fillData(wxd);
    for (var cnt = 0; cnt < wdata[0].length; cnt++) {
      var pd = [];
      for (var i = wdata.length - 1; i > -1; --i) {
        for (var k = 0; k < 258 / wdata.length; k++) {
          pd.push(wdata[i][cnt]);
        }
      }
      wfRenderer.setColumn(pd);
    }
    //wfRenderer.setColumn(d);
    wfRenderer.drawBw('POINTS');

    setTimeout(function () {
      requestAnimationFrame(run);
    }, 50);
  };
  requestAnimationFrame(run);
});
