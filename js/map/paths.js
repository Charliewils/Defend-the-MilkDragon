function lineHorizontal(row, colStart, colEnd) {
  const cells = [];
  const step = colStart <= colEnd ? 1 : -1;
  for (let col = colStart; step > 0 ? col <= colEnd : col >= colEnd; col += step) {
    cells.push([col, row]);
  }
  return cells;
}

function lineVertical(col, rowStart, rowEnd) {
  const cells = [];
  const step = rowStart <= rowEnd ? 1 : -1;
  for (let row = rowStart; step > 0 ? row <= rowEnd : row >= rowEnd; row += step) {
    cells.push([col, row]);
  }
  return cells;
}

function appendSegment(path, segment) {
  for (const cell of segment) {
    const last = path[path.length - 1];
    if (last && last[0] === cell[0] && last[1] === cell[1]) continue;
    path.push(cell);
  }
  return path;
}

function rectCells(colStart, colEnd, rowStart, rowEnd) {
  const cells = [];
  for (let row = rowStart; row <= rowEnd; row += 1) {
    for (let col = colStart; col <= colEnd; col += 1) {
      cells.push([col, row]);
    }
  }
  return cells;
}

function buildStraightPath() {
  return lineHorizontal(7, 0, 19);
}

function buildLPath() {
  const path = [];
  appendSegment(path, lineVertical(2, 2, 11));
  appendSegment(path, lineHorizontal(11, 2, 18));
  return path;
}

function buildSPath() {
  const path = [];
  appendSegment(path, lineHorizontal(4, 0, 15));
  appendSegment(path, lineVertical(15, 4, 10));
  appendSegment(path, lineHorizontal(10, 15, 4));
  appendSegment(path, lineVertical(4, 10, 6));
  appendSegment(path, lineHorizontal(6, 4, 19));
  return path;
}

function buildZPath() {
  const path = [];
  appendSegment(path, lineHorizontal(3, 0, 16));
  appendSegment(path, lineVertical(16, 3, 8));
  appendSegment(path, lineHorizontal(8, 16, 3));
  appendSegment(path, lineVertical(3, 8, 12));
  appendSegment(path, lineHorizontal(12, 3, 19));
  return path;
}

function buildSpiralPath() {
  const path = [];
  appendSegment(path, lineHorizontal(1, 1, 18));
  appendSegment(path, lineVertical(18, 1, 13));
  appendSegment(path, lineHorizontal(13, 18, 1));
  appendSegment(path, lineVertical(1, 13, 3));
  appendSegment(path, lineHorizontal(3, 1, 16));
  appendSegment(path, lineVertical(16, 3, 11));
  appendSegment(path, lineHorizontal(11, 16, 3));
  appendSegment(path, lineVertical(3, 11, 9));
  appendSegment(path, lineHorizontal(9, 3, 14));
  appendSegment(path, lineVertical(14, 9, 7));
  appendSegment(path, lineHorizontal(7, 14, 8));
  appendSegment(path, lineVertical(8, 7, 10));
  appendSegment(path, lineHorizontal(10, 8, 12));
  return path;
}

function buildMazePath() {
  const path = [];
  appendSegment(path, lineHorizontal(2, 0, 4));
  appendSegment(path, lineVertical(4, 2, 12));
  appendSegment(path, lineHorizontal(12, 4, 1));
  appendSegment(path, lineVertical(1, 12, 4));
  appendSegment(path, lineHorizontal(4, 1, 10));
  appendSegment(path, lineVertical(10, 4, 8));
  appendSegment(path, lineHorizontal(8, 10, 6));
  appendSegment(path, lineVertical(6, 8, 11));
  appendSegment(path, lineHorizontal(11, 6, 14));
  appendSegment(path, lineVertical(14, 11, 5));
  appendSegment(path, lineHorizontal(5, 14, 17));
  appendSegment(path, lineVertical(17, 5, 10));
  appendSegment(path, lineHorizontal(10, 17, 12));
  appendSegment(path, lineVertical(12, 10, 13));
  appendSegment(path, lineHorizontal(13, 12, 19));
  return path;
}

