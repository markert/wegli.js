/* global define, compileProgram */
/*jshint multistr: true */
(function (window) {
  'use strict';

  var HeatmapShader = function () {
    var shaders = {
      vertexFloating: '\n\
attribute vec3 position;\n\
uniform float shift;\n\
uniform float ps;\n\
varying float height;\n\
uniform mat4 uPMatrix;\n\
void main(void) {\n\
gl_Position = uPMatrix * vec4(position.x - shift, position.y, position.z, 1.);\n\
height=-4.0*position.z;\n\
gl_PointSize = ps;\n\
}',
      vertexAging: '\n\
attribute vec3 position;\n\
attribute float birth;\n\
varying float height;\n\
uniform mat4 uPMatrix;\n\
uniform float ps;\n\
uniform float date;\n\
void main(void) {\n\
float zpos = position.z+date-birth;\n\
if (zpos > 0.0) zpos = 0.0;\n\
if (zpos < -2.0) zpos = -2.0;\n\
gl_Position = uPMatrix * vec4(position.x, position.y, zpos, 1.);\n\
height=-4.0*zpos;\n\
gl_PointSize = ps;\n\
}',
      fragmentColor: '\n\
precision mediump float;\n\
varying float height;\n\
void main(void) {\n\
vec3 cs = vec3(0.5,0,0);\n\
if (0.0 <= height && height <= 0.5) cs = vec3(0,0,height+0.5);\n\
else if (0.5 < height && height <= 1.5) cs = vec3(0,height-0.5,1);\n\
else if (1.5 < height && height <= 2.5) cs = vec3(height-1.5,1,2.5-height);\n\
else if (2.5 < height && height <= 3.5) cs = vec3(1,3.5-height,0);\n\
else if (3.5 < height && height <= 4.0) cs = vec3(4.5-height,0,0);\n\
gl_FragColor = vec4(cs, 1.);\n\
}',
      fragmentBw: '\n\
precision mediump float;\n\
varying float height;\n\
void main(void) {\n\
vec3 cs = vec3(height/4.0,height/4.0,height/4.0);\n\
gl_FragColor = vec4(cs, 1.);\n\
}'
    };

    var self = {
      getHeatmapShader: function (ctx, coloring) {
        var fs = shaders.fragmentBw;
        if (coloring) {
          fs = shaders.fragmentColor;
        }
        var ps = compileProgram(ctx, shaders.vertexAging, fs);
        ps.position = ctx.getAttribLocation(ps, 'position');
        ps.birth = ctx.getAttribLocation(ps, 'birth');
        ps.transformation = ctx.getUniformLocation(ps, 'uPMatrix');
        ps.pointSize = ctx.getUniformLocation(ps, 'ps');
        ps.date = ctx.getUniformLocation(ps, 'date');
        ctx.enableVertexAttribArray(ps.position);
        ctx.enableVertexAttribArray(ps.birth);
        if (!ctx.myPrograms) {
          ctx.myPrograms = {};
        }
        if (coloring) {
          ctx.myPrograms.heatmapShaderC = ps;
        } else {
          ctx.myPrograms.heatmapShaderBw = ps;
        }

      },
      getFloatingShader: function (ctx, coloring) {
        var fs = shaders.fragmentBw;
        if (coloring) {
          fs = shaders.fragmentColor;
        }
        var ps = compileProgram(ctx, shaders.vertexFloating, fs);
        ps.position = ctx.getAttribLocation(ps, 'position');
        ps.shift = ctx.getUniformLocation(ps, 'shift');
        ps.pointSize = ctx.getUniformLocation(ps, 'ps');
        ps.transformation = ctx.getUniformLocation(ps, 'uPMatrix');
        ctx.enableVertexAttribArray(ps.position);
        ctx.enableVertexAttribArray(ps.currentShift);
        if (!ctx.myPrograms) {
          ctx.myPrograms = {};
        }
        if (coloring) {
          ctx.myPrograms.floatingShaderC = ps;
        } else {
          ctx.myPrograms.floatingShaderBw = ps;
        }
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = HeatmapShader;
  } else {
    window.HeatmapShader = HeatmapShader;
    if (typeof define === 'function' && define.amd) {
      define(HeatmapShader);
    }
  }
})(window);