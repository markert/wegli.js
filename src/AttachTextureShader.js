/* global define, initWebgl, TextureShader */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var attachTextureShader = function (ctx) {
    new TextureShader().getShader2d(ctx);
    var program2d = ctx.myPrograms.textureShader2d;
    new TextureShader().getShader3d(ctx);
    var program3d = ctx.myPrograms.textureShader3d;
    var ctxTexture = document.createElement('canvas').getContext('2d');
    ctxTexture.canvas.width = 256;
    ctxTexture.canvas.height = 256;
    var wParams = {};
    initWebgl(wParams);

    var textureInstances = {};
    var webglTextures = [];
    var id = 1;
    var maxTextures = 64;
    var backgroundCoordinates = {};
    var textureCoordinates = {};
    var position = ctx.createBuffer();
    var textureB = ctx.createBuffer();

    backgroundCoordinates.n = [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, 1.0, 0.0];
    backgroundCoordinates.x = [0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, 1.0];
    backgroundCoordinates.y = [-1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
    backgroundCoordinates.z = [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, 1.0, 0.0];

    textureCoordinates.x = [0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0];
    textureCoordinates.y = [1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0];
    textureCoordinates.z = [1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0];
    textureCoordinates.n = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0];

    var setupTextCanvas = function (style) {
      ctxTexture.font = style.font;
      ctxTexture.fillStyle = style.fill;
      ctxTexture.strokeStyle = style.stroke;
      ctxTexture.textAlign = 'left';
      ctxTexture.textBaseline = 'bottom';
    };

    /*jslint bitwise: true */
    var isPowerOfTwo = function (value) {
      if (!(value & value - 1)) {
        return true;
      }
      return false;
    };

    var getTexture = function (text) {
      textureInstances[text] = {};
      textureInstances[text].used = new Date();
      if (id < maxTextures) {
        textureInstances[text].id = id;
        id++;
        return id - 1;
      } else {
        var element, remove, increment;
        var diff = -Number.MAX_VALUE;
        for (element in textureInstances) {
          if (textureInstances[text].used - textureInstances[element].used > diff) {
            diff = textureInstances[text].used - textureInstances[element].used;
            remove = element;
          }
          if (textureInstances[element].id === 0) {
            increment = element;
          }
        }
        if (diff > 1000) {
          textureInstances[text].id = textureInstances[remove].id;
          delete textureInstances[remove];
        } else {
          textureInstances[text].id = 0;
          if (increment) {
            delete textureInstances[increment];
          }
        }
        return textureInstances[text].id;
      }
    };

    var renderText = function (text, style) {
      ctxTexture.clearRect(0, 0, ctxTexture.canvas.width, ctxTexture.canvas.height);
      setupTextCanvas(style);
      ctxTexture.fillText(text, ctxTexture.canvas.width / 2, ctxTexture.canvas.height / 2);
    };

    var prepareTexture = function (style, create, id) {

      if (style.plane !== 'n') {
        ctx.useProgram(program3d);
        ctx.uniformMatrix4fv(program3d.pMatrixUniform, false, wParams.transformCoordinates);
      }

      if (create) {
        if (!webglTextures[id]) {
          webglTextures[id] = ctx.createTexture();
        } else if (!ctx.isTexture(webglTextures[id])) {
          webglTextures[id] = ctx.createTexture();
        }

        ctx.bindTexture(ctx.TEXTURE_2D, webglTextures[id]);

        ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
        ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        if (isPowerOfTwo(ctxTexture.canvas.width) && isPowerOfTwo(ctxTexture.canvas.height)) {
          ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
          ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
        } else {
          ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
          ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
          ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
          ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
        }
      }
    };

    var bg = [];

    var drawTexture = function (style, texture, id, redraw) {
      var program;
      ctx.depthFunc(ctx.LEQUAL);
      if (style.plane !== 'n') {
        program = program3d;
      } else {
        program = program2d;
      }
      ctx.useProgram(program);
      bg.length = 0;
      var xDiv = ctxTexture.canvas.width / ctx.canvas.width;
      var yDiv = ctxTexture.canvas.height / ctx.canvas.height;
      var zDiv = 1;

      if (style.plane === 'y') {
        zDiv = yDiv;
        yDiv = 1;
      } else if (style.plane === 'x') {
        zDiv = yDiv;
        yDiv = xDiv;
        xDiv = 1;
      }

      for (var cnt = 0; cnt < backgroundCoordinates[style.plane].length / 3; cnt++) {
        bg[cnt * 3] = backgroundCoordinates[style.plane][cnt * 3] * xDiv + style.pos[0];
        bg[cnt * 3 + 1] = backgroundCoordinates[style.plane][cnt * 3 + 1] * yDiv + style.pos[1];
        bg[cnt * 3 + 2] = backgroundCoordinates[style.plane][cnt * 3 + 2] * zDiv + style.pos[2];
      }
      if (!redraw) {
        ctx.bindTexture(ctx.TEXTURE_2D, webglTextures[id]);
      }

      ctx.activeTexture(ctx.TEXTURE0);
      ctx.bindBuffer(ctx.ARRAY_BUFFER, position);
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(bg), ctx.STATIC_DRAW);
      ctx.vertexAttribPointer(program.texPos, 3, ctx.FLOAT, 0, 0, bg);
      ctx.bindBuffer(ctx.ARRAY_BUFFER, textureB);
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(textureCoordinates[style.plane]), ctx.STATIC_DRAW);
      ctx.vertexAttribPointer(program.texCoord, 2, ctx.FLOAT, 0, 0, textureCoordinates[style.plane]);
      if (redraw && texture && texture.width > 0 && texture.height > 0 && ctx.canvas.height > 0 && ctx.canvas.width > 0) {
        ctx.uniform1i(program.sampler, 0);
        ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, texture);
      }
      if (texture && texture.width > 0 && texture.height > 0 && ctx.canvas.height > 0 && ctx.canvas.width > 0) {
        ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);
      }
    };

    var self = {
      writeText: function (text, style) {
        var s = style.font + style.fill + style.stroke;
        if (!textureInstances[text + s]) {
          var num = getTexture(text + s);
          prepareTexture(style, true, num);
          renderText(text, style);
          drawTexture(style, ctxTexture.canvas, num, true);
        } else {
          textureInstances[text + s].used = new Date();
          prepareTexture(style, false, textureInstances[text + s].id);
          drawTexture(style, ctxTexture.canvas, textureInstances[text + s].id, false);
        }

      },
      draw3dTexture: function (texture, style) {
        prepareTexture(style, style.redraw, 0);
        drawTexture(style, texture, 0, style.redraw);
      },
      draw2dTexture: function (texture, style) {
        prepareTexture(style, style.redraw, 0);
        drawTexture(style, texture, 0, style.redraw);
      },
      setTextureSize: function (w, h) {
        ctxTexture.canvas.width = w;
        ctxTexture.canvas.height = h;
      },
      setTextureBufferSize: function (s) {
        maxTextures = s;
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = attachTextureShader;
  } else {
    window.attachTextureShader = attachTextureShader;
    if (typeof define === 'function' && define.amd) {
      define(attachTextureShader);
    }
  }
})(window);