function buildGrassEndlessPath() {
  const path = [];
  appendSegment(path, lineHorizontal(1, 0, 17));
  appendSegment(path, lineVertical(17, 1, 5));
  appendSegment(path, lineHorizontal(5, 17, 3));
  appendSegment(path, lineVertical(3, 5, 9));
  appendSegment(path, lineHorizontal(9, 3, 16));
  appendSegment(path, lineVertical(16, 9, 13));
  appendSegment(path, lineHorizontal(13, 16, 19));
  return path;
}

function buildSnowEndlessPath() {
  const path = [];
  appendSegment(path, lineHorizontal(0, 0, 18));
  appendSegment(path, lineVertical(18, 0, 2));
  appendSegment(path, lineHorizontal(2, 18, 1));
  appendSegment(path, lineVertical(1, 2, 5));
  appendSegment(path, lineHorizontal(5, 1, 17));
  appendSegment(path, lineVertical(17, 5, 7));
  appendSegment(path, lineHorizontal(7, 17, 2));
  appendSegment(path, lineVertical(2, 7, 10));
  appendSegment(path, lineHorizontal(10, 2, 16));
  appendSegment(path, lineVertical(16, 10, 12));
  appendSegment(path, lineHorizontal(12, 16, 19));
  return path;
}

const GRASS_ENDLESS_OBSTACLES = [
  ...rectCells(7, 9, 2, 4),
  ...rectCells(12, 14, 2, 4),
  ...rectCells(5, 7, 6, 8),
  ...rectCells(10, 12, 6, 8),
  ...rectCells(1, 2, 10, 12),
  ...rectCells(14, 16, 10, 12),
  ...rectCells(6, 8, 11, 13),
  ...rectCells(0, 1, 4, 6),
  ...rectCells(17, 19, 4, 6)
];

const SNOW_ENDLESS_OBSTACLES = [
  ...rectCells(4, 6, 1, 3),
  ...rectCells(10, 12, 1, 3),
  ...rectCells(15, 17, 1, 3),
  ...rectCells(4, 6, 4, 6),
  ...rectCells(11, 13, 4, 6),
  ...rectCells(6, 8, 8, 10),
  ...rectCells(13, 15, 8, 10),
  ...rectCells(3, 5, 11, 13),
  ...rectCells(9, 11, 11, 13),
  ...rectCells(15, 17, 11, 13),
  ...rectCells(0, 2, 6, 8),
  ...rectCells(17, 19, 6, 8)
];

export const LEVEL_PATH_BUILDERS = {
  1: buildStraightPath,
  2: buildLPath,
  3: buildSPath,
  4: buildZPath,
  5: buildSpiralPath,
  6: buildMazePath
};

export const LEVEL_COUNT = 6;

export function getPathCellsForLevel(levelId) {
  const builder = LEVEL_PATH_BUILDERS[levelId] || LEVEL_PATH_BUILDERS[1];
  return builder();
}

export const ENDLESS_MAPS = {
  grass: {
    id: 'grass',
    label: '草地战场',
    theme: 'forest',
    pathType: 'grassSerpent'
  },
  snow: {
    id: 'snow',
    label: '极寒冻原',
    theme: 'snow',
    pathType: 'snowSerpent'
  }
};

export function getEndlessMapLayout(mapId) {
  const map = ENDLESS_MAPS[mapId] || ENDLESS_MAPS.grass;
  const layout = map.pathType === 'snowSerpent'
    ? { path: buildSnowEndlessPath(), obstacles: SNOW_ENDLESS_OBSTACLES }
    : { path: buildGrassEndlessPath(), obstacles: GRASS_ENDLESS_OBSTACLES };
  const pathSet = new Set(layout.path.map(([col, row]) => `${col},${row}`));
  return {
    path: layout.path,
    obstacles: layout.obstacles.filter(([col, row]) => !pathSet.has(`${col},${row}`))
  };
}

export function getPathCellsForEndlessMap(mapId) {
  return getEndlessMapLayout(mapId).path;
}

export function getObstaclesForEndlessMap(mapId) {
  return getEndlessMapLayout(mapId).obstacles;
}
