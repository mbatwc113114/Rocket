/**
 * ============================================================================
 * ROKETRY AEROSPACE PLATFORM - VECTOR MINDMAP CANVAS ENGINE (mindmap.js)
 * ============================================================================
 * Implements 100% scale-invariant picture-mode vector mindmap canvas geometry,
 * magnetic box snap point detection, 4-point dual-side cubic Bezier control points,
 * zero-offset SVG arrowhead alignment, and sub-node dragging engine.
 *
 * @module Modules/MindmapEngine
 * @architecture Interactive Canvas Controller
 */

// Global custom mindmap curve drag store
export const lineCustomPoints = {};

/**
 * Calculates closest magnetic border snap point (Top, Bottom, Left, Right)
 * using unscaled DOM offset geometry (offsetLeft, offsetTop, offsetWidth, offsetHeight).
 * Invariant to CSS scale(...) transforms.
 *
 * @param {number} fromX - Target reference X coordinate
 * @param {number} fromY - Target reference Y coordinate
 * @param {HTMLElement} boxEl - Target HTML box element
 * @returns {Object} { x, y, side }
 */
export function getClosestBoxSnapPoint(fromX, fromY, boxEl) {
  const left = boxEl.offsetLeft;
  const top = boxEl.offsetTop;
  const right = left + boxEl.offsetWidth;
  const bottom = top + boxEl.offsetHeight;
  const midX = Math.round(left + boxEl.offsetWidth / 2);
  const midY = Math.round(top + boxEl.offsetHeight / 2);

  const points = [
    { x: midX, y: top, side: 'top' },
    { x: midX, y: bottom, side: 'bottom' },
    { x: left, y: midY, side: 'left' },
    { x: right, y: midY, side: 'right' }
  ];

  let minDistance = Infinity;
  let closest = points[0];

  points.forEach(pt => {
    const dist = Math.hypot(pt.x - fromX, pt.y - fromY);
    if (dist < minDistance) {
      minDistance = dist;
      closest = pt;
    }
  });

  return closest;
}

/**
 * Calculates initial control point extending perpendicular/normal to box border.
 */
export function getPerpendicularControlPoint(x, y, side, distance = 60) {
  switch (side) {
    case 'top': return { x: x, y: y - distance };
    case 'bottom': return { x: x, y: y + distance };
    case 'left': return { x: x - distance, y: y };
    case 'right': return { x: x + distance, y: y };
    default: return { x: x, y: y - distance };
  }
}

/**
 * Adds interactive 4-point Bezier handles (Start, End, Dual Control Points).
 */
export function addLine4PointHandles(svg, group, x1, y1, x2, y2, ctrlX1, ctrlY1, ctrlX2, ctrlY2, lineId) {
  const points = [
    { x: x1, y: y1, fill: '#3b82f6', role: 'start' },
    { x: ctrlX1, y: ctrlY1, fill: '#f59e0b', role: 'ctrl1' },
    { x: ctrlX2, y: ctrlY2, fill: '#f59e0b', role: 'ctrl2' },
    { x: x2, y: y2, fill: '#10b981', role: 'end' }
  ];

  const helperLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  helperLine1.setAttribute('class', 'line-drag-handle');
  helperLine1.setAttribute('stroke', 'rgba(245, 158, 11, 0.45)');
  helperLine1.setAttribute('stroke-dasharray', '3 3');
  group.appendChild(helperLine1);

  const helperLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  helperLine2.setAttribute('class', 'line-drag-handle');
  helperLine2.setAttribute('stroke', 'rgba(245, 158, 11, 0.45)');
  helperLine2.setAttribute('stroke-dasharray', '3 3');
  group.appendChild(helperLine2);

  const updateHelpers = () => {
    helperLine1.setAttribute('x1', x1); helperLine1.setAttribute('y1', y1);
    helperLine1.setAttribute('x2', ctrlX1); helperLine1.setAttribute('y2', ctrlY1);
    helperLine2.setAttribute('x1', x2); helperLine2.setAttribute('y1', y2);
    helperLine2.setAttribute('x2', ctrlX2); helperLine2.setAttribute('y2', ctrlY2);
  };
  updateHelpers();

  points.forEach(pt => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pt.x);
    circle.setAttribute('cy', pt.y);
    circle.setAttribute('r', pt.role.includes('ctrl') ? '5' : '6.5');
    circle.setAttribute('fill', pt.fill);
    circle.setAttribute('stroke', '#ffffff');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('class', 'line-drag-handle');
    circle.style.cursor = 'grab';
    circle.style.pointerEvents = 'all';

    let isDraggingHandle = false;

    circle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      isDraggingHandle = true;
      circle.style.cursor = 'grabbing';

      const canvasInner = document.getElementById('mindmap-canvas-inner');
      const cRect = canvasInner ? canvasInner.getBoundingClientRect() : { left: 0, top: 0 };
      const currentZoom = window.mindmapZoom || 1.0;

      const onHandleMove = (moveEvt) => {
        if (!isDraggingHandle) return;
        const currentZoom = window.mindmapZoom || 1.0;
        let mouseX = Math.round((moveEvt.clientX - cRect.left) / currentZoom);
        let mouseY = Math.round((moveEvt.clientY - cRect.top) / currentZoom);

        if (pt.role === 'ctrl1') {
          ctrlX1 = mouseX; ctrlY1 = mouseY;
        } else if (pt.role === 'ctrl2') {
          ctrlX2 = mouseX; ctrlY2 = mouseY;
        }

        lineCustomPoints[lineId] = { ctrlX1, ctrlY1, ctrlX2, ctrlY2 };

        const pathEl = group.querySelector('path');
        if (pathEl) {
          pathEl.setAttribute('d', `M ${x1} ${y1} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${x2} ${y2}`);
        }
        updateHelpers();
        circle.setAttribute('cx', mouseX);
        circle.setAttribute('cy', mouseY);
      };

      const onHandleUp = () => {
        isDraggingHandle = false;
        circle.style.cursor = 'grab';
        document.removeEventListener('pointermove', onHandleMove);
        document.removeEventListener('pointerup', onHandleUp);
      };

      document.addEventListener('pointermove', onHandleMove);
      document.addEventListener('pointerup', onHandleUp);
    });

    group.appendChild(circle);
  });
}

