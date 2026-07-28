# 机器人中试平台数字沙盘｜3D 建模作品集

> AI 辅助 3D 建模、交互式沙盘、模型检视与打印交付的一体化项目。公开版仅隐藏公司名称与品牌 Logo，模型、场景、功能、项目数据和工作流程均保留。

[🚀 在线观赏与操作](https://sandtable-3d-starter.jihongwei1217.chatgpt.site) · [🍴 复制一份（Fork）](https://github.com/jihongwei1217-code/interactive-3d-sandtable-portfolio/fork) · [⬇ 下载全部源码](https://github.com/jihongwei1217-code/interactive-3d-sandtable-portfolio/archive/refs/heads/main.zip) · [📘 中文项目案例](CASE_STUDY_CN.md)

![Project overview](assets/project-overview.svg)

## 项目成果

- **41 项数字资产**：机器人、试验设备、场景和可组合模块；
- **14 套沙盘模板**：室内、室外、混合及专项场景；
- **80 个打印件**：连接网页检视与实体沙盘交付；
- **5 套核心场景**：AI训练中心、产品试制中心、整机性能测试区、产品发布中心、室外综合场；
- **10 类设备、12 个可独立打印小物件**：大温箱拆分为 07A / 07B / 07C 三段。

## 公开版保留了什么

- D12 人形机器人、Q20 四足机器人与多角度实拍参考；
- 盐雾设备、测功机、控制柜、冲击台、振动台、操作线架、步入式温箱和车辆模块；
- 点击添加、拖动、选中、删除、撤回；
- 室内、室外、混合场景模板；
- 3D / 2D 俯视切换；
- 本地保存与恢复；
- JSON 布局导入和导出；
- 从实拍、建模、网页检视、沙盘排布到打印交付的完整流程。

## 快速复制

### 方法 A：Fork

点击上方 **“复制一份（Fork）”**，GitHub 会在你的账号中生成完整副本。

### 方法 B：下载 ZIP

下载并解压源码后运行：

```bash
npm install
npm run dev
```

### 方法 C：Git 克隆

```bash
git clone https://github.com/jihongwei1217-code/interactive-3d-sandtable-portfolio.git
cd interactive-3d-sandtable-portfolio
npm install
npm run dev
```

## 代码入口

- `app/page.tsx`：项目内容、场景模块、模板数据和交互逻辑；
- `app/globals.css`：作品集视觉、3D 透视与响应式布局；
- `app/layout.tsx`：页面标题与说明；
- `public/project/`：公开作品图片。

## 我的角色

我在项目中承担产品负责人和 AI 辅助原型协调角色，主要负责：

- 将现场照片、使用需求和反馈转化为产品需求；
- 设计模型目录、场景规划、文件下载和交付导航；
- 定义拖拽、删除、撤回、视角恢复和历史方案等交互；
- 协调网页预览、可打印资产、装配文档和部署；
- 持续审核模型质量、场景效果、物理结构和使用体验；
- 使用 AI 加速原型、界面、文档与交付迭代。

## 公开边界

本公开版只做以下匿名化：

- 公司名称替换为“某机器人科技公司”或中性项目名称；
- 公司 Logo 与品牌标识不展示；
- 账号、密钥及非公开个人信息不上传。

粗略模型、设备名称、项目结构、场景体系、交互功能、实拍参考和交付方法均可公开。代码使用 [MIT License](LICENSE)。

---

如果你是黑客松评审：建议先打开 **在线观赏与操作**，实际添加设备并切换 2D / 3D 视角，再查看源码和项目案例。
