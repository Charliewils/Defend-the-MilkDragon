/** 配置版本：商店 UI 可用来确认是否加载到最新脚本 */
export const COSMETICS_BUILD = '20260517-nailong';

export const COSMETIC_CATEGORIES = {
  towerSkin: 'towerSkin',
  radishStyle: 'radishStyle'
};

export const COSMETIC_ITEMS = [
  {
    id: 'tower_skin_gold',
    category: COSMETIC_CATEGORIES.towerSkin,
    name: '金色炮台',
    description: '暖金色金属质感，全场炮台统一换装。',
    price: 20,
    preview: '#f1c40f'
  },
  {
    id: 'tower_skin_dark',
    category: COSMETIC_CATEGORIES.towerSkin,
    name: '暗黑炮台',
    description: '深色系涂装，压低饱和度并强化轮廓。',
    price: 20,
    preview: '#2c3e50'
  },
  {
    id: 'tower_skin_pixel',
    category: COSMETIC_CATEGORIES.towerSkin,
    name: '像素风炮台',
    description: '高对比色块与硬朗描边，复古像素观感。',
    price: 20,
    preview: '#4cd137'
  },
  {
    id: 'radish_nailong',
    category: COSMETIC_CATEGORIES.radishStyle,
    name: '奶龙萝卜',
    description: '圆滚滚的黄色小龙，奶萌守护终点。',
    price: 1,
    preview: '#ffe566',
    previewStyle: 'radish_nailong'
  },
  {
    id: 'radish_pumpkin',
    category: COSMETIC_CATEGORIES.radishStyle,
    name: '南瓜萝卜',
    description: '圆滚滚南瓜造型，保留可爱表情。',
    price: 15,
    preview: '#e67e22'
  },
  {
    id: 'radish_eggplant',
    category: COSMETIC_CATEGORIES.radishStyle,
    name: '茄子萝卜',
    description: '修长紫茄子轮廓，顶部小叶点缀。',
    price: 15,
    preview: '#8e44ad'
  },
  {
    id: 'radish_corn',
    category: COSMETIC_CATEGORIES.radishStyle,
    name: '玉米萝卜',
    description: '金黄粒状纹理，像一根会卖萌的玉米。',
    price: 15,
    preview: '#f1c40f'
  }
];

export const DEFAULT_COSMETICS = {
  towerSkin: 'default',
  radishStyle: 'default'
};

export function getCosmeticById(id) {
  return COSMETIC_ITEMS.find((item) => item.id === id) || null;
}

export function getCosmeticsByCategory(category) {
  return COSMETIC_ITEMS.filter((item) => item.category === category);
}
