# 部署指南 🚀

## 快速部署到 Vercel

### 方法 1：通过 GitHub（推荐）

1. **创建 GitHub 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Serverless video downloader"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/video-download.git
   git push -u origin main
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
   - Vercel 会自动检测配置
   - 点击 "Deploy"

3. **完成！**
   - 部署完成后，你会获得一个 `.vercel.app` 域名
   - 可以在设置中添加自定义域名

### 方法 2：通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```
   
   首次部署时会询问：
   - Set up and deploy? → Yes
   - Which scope? → 选择你的账户
   - Link to existing project? → No
   - What's your project's name? → video-download
   - In which directory is your code located? → ./
   
4. **生产部署**
   ```bash
   vercel --prod
   ```

## 环境变量（可选）

如果需要添加环境变量（如 API 密钥、速率限制配置等）：

### 在 Vercel Dashboard 中：
1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加变量

### 在 CLI 中：
```bash
vercel env add VARIABLE_NAME
```

## 自定义域名

1. 在 Vercel Dashboard 中进入项目
2. 选择 "Settings" → "Domains"
3. 添加你的域名
4. 按照指示配置 DNS 记录

## 监控和日志

### 查看日志
```bash
vercel logs
```

### 实时日志
```bash
vercel logs --follow
```

### 在 Dashboard 中查看
- 访问 Vercel Dashboard
- 选择项目
- 查看 "Deployments" 和 "Functions" 标签

## 性能优化

### 1. 启用 Vercel Analytics（可选）
```bash
npm install @vercel/analytics
```

在 `src/main.tsx` 中添加：
```typescript
import { inject } from '@vercel/analytics';
inject();
```

### 2. 启用 Edge Caching
在 `vercel.json` 中添加：
```json
{
  "headers": [
    {
      "source": "/api/get_video_info",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=3600, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

## 故障排查

### Python 函数超时
- 确保 yt-dlp 操作在 8 秒内完成
- 检查网络连接
- 考虑增加超时时间（需要升级到 Pro 计划）

### CORS 错误
- 检查 `vercel.json` 中的 CORS 配置
- 确保前端使用相对路径 `/api/...`

### yt-dlp 错误
- 检查视频 URL 是否有效
- 确认平台是否支持
- 查看 Vercel 函数日志

## 成本监控

### 免费额度（Hobby 计划）
- 100GB 带宽/月
- 100GB-小时 函数执行时间/月
- 无限请求

### 监控使用情况
1. 访问 Vercel Dashboard
2. 查看 "Usage" 标签
3. 监控带宽和函数执行时间

## 更新部署

### 自动部署（GitHub）
- 推送到 main 分支会自动触发部署
- 推送到其他分支会创建预览部署

### 手动部署（CLI）
```bash
git add .
git commit -m "Update: ..."
vercel --prod
```

## 回滚

如果新部署有问题：

1. 在 Vercel Dashboard 中
2. 进入 "Deployments"
3. 找到之前的稳定版本
4. 点击 "Promote to Production"

或使用 CLI：
```bash
vercel rollback
```

## 安全建议

1. **速率限制**
   - 考虑使用 Upstash Redis 添加速率限制
   - 防止滥用免费额度

2. **输入验证**
   - 已在代码中实现 URL 验证
   - 考虑添加更严格的验证规则

3. **错误处理**
   - 不要在错误消息中暴露敏感信息
   - 记录详细错误到 Vercel 日志

## 备份

定期备份代码：
```bash
git push origin main
```

Vercel 会保留所有部署历史，可以随时回滚。

## 支持

- [Vercel 文档](https://vercel.com/docs)
- [yt-dlp 文档](https://github.com/yt-dlp/yt-dlp)
- [React 文档](https://react.dev)

---

**祝部署顺利！🎉**
