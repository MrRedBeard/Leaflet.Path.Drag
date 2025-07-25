import { SVG } from 'leaflet';

SVG.include({

  if (SVG)
  {
      L.SVG.include(
      {

        transformPath(layer, matrix)
        {
            if (layer._path)
            {
                layer._path.setAttributeNS(null, 'transform', 'matrix(' + matrix.join(' ') + ')');
            }
        },

        _resetTransformPath(layer)
        {
            if (layer._path)
            {
                layer._path.removeAttribute('transform');
            }
        }
      });
  }


  // /**
  //  * Reset transform matrix
  //  */
  // _resetTransformPath: function (layer) {
  //   layer._path.setAttributeNS(null, 'transform', '');
  // },

  // /**
  //  * Applies matrix transformation to SVG
  //  * @param {L.Path}         layer
  //  * @param {Array.<Number>} matrix
  //  */
  // transformPath: function (layer, matrix) {
  //   layer._path.setAttributeNS(
  //     null,
  //     'transform',
  //     'matrix(' + matrix.join(' ') + ')'
  //   );
  // },
});
