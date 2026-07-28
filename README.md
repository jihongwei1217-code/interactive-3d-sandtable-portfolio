# 具身智能｜建模 2.0

这是“具身智能”建模 2.0 的完整公开交互版，不是截图或简化介绍页。

[在线观赏与操作](https://sandtable-3d-starter.jihongwei1217.chatgpt.site)

## 完整保留

- 最新首页动态 UI 与三维舞台；
- D12 人形机器人、Q20 四足机器人及实拍参考；
- 单件检视、实体/线框/透视、旋转、缩放与复位；
- 41 项独立模型与设备资产；
- V3 三维沙盘排布、5 套展示总图、9 套场景与 DIY 历史；
- 室内、室外、综合场景及 2:1 总沙盘；
- 原有尺寸、比例、精度、设备名称、页面内容和交互流程；
- 打印与文件页面及其按钮外观。

## 公开版仅有三项变化

1. 不展示原 Logo；
2. 原品牌/公司名称统一显示为“具身智能”；
3. 下载按钮保留用于展示，但不会真正下载 ZIP、STL、STP、STEP 或 3MF 文件。

除此之外，机器人名称、尺寸、精度和原交互页面均按最新版本保留。

## 本地运行

```bash
npm install
npm run dev
```

然后打开 `http://localhost:3000`。

## 代码结构

- `public/home.html`：完整首页；
- `public/models.html`：独立模型库；
- `public/viewer.html`：单件检视；
- `public/item.html`：模型详情；
- `public/planner.html`：V3 三维沙盘工作台；
- `public/studio.html`、`public/outfield.html`：室内外场景页面；
- `public/downloads.html`：文件展示页；
- `public/sanitize.js`：仅处理品牌、Logo 与下载限制；
- `app/[...path]/route.ts`：为页面所需的公开样式、脚本、图片与三维预览资源提供同源访问。

## 说明

公开仓库保留可浏览、可交互、可复制学习的网页实现。三维预览资源按页面需要从在线公开展示版加载；可下载工程文件不包含在仓库中，也不会由公开页面提供。

代码使用 [MIT License](LICENSE)。