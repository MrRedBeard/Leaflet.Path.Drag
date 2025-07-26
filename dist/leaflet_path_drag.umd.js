/*! LeafletPathDrag v2.0.1 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.leaflet_path_drag = {}));
})(this, (function (exports) { 'use strict';

  /**
   * LeafletPathDrag
   * https://github.com/MrRedBeard/Leaflet.Path.Drag
   * Bundles transform patches and L.Path.Drag logic esm, iife
   * Provides dragging for vector features (SVG/Canvas) using transform matrices
   * Compatible with Leaflet 1.7 and newer
   *
   * @class LeafletPathDrag
   */
  class LeafletPathDrag
  {
    /**
     * Apply all patches and extend Leaflet classes
     *
     * @static
     * @memberof LeafletPathDrag
     */
    static enable ()
    {
      // Version compatibility check
      if (!L.version || parseFloat(L.version) < 1.7)
      {
        console.warn('LeafletPathDrag may not be compatible with Leaflet < 1.7');
      }

      // ensures only patched once
      if (LeafletPathDrag._enabled) return;
      LeafletPathDrag._enabled = true;

      const { Path, Handler, DomEvent, DomUtil, Util, Browser, svg, Canvas, SVG, point, LatLngBounds } = L;

      /**
       * Patch SVG renderer to support transformPath
       * (if) ensures only patched once
       */
      if (SVG?.include && typeof SVG.include === 'function')
      {
        SVG.include(
        {
          /**
           * Applies an SVG matrix transform to the path
           * @param {L.Path} layer
           * @param {number[]} matrix - 2D transform matrix (6 elements)
           */
          transformPath(layer, matrix)
          {
            if(layer && layer._path && Array.isArray(matrix))
            {
              layer._path.setAttributeNS(null, 'transform', `matrix(${matrix.join(' ')})`);
            }
          },
          /**
           * Removes transform from an SVG path
           * @param {L.Path} layer
           */
          _resetTransformPath(layer)
          {
            if(layer?._path)
            {
              layer._path.removeAttribute('transform');
            }
          }
        });
      }

      const defaultRenderer = svg();
      if(defaultRenderer && !defaultRenderer.transformPath)
      {
        defaultRenderer.transformPath = SVG.prototype.transformPath;
        defaultRenderer._resetTransformPath = SVG.prototype._resetTransformPath;
      }

      /**
       * Patch Canvas renderer to support transformPath
       * (if) ensures only patched once
       */
      function TRUE_FN ()
      {
        return true;
      }

      if (Canvas?.include && typeof Canvas.include === 'function')
      {
        Canvas.include(
        {
          /**
           * Removes any canvas-based transform and redraws
           * @param {L.Path} layer
           */
          _resetTransformPath(layer)
          {
            if(!this._containerCopy) return;
            delete this._containerCopy;

            if(layer._containsPoint_)
            {
              layer._containsPoint = layer._containsPoint_;
              delete layer._containsPoint_;
              this._requestRedraw(layer);
            }
          },
          /**
           * Applies a matrix transform to a canvas path and redraws
           * @param {L.Path} layer
           * @param {number[]} matrix
           */
          transformPath(layer, matrix)
          {
            const m = Browser.retina ? 2 : 1;
            const bounds = this._bounds;
            const size = bounds.getSize();
            const pos = bounds.min;

            if(!this._containerCopy)
            {
              this._containerCopy = document.createElement('canvas');
              const copyCtx = this._containerCopy.getContext('2d');
              this._containerCopy.width = m * size.x;
              this._containerCopy.height = m * size.y;
              this._removePath(layer);
              this._redraw();
              copyCtx.translate(m * bounds.min.x, m * bounds.min.y);
              copyCtx.drawImage(this._container, 0, 0);
              this._initPath(layer);
              layer._containsPoint_ = layer._containsPoint;
              layer._containsPoint = TRUE_FN;
            }

            const ctx = this._ctx;
            ctx.save();
            ctx.clearRect(pos.x, pos.y, size.x * m, size.y * m);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.restore();
            ctx.save();
            ctx.drawImage(this._containerCopy, 0, 0, size.x, size.y);
            ctx.transform(...matrix);
            this._drawing = true;
            layer._updatePath();
            this._drawing = false;
            ctx.restore();
          }
        });
      }

      /**
       * Patch L.Path with transform behavior and click suppression on drag
       */
      Path.include(
      {
        _transform(matrix)
        {
          if(this._renderer)
          {
            if(matrix)
            {
              this._renderer.transformPath(this, matrix);
            }
            else
            {
              this._renderer._resetTransformPath(this);
              this._update();
            }
          }
          return this;
        },
        /**
         * Prevents click firing after drag
         * @param {Event} e
         */
        _onMouseClick(e)
        {
          if((this.dragging && this.dragging.moved()) ||
           (this._map.dragging && this._map.dragging.moved()))
          {
            return;
          }
          this._fireMouseEvent(e);
        }
      });

      // --- Implement Path.Drag Handler ---
      const END = {
        mousedown: 'mouseup',
        touchstart: 'touchend',
        pointerdown: 'touchend',
        MSPointerDown: 'touchend',
      };

      const MOVE = {
        mousedown: 'mousemove',
        touchstart: 'touchmove',
        pointerdown: 'touchmove',
        MSPointerDown: 'touchmove',
      };

      function distance(a, b)
      {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
      }

      function ensureTransformPath(renderer)
      {
        if(renderer && typeof renderer.transformPath !== 'function')
        {
          renderer.transformPath = function(layer, matrix)
          {
            if(!layer || !layer._path || !Array.isArray(matrix)) return;
            layer._path.setAttribute('transform', `matrix(${matrix.join(' ')})`);
          };
        }
      }

      Handler.PathDrag = Handler.extend(
      {
        statics: {
          DRAGGING_CLS: 'leaflet-path-draggable',
        },
        /**
         * Initializes the drag handler
         * @param {L.Path} path - The Leaflet path layer being dragged
         */
        initialize(path)
        {
          this._path = path;
          this._matrix = null;
          this._startPoint = null;
          this._dragStartPoint = null;
          this._mapDraggingWasEnabled = false;
          this._path._dragMoved = false;
        },
        addHooks ()
        {
          this._path.on('mousedown', this._onDragStart, this);
          this._path.options.className =(this._path.options.className || '') + ' ' + Handler.PathDrag.DRAGGING_CLS;
          if(this._path._path)
          {
            DomUtil.addClass(this._path._path, Handler.PathDrag.DRAGGING_CLS);
          }
        },
        removeHooks ()
        {
          this._path.off('mousedown', this._onDragStart, this);
          this._path.options.className = this._path.options.className.replace(
            new RegExp(`\\s+${Handler.PathDrag.DRAGGING_CLS}`), ''
         );
          if(this._path._path)
          {
            DomUtil.removeClass(this._path._path, Handler.PathDrag.DRAGGING_CLS);
          }
        },
        moved ()
        {
          return this._path._dragMoved;
        },
        /**
         * Handles the start of a drag operation
         * @param {L.LeafletMouseEvent} evt
         */
        _onDragStart(evt)
        {
          // Deep clone _latlngs as the true source of truth for future transforms
          this._originalLatLngs = this._deepCloneLatLngs(this._path._latlngs);

          this._path._renderer._resetTransformPath?.(this._path); // ensure previous transform gone

          this._restoreCoordGetters(); // restore original latlng accessors from last drag

          DomEvent.stop(evt.originalEvent);
          const eventType = evt.originalEvent._simulated ? 'touchstart' : evt.originalEvent.type;
          this._mapDraggingWasEnabled = false;
          
          this._startPoint = evt.containerPoint.clone();
          this._dragStartPoint = evt.containerPoint.clone();
          this._matrix = [1, 0, 0, 1, 0, 0]; // RESET every time

          // (existing: set up events, disable map drag, close popup, etc.)
          this._replaceCoordGetters(evt);

          DomUtil.addClass(this._path._renderer._container, 'leaflet-interactive');
          DomEvent.on(document, MOVE[eventType], this._onDrag, this)
            .on(document, END[eventType], this._onDragEnd, this);

          if(this._path._map.dragging.enabled())
          {
            this._path._map.dragging.disable();
            this._mapDraggingWasEnabled = true;
          }

          this._path._dragMoved = false;
          if(this._path._popup) this._path._popup.close();
        },
        /**
         * Handles the drag movement
         * @param {TouchEvent|MouseEvent} evt
         */
        _onDrag(evt)
        {
          if (!this._matrix || !this._startPoint)
          {
            console.warn('Drag skipped: missing matrix or start point');
            return;
          }

          DomEvent.stop(evt);
          const first = evt.touches?.[0] || evt;
          const containerPoint = this._path._map.mouseEventToContainerPoint(first);

          if(evt.type === 'touchmove' && !this._path._dragMoved &&
            this._dragStartPoint.distanceTo(containerPoint) <= this._path._map.options.tapTolerance)
          {
            return;
          }

          const dx = containerPoint.x - this._startPoint.x;
          const dy = containerPoint.y - this._startPoint.y;

          if(dx || dy)
          {
            if(!this._path._dragMoved)
            {
              this._path._dragMoved = true;
              this._path.options.interactive = false;
              this._path._map.dragging._draggable._moved = true;
              this._path.fire('dragstart', evt);
              this._path.bringToFront();
            }

            this._matrix[4] += dx;
            this._matrix[5] += dy;
            this._startPoint = containerPoint;

            this._path.fire('predrag', evt);
            this._path._renderer.transformPath(this._path, this._matrix);
            this._path.fire('drag', evt);
          }
        },
        /**
         * Handles drag end and applies the transformation to geometry
         * @param {TouchEvent|MouseEvent} evt
         */
        _onDragEnd(evt)
        {
          const containerPoint = this._path._map.mouseEventToContainerPoint(evt);
          if(this.moved())
          {
            this._transformPoints(this._matrix);                    // Update actual geometry
            this._path._renderer._resetTransformPath?.(this._path); // Clean visual transform
            this._path._project();                                  // Recalculate internal geometry
            this._path._updatePath();                               // Redraw shape from data
            ensureTransformPath(this._path._renderer);
            DomEvent.stop(evt);
          }

          DomEvent.off(document, 'mousemove touchmove', this._onDrag, this);
          DomEvent.off(document, 'mouseup touchend', this._onDragEnd, this);

          if(this.moved())
          {
            this._path.fire('dragend',
            {
              distance: distance(this._dragStartPoint, containerPoint)
            });

            const contains = this._path._containsPoint;
            this._path._containsPoint = Util.falseFn;
            Util.requestAnimFrame(() =>
            {
              this._path._dragMoved = false;
              this._path.options.interactive = true;
              this._path._containsPoint = contains;
            }, this);
          }

          this._matrix = null;
          this._startPoint = null;
          this._dragStartPoint = null;
          this._restoreCoordGetters();
          delete this._originalLatLngs;

          if(this._mapDraggingWasEnabled)
          {
            this._path._map.dragging.enable();
          }

          this._path._update(); // <- forces geometry + visual update
        },
        /**
         * Applies transformation matrix to coordinates and optionally returns transformed result
         * @param {number[]} matrix - The transformation matrix
         * @param {any} [dest] - Optional destination structure for transformed coordinates
         * @returns {any} The transformed coordinates or updated state
         */
        _transformPoints(matrix, dest)
        {
          if (!matrix) return;

          const path = this._path;
          const px = point(matrix[4], matrix[5]);
          const crs = path._map.options.crs;
          const scale = crs.scale(path._map.getZoom());
          const diff = crs.transformation.untransform(px, scale)
            .subtract(crs.transformation.untransform(point(0, 0), scale));
          const projection = crs.projection;
          const applyTransform = !dest;
          path._bounds = new LatLngBounds();

          if(path._point)
          {
            dest = projection.unproject(projection.project(path._latlng)._add(diff));
            if(applyTransform)
            {
              path._latlng = dest;
              path._point._add(px);
            }
          }
          else if(path._rings || path._parts)
          {
            const rings = path._rings || path._parts;
            let latlngs = path._latlngs;
            dest = dest || latlngs;
            if(!Util.isArray(latlngs[0]))
            {
              latlngs = [latlngs];
              dest = [dest];
            }

            for(let i = 0; i < rings.length; i++)
            {
              dest[i] = dest[i] || [];
              for(let j = 0; j < rings[i].length; j++)
              {
                // const latlng = latlngs[i][j];
                const latlng = this._originalLatLngs[i][j]; // ← always start from original

                dest[i][j] = projection.unproject(projection.project(latlng)._add(diff));
                if(applyTransform)
                {
                  path._bounds.extend(latlngs[i][j]);
                  rings[i][j]._add(px);
                }
              }
            }
          }

          return dest;
        },
        /**
         * Temporarily overrides path coordinate accessors with transformed versions
         */
        _replaceCoordGetters ()
        {
          if(this._path.getLatLng)
          {
            this._path.getLatLng_ = this._path.getLatLng;
            this._path.getLatLng = () => this._transformPoints(this._matrix, {});
          }
          else if(this._path.getLatLngs)
          {
            this._path.getLatLngs_ = this._path.getLatLngs;
            this._path.getLatLngs = () => this._transformPoints(this._matrix, []);
          }
        },
        /**
         * Restores original path coordinate accessors
         */
        _restoreCoordGetters ()
        {
          if(this._path.getLatLng_)
          {
            this._path.getLatLng = this._path.getLatLng_;
            delete this._path.getLatLng_;
          }
          else if(this._path.getLatLngs_)
          {
            this._path.getLatLngs = this._path.getLatLngs_;
            delete this._path.getLatLngs_;
          }
        },
        _deepCloneLatLngs(latlngs)
        {
          if (!Array.isArray(latlngs)) return latlngs;

          return latlngs.map(l =>
          {
            if (Array.isArray(l))
            {
              return this._deepCloneLatLngs(l);
            }
            return L.latLng(l.lat, l.lng);
          });
        }
      });

      Handler.PathDrag.makeDraggable = function(layer)
      {
        layer.dragging = new Handler.PathDrag(layer);
        return layer;
      };

      Path.prototype.makeDraggable = function ()
      {
        return Handler.PathDrag.makeDraggable(this);
      };

      Path.addInitHook(function ()
      {
        if(this.options.draggable)
        {
          this.options.interactive = true;
          if(this.dragging)
          {
            this.dragging.enable();
          }
          else
          {
            Handler.PathDrag.makeDraggable(this);
            this.dragging.enable();
          }
        }
        else if(this.dragging)
        {
          this.dragging.disable();
        }
      });
    }
  }

  exports.LeafletPathDrag = LeafletPathDrag;

}));
//# sourceMappingURL=leaflet_path_drag.umd.js.map
