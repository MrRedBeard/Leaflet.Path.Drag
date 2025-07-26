# L.Path.Drag

Refactored for Leaflet >= 1.7

Dropped any and all ie support

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
LeafletPathDrag.enable();

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
var polygon = new L.Polygon([...], { draggable: true, interactive: true }).addTo(map);
polygon.dragging.enable();

polygon.makeDraggable();

polygon
    .on('dragstart', (e) => 
    {
        console.log('start', e)
    })
    .on('drag', (e) => 
    {
        console.log('drag', e)
    })
    .on('dragend', (e) =>
    {
        console.log('end', e)
    });
```

### SVG Support
```JavaScript

const map = (window.map = new L.Map('map', {
    renderer: L.svg(),
    // X renderer: L.Canvas(), // Don't Do this
    preferCanvas: false // Ensure SVG is preferred
}).setView([22.42658, 114.1952], 11));

// X const renderer = new L.Canvas(); // Don't Do this
const renderer = new L.svg();
```

```javascript
polygon.dragging.disable();
```

## Leaflet.Path.Drag Events

Leaflet.Path.Drag introduces a drag handler for `L.Path`-based layers (polylines, polygons, etc.). It supports the following drag-related events:

### Events Emitted

#### `dragstart`

Fired once when the user begins dragging a shape.

##### Example

```javascript
polyline.on('dragstart', function (e)
{
  console.log('Drag started', e);
});
```

---

#### `predrag`

Fired on every mousemove/touchmove during dragging **before** the transform is visually applied. Can be used for constraints or custom transform logic.

##### Example

```javascript
polygon.on('predrag', function (e)
{
  console.log('Pre-drag logic triggered');
});
```

---

#### `drag`

Fired after each transform matrix update is applied. Useful for updating side effects like connected lines or tooltips.

##### Example

```javascript
layer.on('drag', function (e)
{
  console.log('Dragging', e);
});
```

---

#### `dragend`

Fired once at the end of a drag operation. Contains a `distance` field that estimates how far the path was moved in screen pixels.

##### Example

```javascript
polyline.on('dragend', function (e)
{
  console.log('Drag complete. Distance:', e.distance);
});
```

### Notes on Leaflet.Path.Drag Events

* All events provide access to the original LeafletMouseEvent or TouchEvent.
* The layer will be brought to front automatically on `dragstart`.
* Coordinates are updated internally via transform matrix projection and reprojection using the map's CRS.

### Usage Tip

To enable dragging:

```javascript
const poly = L.polygon([...], { draggable: true }).addTo(map);
LeafletPathDrag.enable();
```

---

For best performance, avoid heavy logic in `drag` or `predrag`, and defer updates to `requestAnimationFrame` where possible.

---

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
