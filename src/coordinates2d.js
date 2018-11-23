/* global define, attachPloygonShader, PolygonShader */
/*jslint bitwise: true */
(function (window) {
  'use strict';
  var coordinates2d = function (ctx, params) {
    var coordinatePosition = {
      lineRenderer: null,
      corners: [1, -1, 0, -1, -1, 0, -1, 1, 0],
      colors: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      backgroundCorners: [1, -1, 0, -1, -1, 0, -1, 1, 0, 1, 1, 0],
      backgroundColor: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      xTicks: [],
      xTicksColor: [],
      xTickLength: 0.1,
      yTicks: [],
      yTicksColor: [],
      yTickLength: 0.1,
      xAxis: -1,
      yAxis: -1,
      data: {
        xMinMax: [0, 0],
        yMinMax: [0, 0],
        values: [{
          color: [],
          position: [],
          xMinMax: [0, 0],
          yMinMax: [0, 0]
        }]
      }
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
          coordinatePosition.backgroundCorners[1] = coordinatePosition.xAxis;
          coordinatePosition.backgroundCorners[4] = coordinatePosition.xAxis;
        }
      }
      if (params.y) {
        if (params.y.distance) {
          coordinatePosition.yAxis = -1 + (params.y.distance * 0.02);
          coordinatePosition.corners[3] = coordinatePosition.yAxis;
          coordinatePosition.corners[6] = coordinatePosition.yAxis;
          coordinatePosition.backgroundCorners[3] = coordinatePosition.yAxis;
          coordinatePosition.backgroundCorners[6] = coordinatePosition.yAxis;
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
      if (params.backgroundColor) {
        for (var i = 0; i < 4; i++) {
          coordinatePosition.backgroundColor[3 * i] = params.backgroundColor[0];
          coordinatePosition.backgroundColor[3 * i + 1] = params.backgroundColor[1];
          coordinatePosition.backgroundColor[3 * i + 2] = params.backgroundColor[2];
        }
      }
    }
    var findMinMax = function (array) {
      var max = -Number.MAX_VALUE;
      var min = Number.MAX_VALUE;
      for (var i = 0; i < array.length; i++) {
        if (array[i] > max) max = array[i];
        if (array[i] < min) min = array[i];
      }
      return [min, max];
    }
    var self = {
      setData: function (data, styles) {
        var d = coordinatePosition.data;
        if (d.values.length < data.length) {
          for (var i = d.values.length; i < data.length; i++) {
            d.values.push({
              color: [],
              position: [],
              xMinMax: [0, 0],
              yMinMax: [0, 0]
            });
          }
        } else {
          d.values.length = data.length;
        }
        d.xMinMax = [Number.MAX_VALUE, -Number.MAX_VALUE];
        d.yMinMax = [Number.MAX_VALUE, -Number.MAX_VALUE];
        for (var i = 0; i < data.length; i++) {
          d.values[i].xMinMax = findMinMax(data[i].x);
          if (d.values[i].xMinMax[0] < d.xMinMax[0]) d.xMinMax[0] = d.values[i].xMinMax[0];
          if (d.values[i].xMinMax[1] > d.xMinMax[1]) d.xMinMax[1] = d.values[i].xMinMax[1];
          d.values[i].yMinMax = findMinMax(data[i].y);
          if (d.values[i].yMinMax[0] < d.yMinMax[0]) d.yMinMax[0] = d.values[i].yMinMax[0];
          if (d.values[i].yMinMax[1] > d.yMinMax[1]) d.yMinMax[1] = d.values[i].yMinMax[1];
        }
        var xLengthAdjust = (1 - coordinatePosition.yAxis) / (d.xMinMax[1] - d.xMinMax[0]);
        var yLengthAdjust = (1 - coordinatePosition.xAxis) / (d.yMinMax[1] - d.yMinMax[0]);
        for (var i = 0; i < data.length; i++) {
          var color = [0, 0, 0];
          if (data[i].color) {
            color = data[i].color;
          }
          d.values[i].position.length = data[i].x.length * 3;
          d.values[i].color.length = data[i].x.length * 3;
          for (var j = 0; j < data[i].x.length; j++) {
            setVertex(d.values[i].position, [(data[i].x[j] - d.xMinMax[0]) * xLengthAdjust + coordinatePosition.yAxis, (data[i].y[j] - d.yMinMax[0]) * yLengthAdjust + coordinatePosition.xAxis, 0]);
            setVertex(d.values[i].color, color);
          }
        }
      },
      draw: function (p) {
        var width = ctx.canvas.width;
        var height = ctx.canvas.height;
        if (params.backgroundColor !== 'undefined') {
          coordinatePosition.lineRenderer.draw(coordinatePosition.backgroundCorners, coordinatePosition.backgroundColor, 'TRIANGLE_FAN');
        }
        coordinatePosition.lineRenderer.draw(coordinatePosition.corners, coordinatePosition.colors, 'LINE_STRIP');
        if (params.xTicks !== 'undefined') {
          coordinatePosition.lineRenderer.draw(coordinatePosition.xTicks, coordinatePosition.xTicksColor, 'LINES');
        }
        if (params.yTicks !== 'undefined') {
          coordinatePosition.lineRenderer.draw(coordinatePosition.yTicks, coordinatePosition.yTicksColor, 'LINES');
        }
        for (var i = 0; i < coordinatePosition.data.values.length; i++) {
          coordinatePosition.lineRenderer.draw(coordinatePosition.data.values[i].position, coordinatePosition.data.values[i].color, 'LINE_STRIP');
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