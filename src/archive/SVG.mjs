import { SVG, svg } from 'leaflet';

SVG.include({
  /**
   * Applies matrix transformation to SVG
   * @param {L.Path} layer
   * @param {Array.<Number>} matrix
   */
  transformPath(layer, matrix)
  {
    //if (!layer || !layer._path || !Array.isArray(matrix)) return;

    layer._path.setAttributeNS(null, 'transform', 'matrix(' + matrix.join(' ') + ')');
  },

  /**
   * Resets transform matrix
   * @param {L.Path} layer
   */
  _resetTransformPath(layer)
  {
    if (layer._path)
    {
      layer._path.removeAttribute('transform');
    }
  }
});

// Force it onto the actual default renderer instance
const defaultRenderer = svg(); // This is usually what Leaflet uses

if (defaultRenderer && defaultRenderer.transformPath === undefined)
{
  defaultRenderer.transformPath = SVG.prototype.transformPath;
  defaultRenderer._resetTransformPath = SVG.prototype._resetTransformPath;
}
