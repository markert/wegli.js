/* global define, PolygonShader */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var attachPloygonShader = function (ctx) {
    ctx.depthFunc(ctx.LEQUAL);
    new PolygonShader().getShader(ctx);
    var program = ctx.myPrograms.polygonShader;
    var positionBuffer = ctx.createBuffer();
    var colorBuffer = ctx.createBuffer();
    var wParams = {};
    initWebgl(wParams);

    var fillGraphicsArray = function (p, d, b, l) {
      ctx.bindBuffer(ctx.ARRAY_BUFFER, b);
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(d), ctx.STATIC_DRAW);
      ctx.vertexAttribPointer(p, l, ctx.FLOAT, false, 0, 0);
    };

    var render = function (type, length) {
      ctx.lineWidth(3);
      ctx.uniformMatrix4fv(program.transformation, false, wParams.transformCoordinates);
      ctx.drawArrays(type, 0, length);
    };
    var self = {
      draw: function (p, c, type) {
        ctx.useProgram(program);
        fillGraphicsArray(program.position, p, positionBuffer, 3);
        fillGraphicsArray(program.color, c, colorBuffer, 3);
        render(ctx[type], p.length / 3);
      },
      transform: function (params) {
        wParams.transformValues = params;
        wParams.transformCoordinates = getTransformationMatrix(wParams.transformValues);
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = attachPloygonShader;
  } else {
    window.attachPloygonShader = attachPloygonShader;
    if (typeof define === 'function' && define.amd) {
      define(attachPloygonShader);
    }
  }
})(window);