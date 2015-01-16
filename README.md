# wegli.js

A webgl shader example library.

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
