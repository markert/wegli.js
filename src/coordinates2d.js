/* global define, attachPloygonShader, PolygonShader */
/*jslint bitwise: true */
(function (window) {
  'use strict';
  var coordinates2d = function (ctx, params) {
    var p = [1, -1, 0, -1, -1, 0, -1, 1, 0];
    var c = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    var coordinatePosition = {
      corners: [1, -1, 0, -1, -1, 0, -1, 1, 0],
      colors: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      xTicks: [],
      xTicksColor: [],
      yTicks: [],
      yTicksColor: [],
      xAxis: -1,
      yAxis: -1
    }
    var ticks = [];
    var ticksColor = [];
    var lineRenderer = attachPloygonShader(ctx);
    if (params) {
      if (params.lineWidth !== 'undefined')
        ctx.lineWidth(params.lineWidth);
      if (params.x) {
        if (params.x.distance !== 'undefined') {
          coordinatePosition.xAxis = -1 + (params.x.distance * 0.02);
          coordinatePosition.corners[1] = coordinatePosition.xAxis;
          coordinatePosition.corners[4] = coordinatePosition.xAxis;
        }
        if (params.x.ticks !== 'undefined') {
          var dist = 2 / (params.x.ticks + 1);
          for (var i; i < params.x.ticks; i++) {
            //  ticks.push();
          }

        }
      }
      if (params.y) {
        if (params.y.distance !== 'undefined') {
          coordinatePosition.yAxis = -1 + (params.y.distance * 0.02);
          coordinatePosition.corners[3] = coordinatePosition.yAxis;
          coordinatePosition.corners[6] = coordinatePosition.yAxis;
        }
      }

    }
    var self = {
      draw: function (p) {
        var width = ctx.canvas.width;
        var height = ctx.canvas.height;
        lineRenderer.draw(coordinatePosition.corners, coordinatePosition.colors, 'LINE_STRIP');
        if (params.xTicks !== 'undefined') {
          lineRenderer.draw(coordinatePosition.xTicks, coordinatePosition.xTicksColor, 'LINES');
        }
        if (params.yTicks !== 'undefined') {
          lineRenderer.draw(coordinatePosition.yTicks, coordinatePosition.yTicksColor, 'LINES');
        }
      },
      lineWidth: function (lineWidth) {
        params.lineWidth = lineWidth;
        ctx.lineWidth(lineWidth);
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = coordinates2d;
  } else {
    window.coordinates2d = coordinates2d;
    if (typeof define === 'function' && define.amd) {
      define(coordinates2d);
    }
  }
})(window);