/**
 * Draws 4-point dual-side Bezier curve from root to main branch.
 */
export function drawOrganicRootCurve(svg, startSnap, endSnap, color, strokeWidth = 3.5, lineId = 'root') {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('class', 'connector-group');

  const x1 = startSnap.x, y1 = startSnap.y;
  const x2 = endSnap.x, y2 = endSnap.y;

  let ctrlX1, ctrlY1, ctrlX2, ctrlY2;
  if (lineCustomPoints[lineId]) {
    ctrlX1 = lineCustomPoints[lineId].ctrlX1;
    ctrlY1 = lineCustomPoints[lineId].ctrlY1;
    ctrlX2 = lineCustomPoints[lineId].ctrlX2;
    ctrlY2 = lineCustomPoints[lineId].ctrlY2;
  } else {
    const c1 = getPerpendicularControlPoint(x1, y1, startSnap.side, 60);
    const c2 = getPerpendicularControlPoint(x2, y2, endSnap.side, 60);
    ctrlX1 = c1.x; ctrlY1 = c1.y;
    ctrlX2 = c2.x; ctrlY2 = c2.y;
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M ${x1} ${y1} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${x2} ${y2}`);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', strokeWidth);
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('marker-end', 'url(#arrow-blue)');
  path.style.cursor = 'pointer';
  path.style.pointerEvents = 'all';

  group.appendChild(path);
  addLine4PointHandles(svg, group, x1, y1, x2, y2, ctrlX1, ctrlY1, ctrlX2, ctrlY2, lineId);
  svg.appendChild(group);
}

/**
 * Draws 4-point dual-side Bezier curve from main branch to sub-node.
 */
export function drawOrganicSubnodeCurve(svg, startSnap, endSnap, color, strokeWidth = 2.2, lineId = 'sub') {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('class', 'connector-group');

  const x1 = startSnap.x, y1 = startSnap.y;
  const x2 = endSnap.x, y2 = endSnap.y;

  let ctrlX1, ctrlY1, ctrlX2, ctrlY2;
  if (lineCustomPoints[lineId]) {
    ctrlX1 = lineCustomPoints[lineId].ctrlX1;
    ctrlY1 = lineCustomPoints[lineId].ctrlY1;
    ctrlX2 = lineCustomPoints[lineId].ctrlX2;
    ctrlY2 = lineCustomPoints[lineId].ctrlY2;
  } else {
    const c1 = getPerpendicularControlPoint(x1, y1, startSnap.side, 45);
    const c2 = getPerpendicularControlPoint(x2, y2, endSnap.side, 45);
    ctrlX1 = c1.x; ctrlY1 = c1.y;
    ctrlX2 = c2.x; ctrlY2 = c2.y;
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M ${x1} ${y1} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${x2} ${y2}`);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', strokeWidth);
  path.setAttribute('stroke-linecap', 'round');
  path.style.cursor = 'pointer';
  path.style.pointerEvents = 'all';

  group.appendChild(path);
  addLine4PointHandles(svg, group, x1, y1, x2, y2, ctrlX1, ctrlY1, ctrlX2, ctrlY2, lineId);
  svg.appendChild(group);
}

