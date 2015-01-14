/*! wegli 0.0.3 14-01-2015 */
/*! Author: Florian Markert */
/*! License: MIT */
/* exported compileProgram, createWebglContext, getTransformationMatrix, initWebgl */
'use strict';

var getShader = function (ctx, source, type) {
  var shader = ctx.createShader(type);
  ctx.shaderSource(shader, source);
  ctx.compileShader(shader);
  return shader;
};

var compileProgram = function (ctx, vertex, fragment) {
  var vs = getShader(ctx, vertex, ctx.VERTEX_SHADER);
  var fs = getShader(ctx, fragment, ctx.FRAGMENT_SHADER);
  var program = ctx.createProgram();
  ctx.attachShader(program, vs);
  ctx.attachShader(program, fs);
  ctx.linkProgram(program);
  return program;
};

var createWebglContext = function (canvas, params) {
  var ctx;
  for (var cnt = 0; cnt < params.types.length; cnt++) {
    try {
      ctx = canvas.getContext(params.types[cnt], params.attrs);
    } catch (e) {}
    if (ctx) {
      return ctx;
    }
  }
  return null;
};

// standard matrix transformation
// mixes viewport and object transformation

var getTransformationMatrix = function (params) {
  var tx = params.translate.x,
    ty = params.translate.y,
    tz = params.translate.z,
    rx = params.rotate.x,
    ry = params.rotate.y,
    rz = params.rotate.z,
    sc = params.scaling,
    di = params.distance,
    pf = params.plane.far,
    pn = params.plane.near,
    ar = params.aspectRatio;
  var cx = Math.cos(rx),
    sx = Math.sin(rx),
    cy = Math.cos(ry),
    sy = Math.sin(ry),
    cz = Math.cos(rz),
    sz = Math.sin(rz);
  if (di <= -pn) {
    // orthographic projection
    // parallelism is preserved
    return new Float32Array([
      (cy * cz * sc) / ar,
      cy * sc * sz, -sc * sy,
      0, (sc * (cz * sx * sy - cx * sz)) / ar,
      sc * (sx * sy * sz + cx * cz), cy * sc * sx,
      0, (sc * (sx * sz + cx * cz * sy)) / ar,
      sc * (cx * sy * sz - cz * sx), cx * cy * sc,
      0, (sc * (cz * ((-ty * sx - cx * tz) * sy - cy * tx) - (tz * sx - cx * ty) * sz)) / ar,
      sc * (((-ty * sx - cx * tz) * sy - cy * tx) * sz + cz * (tz * sx - cx * ty)),
      sc * (tx * sy + cy * (-ty * sx - cx * tz)),
      1
    ]);
  } else {
    // perspective projection
    // real world
    var A = di;
    var B = (pn + pf + 2 * di) / (pf - pn);
    var C = -(di * (2 * pn + 2 * pf) + 2 * pf * pn + 2 * di * di) / (pf - pn);
    return new Float32Array([
      (cy * cz * sc * A) / ar,
      cy * sc * sz * A, -sc * sy * B, -sc * sy, (sc * (cz * sx * sy - cx * sz) * A) / ar,
      sc * (sx * sy * sz + cx * cz) * A,
      cy * sc * sx * B,
      cy * sc * sx, (sc * (sx * sz + cx * cz * sy) * A) / ar,
      sc * (cx * sy * sz - cz * sx) * A,
      cx * cy * sc * B,
      cx * cy * sc, (sc * (cz * ((-ty * sx - cx * tz) * sy - cy * tx) - (tz * sx - cx * ty) * sz) * A) / ar,
      sc * (((-ty * sx - cx * tz) * sy - cy * tx) * sz + cz * (tz * sx - cx * ty)) * A,
      C + (sc * (tx * sy + cy * (-ty * sx - cx * tz)) + di) * B,
      sc * (tx * sy + cy * (-ty * sx - cx * tz)) + di
    ]);
  }
};

