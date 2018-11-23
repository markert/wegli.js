/* global define, attachPloygonShader, PolygonShader */
/*jslint bitwise: true */
(function (window) {
  'use strict';
  var coordinates2d = function (ctx, params) {
    var coordinatePosition = {
      corners: [1, -1, 0, -1, -1, 0, -1, 1, 0],
      colors: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      xTicks: [],
      xTicksColor: [],
      xTickLength: 0.1,
      yTicks: [],
      yTicksColor: [],
      yTickLength: 0.1,
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
      }
      if (params.y) {
        if (params.y.distance !== 'undefined') {
          coordinatePosition.yAxis = -1 + (params.y.distance * 0.02);
          coordinatePosition.corners[3] = coordinatePosition.yAxis;
          coordinatePosition.corners[6] = coordinatePosition.yAxis;
        }
      }
      if (params.x) {
        if (params.x.ticks) {
          if (params.x.tickLength) {
            coordinatePosition.xTickLength = params.x.tickLength;
          }
          var dist = (-coordinatePosition.yAxis + 1) / (params.x.ticks + 1);
          for (var i = 0; i < params.x.ticks; i++) {
            coordinatePosition.xTicks.push(dist * (i + 1) + coordinatePosition.yAxis);
            coordinatePosition.xTicks.push(coordinatePosition.xAxis + coordinatePosition.xTickLength);
            coordinatePosition.xTicks.push(0);
            coordinatePosition.xTicks.push(dist * (i + 1) + coordinatePosition.yAxis);
            coordinatePosition.xTicks.push(coordinatePosition.xAxis - coordinatePosition.xTickLength);
            coordinatePosition.xTicks.push(0);
            for (var j = 0; j < 6; j++)
              coordinatePosition.xTicksColor.push(0);
          }

        }
      }
      if (params.y) {
        if (params.y.ticks) {
          if (params.y.tickLength) {
            coordinatePosition.yTickLength = params.y.tickLength;
          }
          var dist = (-coordinatePosition.xAxis + 1) / (params.y.ticks + 1);
          for (var i = 0; i < params.y.ticks; i++) {
            coordinatePosition.yTicks.push(coordinatePosition.yAxis + coordinatePosition.yTickLength);
            coordinatePosition.yTicks.push(dist * (i + 1) + coordinatePosition.xAxis);
            coordinatePosition.yTicks.push(0);
            coordinatePosition.yTicks.push(coordinatePosition.yAxis - coordinatePosition.yTickLength);
            coordinatePosition.yTicks.push(dist * (i + 1) + coordinatePosition.yAxis);
            coordinatePosition.yTicks.push(0);
            for (var j = 0; j < 6; j++)
              coordinatePosition.yTicksColor.push(0);
          }

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