/**
 * Renders all mindmap organic Bezier connector lines in 1:1 unscaled canvas space.
 */
export function renderOrganicConnectorLines() {
  const svg = document.getElementById('mindmap-svg');
  if (!svg) return;

  const existingElements = svg.querySelectorAll('g.connector-group, path, circle.line-drag-handle');
  existingElements.forEach(el => el.remove());

  const rootNode = document.getElementById('root-node-box');
  if (!rootNode) return;

  const branchBoxes = document.querySelectorAll('.mindmap-main-branch-box');

  branchBoxes.forEach(box => {
    const color = box.dataset.color || '#3b82f6';
    const bCenterX = Math.round(box.offsetLeft + box.offsetWidth / 2);
    const bCenterY = Math.round(box.offsetTop + box.offsetHeight / 2);

    const startSnap = getClosestBoxSnapPoint(bCenterX, bCenterY, rootNode);
    const endSnap = getClosestBoxSnapPoint(startSnap.x, startSnap.y, box);

    drawOrganicRootCurve(svg, startSnap, endSnap, color, 3.5, box.dataset.id);

    const branchId = box.dataset.id;
    const subitems = document.querySelectorAll(`.mindmap-subnode-wrapper[data-branchid="${branchId}"]`);
    subitems.forEach(sub => {
      const sCenterX = Math.round(sub.offsetLeft + sub.offsetWidth / 2);
      const sCenterY = Math.round(sub.offsetTop + sub.offsetHeight / 2);

      const subStartSnap = getClosestBoxSnapPoint(sCenterX, sCenterY, box);
      const subEndSnap = getClosestBoxSnapPoint(subStartSnap.x, subStartSnap.y, sub);

      drawOrganicSubnodeCurve(svg, subStartSnap, subEndSnap, color, 2.2, sub.dataset.subid);
    });
  });
}

/**
 * Draggable shape engine for HTML node boxes.
 */
export function makeBoxDraggable(element, nodeData, onDragEnd) {
  if (typeof nodeData === 'function') {
    onDragEnd = nodeData;
    nodeData = {};
  }
  let isDragging = false;
  let hasDragged = false;

  element.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.primary-btn') || e.target.closest('.btn-add-subnode') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    isDragging = true;
    hasDragged = false;
    element.classList.add('is-dragging');

    const canvasInner = document.getElementById('mindmap-canvas-inner');
    const cRect = canvasInner ? canvasInner.getBoundingClientRect() : { left: 0, top: 0 };
    const currentZoom = window.mindmapZoom || 1.0;

    const initialLeft = element.offsetLeft;
    const initialTop = element.offsetTop;

    const startCanvasMouseX = (e.clientX - cRect.left) / currentZoom;
    const startCanvasMouseY = (e.clientY - cRect.top) / currentZoom;

    element.style.position = 'absolute';
    element.style.left = initialLeft + 'px';
    element.style.top = initialTop + 'px';
    element.style.margin = '0';
    element.style.zIndex = '100';

    const onPointerMove = (moveEvt) => {
      if (!isDragging) return;

      const currentZoom = window.mindmapZoom || 1.0;
      const mouseCanvasX = (moveEvt.clientX - cRect.left) / currentZoom;
      const mouseCanvasY = (moveEvt.clientY - cRect.top) / currentZoom;

      const dx = mouseCanvasX - startCanvasMouseX;
      const dy = mouseCanvasY - startCanvasMouseY;

      const currentLeft = Math.max(10, Math.round(initialLeft + dx));
      const currentTop = Math.max(10, Math.round(initialTop + dy));

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged = true;
      }

      element.style.left = currentLeft + 'px';
      element.style.top = currentTop + 'px';

      renderOrganicConnectorLines();
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      element.classList.remove('is-dragging');
      element.style.zIndex = '5';

      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);

      if (hasDragged && onDragEnd) {
        const finalLeft = parseFloat(element.style.left);
        const finalTop = parseFloat(element.style.top);
        onDragEnd(finalLeft, finalTop);
      }
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  });
}
