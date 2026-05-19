import { COLS, ROWS, CELL } from '../config/constants.js';

let pathCells = [];
let pathSet = new Set();
let obstacleSet = new Set();
let pathEndCell = [0, 0];
let pathPoints = [];
let pathSegmentLengths = [];
let pathTotalLength = 0;

export function getPathCells() {
  return pathCells;
}

export function getObstacleCells() {
  return [...obstacleSet].map((key) => key.split(',').map(Number));
}

export function getPathEndCell() {
  return pathEndCell;
}

export function cellCenter(col, row) {
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
}

export function setLevelPath(cells, obstacles = []) {
  pathCells = cells;
  pathSet = new Set(cells.map(([col, row]) => `${col},${row}`));
  obstacleSet = new Set(
    obstacles
      .filter(([col, row]) => !pathSet.has(`${col},${row}`))
      .map(([col, row]) => `${col},${row}`)
  );
  pathEndCell = cells[cells.length - 1];
  pathPoints = pathCells.map(([col, row]) => cellCenter(col, row));
  buildPathMetrics();
}

export function buildPathMetrics() {
  pathSegmentLengths = [];
  pathTotalLength = 0;
  for (let i = 0; i < pathPoints.length - 1; i += 1) {
    const a = pathPoints[i];
    const b = pathPoints[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    pathSegmentLengths.push(len);
    pathTotalLength += len;
  }
}

export function getPathTotalLength() {
  return pathTotalLength;
}

export function positionOnPath(progress) {
  const t = Math.max(0, Math.min(1, progress));
  let dist = t * pathTotalLength;
  for (let i = 0; i < pathSegmentLengths.length; i += 1) {
    const segLen = pathSegmentLengths[i];
    if (dist <= segLen) {
      const a = pathPoints[i];
      const b = pathPoints[i + 1];
      const ratio = segLen === 0 ? 0 : dist / segLen;
      return {
        x: a.x + (b.x - a.x) * ratio,
        y: a.y + (b.y - a.y) * ratio
      };
    }
    dist -= segLen;
  }
  return { ...pathPoints[pathPoints.length - 1] };
}

export function isPathCell(col, row) {
  return pathSet.has(`${col},${row}`);
}

export function isObstacleCell(col, row) {
  return obstacleSet.has(`${col},${row}`);
}

export function isGrassCell(col, row) {
  return col >= 0
    && col < COLS
    && row >= 0
    && row < ROWS
    && !isPathCell(col, row)
    && !isObstacleCell(col, row);
}

export function isAdjacentToPath(col, row) {
  const neighbors = [
    [col + 1, row],
    [col - 1, row],
    [col, row + 1],
    [col, row - 1]
  ];
  return neighbors.some(([nextCol, nextRow]) => isPathCell(nextCol, nextRow));
}
