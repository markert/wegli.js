/* global define, compileProgram */
/*jshint multistr: true */
(function (window) {
  'use strict';

  var PolygonShader = function () {
    var shaders = {
      /*
       * The vertex shader defines the position of a vertex
       * since we draw a plot, position needs only two dimensions
       * color is RGB amd uses three dimensions
       * data is passed to this shader and can be shared with the
       * fragment shader by using 'varying'
       * gl_Position and gl_PointSize define the screen output
       * for fancy effects you could do math on the position attribute
       */
      vertex: '\n\
attribute vec3 position;\n\
attribute vec3 color;\n\
varying vec3 vc;\n\
uniform mat4 uPMatrix;\n\
void main(void) {\n\
gl_Position = vec4(position, 1.);\n\
gl_PointSize = 2.0;\n\
vc=color;\n\
}',
      /*
       * the fragment shader colors and textures points and areas
       * glFragColor is the color of the resulting point
       * the desired color is in vc from the vertex shader
       */
      fragment: '\n\
precision mediump float;\n\
varying vec3 vc;\n\
void main(void) {\n\
gl_FragColor = vec4(vc, 1.);\n\
}'
    };
    var self = {
      getShader: function (ctx) {
        var ps = compileProgram(ctx, shaders.vertex, shaders.fragment);
        ps.color = ctx.getAttribLocation(ps, 'color');
        ps.position = ctx.getAttribLocation(ps, 'position');
        ps.transformation = ctx.getUniformLocation(ps, 'uPMatrix');
        ctx.enableVertexAttribArray(ps.color);
        ctx.enableVertexAttribArray(ps.position);
        if (!ctx.myPrograms) {
          ctx.myPrograms = {};
        }
        ctx.myPrograms.polygonShader = ps;
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = PolygonShader;
  } else {
    window.PolygonShader = PolygonShader;
    if (typeof define === 'function' && define.amd) {
      define(PolygonShader);
    }
  }
})(window);