/* global define, initWebgl, HeatmapShader, getTransformationMatrix */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var attachHeatmapShader = function (ctx, dimensions) {
    var wParams = {};
    initWebgl(wParams);
    new HeatmapShader().getHeatmapShader(ctx, false);
    new HeatmapShader().getHeatmapShader(ctx, true);
    var programC = ctx.myPrograms.heatmapShaderC;
    var programBw = ctx.myPrograms.heatmapShaderBw;
    var particleBuffer = ctx.createBuffer();
    var buffer = {};
    buffer.setPixel = function () {};
    buffer.age = 0;

    var initBuffer = function (width, height) {
      var shift = 0;
      var pointer = 0;
      buffer.age = 0;
      buffer.arraySize = 4 * width * height;
      buffer.vertices = new Float32Array(buffer.arraySize);
      for (var cnt = 0; cnt < width; cnt++) {
        var s = pointer;
        shift -= 2 / width;
        for (var i = 0; i < height; i++) {
          var data = new Float32Array(4);
          data[0] = shift + 1;
          data[1] = (i * 2 / height) - 1;
          data[2] = 0;
          data[3] = 0;
          pointer = (s + i * 4) % (buffer.arraySize);
          buffer.vertices.set(data, pointer);
        }
        pointer = (s + height * 4) % (buffer.arraySize);
      }
      ctx.bindBuffer(ctx.ARRAY_BUFFER, particleBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, buffer.vertices, ctx.DYNAMIC_DRAW);
      buffer.setPixel = function (x, y, i) {
        if (x < 0 || x > width || y < 0 || y > height) {
          return false;
        }
        var offset = (((width - x) + 1) * height * 4 - y * 4);
        var carry = buffer.vertices[offset + 2] - buffer.vertices[offset + 3] + buffer.age;
        var val = carry - i;
        if (carry > i) {
          val = -i;
        } else if (val < -1) {
          val = -1;
        }
        buffer.vertices[offset + 2] = val;
        buffer.vertices[offset + 3] = buffer.age;
        ctx.bufferSubData(ctx.ARRAY_BUFFER, (4 * offset + 8), buffer.vertices.subarray(offset + 2, offset + 4));
      };
    };

    if (dimensions) {
      initBuffer(dimensions.x, dimensions.y);
    } else {
      initBuffer(100, 100);
    }

    var render = function (params, type, b, p) {
      ctx.useProgram(p);
      ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE);
      ctx.enable(ctx.DEPTH_TEST);
      ctx.bindBuffer(ctx.ARRAY_BUFFER, b);

      ctx.vertexAttribPointer(p.position, 3, ctx.FLOAT, false, 16, 0);
      ctx.vertexAttribPointer(p.birth, 1, ctx.FLOAT, false, 16, 12);
      ctx.lineWidth(1);
      ctx.uniform1f(p.date, buffer.age);
      ctx.uniformMatrix4fv(p.transformation, false, wParams.transformCoordinates);
      ctx.drawArrays(ctx[type], 0, buffer.arraySize / 4);
    };

    var self = {
      reinitBuffer: function (w, h) {
        return initBuffer(w, h);
      },
      transform: function (params) {
        wParams.transformValues = params;
        wParams.transformCoordinates = getTransformationMatrix(wParams.transformValues);
      },
      drawBw: function (params, type) {
        render(params, type, particleBuffer, programBw);
      },
      drawC: function (params, type) {
        render(params, type, particleBuffer, programC);
      },
      setPixel: buffer.setPixel,
      age: function (t) {
        buffer.age += t;
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = attachHeatmapShader;
  } else {
    window.attachHeatmapShader = attachHeatmapShader;
    if (typeof define === 'function' && define.amd) {
      define(attachHeatmapShader);
    }
  }
})(window);
