# 视频下载工具 🎬

一个基于 Serverless 架构的免费视频下载网站，支持从 **X (Twitter)**、**抖音 (TikTok)** 和 **哔哩哔哩 (Bilibili)** 下载视频。

## ✨ 特性

- 🚀 **零成本部署** - 使用 Vercel 免费额度
- ⚡ **快速响应** - Serverless 函数，按需执行
- 🎯 **直接下载** - 获取视频真实 URL，客户端直接下载
- 🎨 **现代设计** - 精美的渐变 UI 和流畅动画
- 📱 **响应式布局** - 完美支持移动端和桌面端
- 🔒 **隐私保护** - 不存储任何视频文件

## 🛠️ 技术栈

### 后端
- **Python 3.9** - Vercel Serverless Functions
- **yt-dlp** - 视频信息提取

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Axios** - HTTP 客户端

## 📁 项目结构

```
video-download/
├── api/                          # Python Serverless Functions
│   └── get_video_info.py        # 视频信息提取 API
├── src/                          # React 前端源码
│   ├── components/              # React 组件
│   │   ├── DownloadForm.tsx    # 下载表单
│   │   └── VideoCard.tsx       # 视频信息卡片
│   ├── hooks/                   # 自定义 Hooks
│   │   └── useDownload.ts      # 下载逻辑
│   ├── api/                     # API 客户端
│   │   └── client.ts           # Axios 配置
│   ├── types/                   # TypeScript 类型
│   │   └── index.ts
│   ├── utils/                   # 工具函数
│   │   └── formatters.ts
│   ├── styles/                  # 样式文件
│   │   └── index.css
│   ├── App.tsx                  # 主应用组件
│   └── main.tsx                 # 应用入口
├── requirements.txt             # Python 依赖
├── package.json                 # Node.js 依赖
├── vercel.json                  # Vercel 配置
└── README.md
```

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 本地开发

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd video-download
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**
   
   打开浏览器访问 `http://localhost:5173`

### 部署到 Vercel

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```

   或者直接推送到 GitHub，然后在 Vercel 控制台导入项目。

## 📖 使用说明

1. **输入视频链接**
   
   在输入框中粘贴来自 X (Twitter)、抖音 (TikTok) 或 B站 (Bilibili) 的视频链接。

2. **获取视频信息**
   
   点击"获取视频"按钮，系统会自动解析视频信息。

3. **下载视频**
   
   - **单一文件**：直接点击"下载视频"按钮
   - **分离流**（B站部分视频）：分别下载视频流和音频流，然后使用 FFmpeg 或视频编辑器合并

## 🎯 API 说明

### POST `/api/get_video_info`

提取视频信息和下载链接。

**请求体：**
```json
{
  "url": "https://twitter.com/xxx/status/xxx"
}
```

**响应（单一文件）：**
```json
{
  "success": true,
  "platform": "twitter",
  "title": "视频标题",
  "thumbnail": "缩略图 URL",
  "duration": 120,
  "filesize": 15728640,
  "format": "mp4",
  "download_type": "single",
  "download_url": "直接下载链接",
  "width": 1920,
  "height": 1080
}
```

**响应（分离流 - B站）：**
```json
{
  "success": true,
  "platform": "bilibili",
  "title": "视频标题",
  "thumbnail": "缩略图 URL",
  "duration": 300,
  "filesize": 52428800,
  "format": "mp4",
  "download_type": "separate",
  "video_url": "视频流 URL",
  "audio_url": "音频流 URL",
  "width": 1920,
  "height": 1080,
  "note": "视频和音频是分离的流，需要使用 FFmpeg 合并"
}
```

## 🔧 配置说明

### Vercel 配置 (`vercel.json`)

- **运行时**：Python 3.9
- **内存**：1024 MB
- **超时时间**：10 秒（免费版限制）
- **CORS**：已启用跨域支持

### B站特殊处理

由于 Vercel 环境没有 FFmpeg，对于 B站视频：

1. 优先寻找包含音频的单一 mp4 格式
2. 如果不存在，返回分离的视频流和音频流 URL
3. 用户需要自行合并（使用 FFmpeg 或在线工具）

**合并命令示例：**
```bash
ffmpeg -i video.mp4 -i audio.m4a -c copy output.mp4
```

## 🌟 特性说明

### 支持的平台

| 平台 | 支持状态 | 说明 |
|------|---------|------|
| X (Twitter) | ✅ | 完全支持 |
| 抖音 (TikTok) | ✅ | 完全支持 |
| B站 (Bilibili) | ✅ | 支持，部分视频需要合并流 |

### 限制

- **文件大小**：无限制（直接返回源站链接）
- **执行时间**：10 秒（Vercel 免费版）
- **并发请求**：根据 Vercel 免费额度

## 🎨 设计特点

- **渐变背景**：紫色渐变营造现代感
- **玻璃态效果**：半透明背景 + 模糊效果
- **流畅动画**：淡入、滑动、缩放等过渡动画
- **响应式设计**：完美适配手机、平板、桌面
- **深色模式**：可扩展支持深色主题

## 📝 开发说明

### 添加新平台支持

1. 在 `api/get_video_info.py` 中添加平台检测逻辑
2. 实现对应的信息提取函数
3. 更新前端 `getPlatformName` 函数

### 自定义样式

所有样式变量定义在 `src/styles/index.css` 的 `:root` 中，可以轻松自定义：

- 颜色方案
- 间距大小
- 圆角半径
- 阴影效果
- 过渡动画

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## ⚠️ 免责声明

本工具仅供学习和个人使用。请遵守相关法律法规，尊重版权，仅下载您有权使用的内容。

## 🔗 相关链接

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - 视频下载核心库
- [Vercel](https://vercel.com) - 部署平台
- [React](https://react.dev) - 前端框架

---

**Made with ❤️ using Serverless Architecture**
