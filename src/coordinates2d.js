/* global define, attachPloygonShader, PolygonShader */
/*jslint bitwise: true */
(function (window) {
  'use strict';
  var coordinates2d = function (ctx, params) {
    var coordinatePosition = {
      lineRenderer: null,
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
    coordinatePosition.lineRenderer = attachPloygonShader(ctx);
    var setVertex = function (array, position) {
      for (var i = 0; i < 3; i++)
        array.push(position[i]);
    }
    if (params) {
      if (params.lineWidth)
        ctx.lineWidth(params.lineWidth);
      if (params.x) {
        if (params.x.distance) {
          coordinatePosition.xAxis = -1 + (params.x.distance * 0.02);
          coordinatePosition.corners[1] = coordinatePosition.xAxis;
          coordinatePosition.corners[4] = coordinatePosition.xAxis;
        }
      }
      if (params.y) {
        if (params.y.distance) {
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
            setVertex(coordinatePosition.xTicks, [dist * (i + 1) + coordinatePosition.yAxis, coordinatePosition.xAxis + coordinatePosition.xTickLength, 0]);
            setVertex(coordinatePosition.xTicksColor, [0, 0, 0]);
            setVertex(coordinatePosition.xTicks, [dist * (i + 1) + coordinatePosition.yAxis, coordinatePosition.xAxis - coordinatePosition.xTickLength, 0]);
            setVertex(coordinatePosition.xTicksColor, [0, 0, 0]);
            if (params.x.grid) {
              var num = Math.floor((1 - coordinatePosition.yAxis) * 10);
              for (var k = 0; k < num; k++) {
                setVertex(coordinatePosition.xTicks, [dist * (i + 1) + coordinatePosition.yAxis, coordinatePosition.xAxis + 0.025 + 0.1 * (k + 1), 0]);
                setVertex(coordinatePosition.xTicksColor, [0.5, 0.5, 0.5]);
                setVertex(coordinatePosition.xTicks, [dist * (i + 1) + coordinatePosition.yAxis, coordinatePosition.xAxis - 0.025 + 0.1 * (k + 1), 0]);
                setVertex(coordinatePosition.xTicksColor, [0.5, 0.5, 0.5]);
              }
            }
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
            setVertex(coordinatePosition.yTicks, [coordinatePosition.yAxis + coordinatePosition.yTickLength, dist * (i + 1) + coordinatePosition.xAxis, 0]);
            setVertex(coordinatePosition.yTicksColor, [0, 0, 0]);
            setVertex(coordinatePosition.yTicks, [coordinatePosition.yAxis - coordinatePosition.yTickLength, dist * (i + 1) + coordinatePosition.xAxis, 0]);
            setVertex(coordinatePosition.yTicksColor, [0, 0, 0]);
            if (params.y.grid) {
              var num = Math.floor((1 - coordinatePosition.xAxis) * 10);
              for (var k = 0; k < num; k++) {
                setVertex(coordinatePosition.yTicks, [coordinatePosition.yAxis + 0.025 + 0.1 * (k + 1), dist * (i + 1) + coordinatePosition.xAxis, 0]);
                setVertex(coordinatePosition.yTicksColor, [0.5, 0.5, 0.5]);
                setVertex(coordinatePosition.yTicks, [coordinatePosition.yAxis - 0.025 + 0.1 * (k + 1), dist * (i + 1) + coordinatePosition.xAxis, 0]);
                setVertex(coordinatePosition.yTicksColor, [0.5, 0.5, 0.5]);
              }
            }
          }
        }
      }
    }
    var self = {
      draw: function (p) {
        var width = ctx.canvas.width;
        var height = ctx.canvas.height;
        coordinatePosition.lineRenderer.draw(coordinatePosition.corners, coordinatePosition.colors, 'LINE_STRIP');
        if (params.xTicks !== 'undefined') {
          coordinatePosition.lineRenderer.draw(coordinatePosition.xTicks, coordinatePosition.xTicksColor, 'LINES');
        }
        if (params.yTicks !== 'undefined') {
          coordinatePosition.lineRenderer.draw(coordinatePosition.yTicks, coordinatePosition.yTicksColor, 'LINES');
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
