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

getTransformationMatrix = function (params) {
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
