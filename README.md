# wegli.js

A webgl shader example library.

Note: coordinates: -1<=x<=1; -1<=y<=1

Initializing a webgl context:
```javascript
  // returns the webgl context or null
  // canvas must be a DOM canvas element with widh>0 and height>0
  var ctx = createWebglContext(canvas, {
  // types to try - may exclude experimental types
    types: ['webgl', 'experimental-webgl'],
    attrs: { // attributes
      antialias: true
    }
  });
```
Attaching a shader to the webgl context:
```javascript
  // for polygons, lines and points
  var lineRenderer = attachPloygonShader(ctx);
  // for heatmap surfaces
  var hmRenderer = attachHeatmapShader(ctx, {
    x: 200, // points in x direction
    y: 100  // points in y direction
    // 200*100=20000 points for heatmap
  });
  // for waterfall surfaces
  var wfRenderer = attachWaterfallShader(ctx, {
    x: 200, // points in x direction
    y: 100 // points in y direction
    // 200*100=20000 points for waterfall
  });
  // for textures (like text)
  var teRenderer = attachTextureShader(ctx);
```

Using polygon shaders:
```javascript
  var p = [0,0,0.5,0.5,0.5,0.7];
  var c = [1,0,0,0,1,0,0,0,1];
  // draws a line (0,0)->(0.5,0.5)->(0.5,0.7)
  // color gradients between points red->green->blue
  // POINTS, LINES, TRIANGLES, TRIANGLE_STRIP, TRIANGLE_FAN also possible
  lineRenderer.draw(p, c, 'LINE_STRIP');
```

Using texture shaders:
```javascript
  // size of texture for auto text rendering
  teRenderer.setTextureSize(256, 256);
  // maximal number of textures buffered
  // note: creation is expensive
  teRenderer.setTextureBufferSize(50);
  // style and position of the text
  var textStyle = {
    font: '18px/30px Arial, serif',
    fill: '#000000',
    stroke: '#000000',
    plane: 'n', //n:2D, x,y,z:plane in 3D
    pos: [0.0, 0.0, 0.0]
  };
  // write to canvas
  teRenderer.writeText('hello', textStyle);
  // style attributes for precomputed texture
  var textureStyle = {
    redraw: true, // texture changed -> redraw buffer
    plane: 'n', //n:2D, x,y,z:plane in 3D
    pos: [0.0, 0.0, 0.0]
  };
  // draw predefined texture from any2dCanvas
  // create a canvas, put something in it and convert it
  // to a webgl texture
  teRenderer.drawTexture(any2dCanvas, textureStyle);
```
Using waterfall shaders:
```javascript
  // reinit buffer
  wfRenderer.reinitBuffer(200,100);
  // change size of points drawn
  wfRenderer.setPointSize(3);
  var d = [];
  for (var i = 0; i < 100; i++) {
    d[i] = i/100;
  }
  // add a nuew column
  // all older columns are shifted one pixel left
  wfRenderer.setColumn(d);
  // draw a colored waterfall
  // POINTS, LINES, TRIANGLES, TRIANGLE_STRIP, TRIANGLE_FAN also possible
  wfRenderer.drawC('POINTS');
  // draw a black/white waterfall
  // POINTS, LINES, TRIANGLES, TRIANGLE_STRIP, TRIANGLE_FAN also possible
  wfRenderer.drawBw('POINTS');
```
Using heatmap shaders:
```javascript
  // reinit buffer
  hmRenderer.reinitBuffer(200,100);
  // change size of points drawn
  hmRenderer.setPointSize(3);
  // imcrease pixel (45, 17) by 0.3
  // pixel color range from 0 to 1
  hmRenderer.setPixel(45, 17, 0.3);
  // draw a colored heatmap
  // POINTS, LINES, TRIANGLES, TRIANGLE_STRIP, TRIANGLE_FAN also possible
  hmRenderer.drawC('POINTS');
  // draw a black/white heatmap
  // POINTS, LINES, TRIANGLES, TRIANGLE_STRIP, TRIANGLE_FAN also possible
  hmRenderer.drawBw('POINTS');
  // decrease all pixels by 0.002
  hmRenderer.age(0.002);
```
Setting transformation:
```javascript
  // works for every renderer
  // rotates, translates, scales scene
  renderer.transform({
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
  });
```