var initWebgl = function (webglParams) {
  webglParams.transformValues = {
    translate: {
      x: 0,
      y: 0,
      z: 0
    },
    rotate: {
      x: 0.0,
      y: 0.0,
      z: 0.0
    },
    aspectRatio: 1,
    scaling: 1.0,
    distance: 1.0,
    plane: {
      far: 1,
      near: -1
    }
  };
  webglParams.transformCoordinates = getTransformationMatrix(webglParams.transformValues);
};
;/* global define, PolygonShader */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var attachPloygonShader = function (ctx) {
    ctx.depthFunc(ctx.LEQUAL);
    new PolygonShader().getShader(ctx);
    var program = ctx.myPrograms.polygonShader;
    var positionBuffer = ctx.createBuffer();
    var colorBuffer = ctx.createBuffer();

    var fillGraphicsArray = function (p, d, b, l) {
      ctx.bindBuffer(ctx.ARRAY_BUFFER, b);
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(d), ctx.STATIC_DRAW);
      ctx.vertexAttribPointer(p, l, ctx.FLOAT, false, 0, 0);
    };

    var render = function (type, length) {
      ctx.lineWidth(3);
      ctx.drawArrays(type, 0, length);
    };
    var self = {
      draw: function (p, c, type) {
        ctx.useProgram(program);
        fillGraphicsArray(program.position, p, positionBuffer, 2);
        fillGraphicsArray(program.color, c, colorBuffer, 3);
        render(ctx[type], p.length / 2);
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
;/* global define, initWebgl, HeatmapShader, getTransformationMatrix */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var attachHeatmapShader = function (ctx, dimensions) {
    var wParams = {};
    initWebgl(wParams);
    new HeatmapShader().getHeatmapShader(ctx, false);
    new HeatmapShader().getHeatmapShader(ctx, true);
    var programC = ctx.myPrograms.heatmapShaderC;
    var programBw = ctx.myPrograms.heatmapShaderBw;
    var particleBuffer = ctx.createBuffer();
    var buffer = {};
    buffer.setPixel = function () {};
    buffer.age = 0;

    var initBuffer = function (width, height) {
      var shift = 0;
      var pointer = 0;
      buffer.age = 0;
      buffer.arraySize = 4 * width * height;
      buffer.vertices = new Float32Array(buffer.arraySize);
      for (var cnt = 0; cnt < width; cnt++) {
        var s = pointer;
        shift -= 2 / width;
        for (var i = 0; i < height; i++) {
          var data = new Float32Array(4);
          data[0] = shift + 1;
          data[1] = (i * 2 / height) - 1;
          data[2] = 0;
          data[3] = 0;
          pointer = (s + i * 4) % (buffer.arraySize);
          buffer.vertices.set(data, pointer);
        }
        pointer = (s + height * 4) % (buffer.arraySize);
      }
      ctx.bindBuffer(ctx.ARRAY_BUFFER, particleBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, buffer.vertices, ctx.DYNAMIC_DRAW);
      buffer.setPixel = function (x, y, i) {
        if (x < 0 || x > width || y < 0 || y > height) {
          return false;
        }
        var offset = (((width - x) + 1) * height * 4 - y * 4);
        var val = buffer.vertices[offset + 2] - i - buffer.vertices[offset + 3] + buffer.age;
        if (val < -1) {
          val = -1;
        } else if (val > -i && val < 0) {
          val = -i - (i + val);
        } else if (val >= 0) {
          val = -i;
        }
        buffer.vertices[offset + 2] = val;
        buffer.vertices[offset + 3] = buffer.age;
        ctx.bufferSubData(ctx.ARRAY_BUFFER, (4 * offset + 8), buffer.vertices.subarray(offset + 2, offset + 4));
      };
    };

    if (dimensions) {
      initBuffer(dimensions.x, dimensions.y);
    } else {
      initBuffer(100, 100);
    }

    var render = function (params, type, b, p) {
      ctx.useProgram(p);
      ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE);
      ctx.enable(ctx.DEPTH_TEST);
      ctx.bindBuffer(ctx.ARRAY_BUFFER, b);

      ctx.vertexAttribPointer(p.position, 3, ctx.FLOAT, false, 16, 0);
      ctx.vertexAttribPointer(p.birth, 1, ctx.FLOAT, false, 16, 12);
      ctx.lineWidth(1);
      ctx.uniform1f(p.date, buffer.age);
      ctx.uniformMatrix4fv(p.transformation, false, wParams.transformCoordinates);
      ctx.drawArrays(ctx[type], 0, buffer.arraySize / 4);
    };

    var self = {
      createBuffer: function (w, h) {
        return initBuffer(w, h);
      },
      transform: function (params) {
        wParams.transformValues = params;
        wParams.transformCoordinates = getTransformationMatrix(wParams.transformValues);
      },
      drawBw: function (params, type) {
        render(params, type, particleBuffer, programBw);
      },
      drawC: function (params, type) {
        render(params, type, particleBuffer, programC);
      },
      setPixel: buffer.setPixel,
      age: function (t) {
        buffer.age += t;
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = attachHeatmapShader;
  } else {
    window.attachHeatmapShader = attachHeatmapShader;
    if (typeof define === 'function' && define.amd) {
      define(attachHeatmapShader);
    }
  }
})(window);
;/* global define, initWebgl, HeatmapShader, getTransformationMatrix */
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
      buffer.setColumn = function (d) {
        ctx.bindBuffer(ctx.ARRAY_BUFFER, particleBuffer);
        var arrayByteSize = buffer.arraySize * 12;
        var offset = buffer.columnPointer * height * 12;
        for (var i = 0; i < d.length && i < height; i++) {
          var data = new Float32Array(3);
          data[0] = buffer.xOffset + 1;
          data[1] = (i * 2 / d.length) - 1;
          data[2] = -d[i];
          ctx.bufferSubData(ctx.ARRAY_BUFFER, (offset + i * 12) % arrayByteSize, data);
        }

        buffer.columnPointer = (buffer.columnPointer + 1) % width;
        buffer.xOffset += buffer.speed;
      };
    };

    if (dimensions) {
      initBuffer(dimensions.x, dimensions.y);
    } else {
      initBuffer(100, 100);
    }

    var render = function (params, type, b, p) {
      ctx.useProgram(p);
      ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE);
      ctx.enable(ctx.DEPTH_TEST);
      ctx.bindBuffer(ctx.ARRAY_BUFFER, b);

      ctx.vertexAttribPointer(p.position, 3, ctx.FLOAT, false, 12, 0);
      ctx.lineWidth(1);
      ctx.uniform1f(p.shift, buffer.xOffset);
      ctx.uniformMatrix4fv(p.transformation, false, wParams.transformCoordinates);
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
      drawBw: function (params, type) {
        render(params, type, particleBuffer, programBw);
      },
      drawC: function (params, type) {
        render(params, type, particleBuffer, programC);
      },
      setColumn: buffer.setColumn
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
;/* global define, initWebgl, TextureShader */
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
