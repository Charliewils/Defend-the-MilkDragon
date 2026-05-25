# 保卫奶龙 (Defend the MilkDragon)

一款基于 HTML5 Canvas 的塔防游戏，支持战役模式和无尽模式，内置 AI 自适应难度系统。

## 游戏特色

- **多种防御塔** — 普通塔、冰冻塔、火焰塔、黄油塔、散射塔、熔岩塔、泰坦塔等，各具独特能力
- **丰富的敌人类型** — 普通敌人、冲锋敌人、隐身敌人、护甲敌人、分裂虫、小队敌人、Boss 等
- **双模式** — 战役关卡模式 + 无尽挑战模式
- **AI 自适应难度** — 基于 brain.js 的神经网络，根据玩家表现动态调整游戏难度
- **道具系统** — 可装备道具辅助战斗
- **宝石商店** — 使用游戏内货币解锁外观和道具
- **萝卜皮肤** — 自定义防守单位外观
- **桌面客户端** — 基于 Electron 打包，支持 Windows 桌面运行

## 快速开始

### 浏览器运行

直接用本地服务器打开 `index.html` 即可：

```bash
python3 serve.py
```

### Electron 桌面版

```bash
npm install
npm start
```

### 打包 Windows 可执行文件

```bash
npm run dist
```

## 项目结构

```
├── index.html          # 游戏入口
├── css/                # 样式
├── js/
│   ├── main.js         # 主入口
│   ├── game.js         # 游戏核心逻辑
│   ├── ai/             # AI 难度系统
│   ├── entities/       # 游戏实体（防御塔、敌人、子弹等）
│   ├── map/            # 地图与路径
│   ├── wave/           # 波次生成
│   ├── items/          # 道具系统
│   ├── cosmetics/      # 外观装饰
│   ├── storage/        # 存档与进度
│   ├── audio/          # 音频管理
│   ├── render/         # 渲染（矢量图形）
│   └── ui/             # UI 组件
├── assets/             # 静态资源
├── electron-main.js    # Electron 主进程
└── package.json        # 项目配置
```

## 制作者

黄铭远、陈家瑞

## 许可证

[MIT](LICENSE)
