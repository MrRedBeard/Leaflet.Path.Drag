import { SVG } from 'leaflet';

/**
 * Monkey-patch L.SVG to support transformPath()
 */
SVG.include(
{
  /**
   * Applies matrix transformation to SVG
   * @param {L.Path} layer
   * @param {Array.<Number>} matrix
   */
  transformPath (layer, matrix)
  {
    if (!layer || !layer._path || !Array.isArray(matrix)) return;
    layer._path.setAttribute('transform', 'matrix(' + matrix.join(' ') + ')');
  },

  /**
   * Removes SVG transform attribute
   * @param {L.Path} layer
   */
  _resetTransformPath (layer)
  {
    if (layer._path)
    {
      layer._path.removeAttribute('transform');
    }
  }
});
