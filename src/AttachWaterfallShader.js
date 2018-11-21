/* global define, initWebgl, HeatmapShader, getTransformationMatrix */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var attachWaterfallShader = function (ctx, dimensions) {
    var wParams = {};
    initWebgl(wParams);
    new HeatmapShader().getFloatingShader(ctx, false);
    new HeatmapShader().getFloatingShader(ctx, true);
    var programC = ctx.myPrograms.floatingShaderC;
    var programBw = ctx.myPrograms.floatingShaderBw;
    var particleBuffer = ctx.createBuffer();
    var buffer = {};
    buffer.setColumn = function () {};
    buffer.pointSize = 1.0;

    var initBuffer = function (width, height) {
      var shift = 0;
      var pointer = 0;

      buffer.xOffset = 0;
      buffer.speed = 2 / width;
      buffer.columnPointer = 0;
      buffer.arraySize = 3 * width * height;
      buffer.vertices = new Float32Array(buffer.arraySize);
      for (var cnt = 0; cnt < width; cnt++) {
        var s = pointer;
        shift -= 2 / width;
        for (var i = 0; i < height; i++) {
          var data = new Float32Array(3);
          data[0] = 0;
          data[1] = 0;
          data[2] = 0;
          pointer = (s + i * 3) % (buffer.arraySize);
          buffer.vertices.set(data, pointer);
        }
        pointer = (s + height * 3) % (buffer.arraySize);
      }
      ctx.bindBuffer(ctx.ARRAY_BUFFER, particleBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, buffer.vertices, ctx.DYNAMIC_DRAW);
      var subDataArray = new Float32Array(3 * height);
      buffer.setColumn = function (d) {
        ctx.bindBuffer(ctx.ARRAY_BUFFER, particleBuffer);
        var arrayByteSize = buffer.arraySize * 12;
        var offset = buffer.columnPointer * height * 12;
        var i = 0;
        if (d.length < height) {
          d.length = height;
          for (i = d.length; i < height; i++) {
            d[i] = 0;
          }
        }

        for (i = 0; i < height; i++) {
          subDataArray[0 + 3 * i] = buffer.xOffset + 1;
          subDataArray[1 + 3 * i] = (i * 2 / d.length) - 1;
          subDataArray[2 + 3 * i] = -d[i];
        }
        ctx.bufferSubData(ctx.ARRAY_BUFFER, (offset) % arrayByteSize, subDataArray);
        buffer.columnPointer = (buffer.columnPointer + 1) % width;
        buffer.xOffset += buffer.speed;
      };
    };

    if (dimensions) {
      initBuffer(dimensions.x, dimensions.y);
    } else {
      initBuffer(100, 100);
    }

    var render = function (type, b, p) {
      ctx.useProgram(p);
      ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE);
      ctx.enable(ctx.DEPTH_TEST);
      ctx.bindBuffer(ctx.ARRAY_BUFFER, b);

      ctx.vertexAttribPointer(p.position, 3, ctx.FLOAT, false, 12, 0);
      ctx.lineWidth(1);
      ctx.uniform1f(p.shift, buffer.xOffset);
      ctx.uniformMatrix4fv(p.transformation, false, wParams.transformCoordinates);
      ctx.uniform1f(p.pointSize, buffer.pointSize);
      ctx.drawArrays(ctx[type], 0, buffer.arraySize / 3);
    };

    var self = {
      reinitBuffer: function (w, h) {
        return initBuffer(w, h);
      },
      transform: function (params) {
        wParams.transformValues = params;
        wParams.transformCoordinates = getTransformationMatrix(wParams.transformValues);
      },
      drawBw: function (type) {
        render(type, particleBuffer, programBw);
      },
      drawC: function (type) {
        render(type, particleBuffer, programC);
      },
      setColumn: buffer.setColumn,
      setPointSize: function (ps) {
        buffer.pointSize = ps;
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = attachWaterfallShader;
  } else {
    window.attachWaterfallShader = attachWaterfallShader;
    if (typeof define === 'function' && define.amd) {
      define(attachWaterfallShader);
    }
  }
})(window);