export const MAP_THEMES = {
  grass: {
    grass: '#4a7c3f',
    grassDark: '#3d6a34',
    path: '#c4a574',
    pathDark: '#b8956a'
  },
  forest: {
    grass: '#2f6b3f',
    grassDark: '#245532',
    path: '#d8b98a',
    pathDark: '#b8895c',
    pathEdge: '#8b5e34',
    obstacle: '#4e342e',
    obstacleDark: '#3e2723'
  },
  snow: {
    grass: '#e8f4fa',
    grassDark: '#d0e8f2',
    path: '#8fa9c8',
    pathDark: '#6f8fb0',
    pathEdge: '#4f6d8f',
    obstacle: '#6d7f92',
    obstacleDark: '#4f5f70'
  }
};

export const ENDLESS_MAP_MODIFIERS = {
  grass: {
    theme: 'forest',
    freezeDamageBonus: 0
  },
  snow: {
    theme: 'snow',
    freezeDamageBonus: 0.2
  }
};

export function getMapTheme(themeId) {
  return MAP_THEMES[themeId] || MAP_THEMES.grass;
}

export function getEndlessMapModifier(mapId) {
  return ENDLESS_MAP_MODIFIERS[mapId] || ENDLESS_MAP_MODIFIERS.grass;
}
