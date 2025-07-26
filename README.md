# L.Path.Drag

Refactored for Leaflet >= 1.7

Rebuilt the Leaflet.Path.Drag plugin with a class based approach to work seamlessly with modern Leaflet (1.7+). Supports both SVG and Canvas, handles multiple drags cleanly without geometry drift or jump-back, and updates path coordinates properly. Added transform flushing, internal geometry syncing, and full renderer patching so it's stable across all layers. Exportable as either ESM or IIFE. 

Started adding JSDoc comments to make it clearer.

Drag handler for [Leaflet](https://github.com/leaflet/leaflet) vector features.
It adds dragging API and events of `L.Marker` to `L.Polygon` and `L.Polyline`.

## Info

It uses matrix transforms on SVG/VML paths, so part of it(`src/L.Path.Transform`) could be used for different transformations - skew/scale/etc - but you have to provide coordinates projection and handling yourself.

VML matrix transform tested in IE8, it has rendering glitches, but what can you expect.

## Usage

```javascript
<script src="path/to/leaflet/"></script>
<script src="path/to/L.Path.Drag.js"></script>
...
leaflet_path_drag.LeafletPathDrag.enable();

// Initialize Leaflet

var polygon = new L.Polygon([...], { color: '#f00', draggable: true, interactive: true }).addTo(map);
// you can use the drag events just like with markers
polygon
    .on('dragstart', onDragStart)
    .on('drag',      onDrag)
    .on('dragend',   onDragEnd);
```

### Enable/disable dragging

```javascript
var polygon = new L.Polygon([...], { draggable: true }).addTo(map);
polygon.dragging.enable();
polygon.dragging.disable();
```

## Development
```npm install```
```npm run build```

### Testing
See ./dist/index.html

## Credits

Credit for this plugin goes to https://github.com/w8r/Leaflet.Editable.Drag


## License

The MIT License (MIT)

Copyright (c) 2015 Alexander Milevski

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
