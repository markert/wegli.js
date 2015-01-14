/* global define, compileProgram */
/*jshint multistr: true */
(function (window) {
  'use strict';

  var TextureShader = function () {
    var shaders = {
      vertex2d: '\n\
attribute vec3 position;\n\
attribute vec4 inputTextureCoordinate;\n\
varying vec2 textureCoordinate;\n\
void main(void) {\n\
gl_Position = vec4(position, 1.);\n\
textureCoordinate = inputTextureCoordinate.xy;\n\
}',
      vertex3d: '\n\
attribute vec3 position;\n\
attribute vec4 inputTextureCoordinate;\n\
uniform mat4 uPMatrix;\n\
varying vec2 textureCoordinate;\n\
void main(void) {\n\
gl_Position = uPMatrix * vec4(position, 1.);\n\
textureCoordinate = inputTextureCoordinate.xy;\n\
}',
      fragment: '\n\
precision mediump float;\n\
varying vec2 textureCoordinate;\n\
uniform sampler2D uSampler;\n\
void main(void) {\n\
gl_FragColor = texture2D(uSampler, textureCoordinate);\n\
}'
    };
    var self = {
      getShader3d: function (ctx) {
        var ps = compileProgram(ctx, shaders.vertex3d, shaders.fragment);
        ps.texCoord = ctx.getAttribLocation(ps, 'inputTextureCoordinate');
        ps.texPos = ctx.getAttribLocation(ps, 'position');
        ps.sampler = ctx.getUniformLocation(ps, 'uSampler');
        ps.pMatrixUniform = ctx.getUniformLocation(ps, 'uPMatrix');
        ctx.enableVertexAttribArray(ps.texCoord);
        ctx.enableVertexAttribArray(ps.texPos);
        if (!ctx.myPrograms) {
          ctx.myPrograms = {};
        }
        ctx.myPrograms.textureShader3d = ps;
      },
      getShader2d: function (ctx) {
        var ps = compileProgram(ctx, shaders.vertex2d, shaders.fragment);
        ps.texCoord = ctx.getAttribLocation(ps, 'inputTextureCoordinate');
        ps.texPos = ctx.getAttribLocation(ps, 'position');
        ps.sampler = ctx.getUniformLocation(ps, 'uSampler');
        ctx.enableVertexAttribArray(ps.texCoord);
        ctx.enableVertexAttribArray(ps.texPos);
        if (!ctx.myPrograms) {
          ctx.myPrograms = {};
        }
        ctx.myPrograms.textureShader2d = ps;
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = TextureShader;
  } else {
    window.TextureShader = TextureShader;
    if (typeof define === 'function' && define.amd) {
      define(TextureShader);
    }
  }
})(window);
