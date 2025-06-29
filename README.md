# 🥊 吵架包赢

一个有趣的网站应用，让你在任何争论中都能占据上风！使用 AI 生成完美的反驳回复。

## ✨ 功能特性

- 🎯 **智能反驳**：基于 DeepSeek V3 模型生成有力的反驳回复
- 📱 **响应式设计**：完美适配手机和电脑端
- 🎚️ **语气调节**：可调节回复的强烈程度（1-10级）
- 💾 **历史记录**：本地存储最近的吵架记录
- 🎨 **微信配色**：采用微信风格的UI设计
- 📋 **一键复制**：方便复制回复内容

## 🚀 技术栈

- **前端框架**：Next.js 14 (App Router)
- **开发语言**：TypeScript
- **样式框架**：Tailwind CSS
- **AI 模型**：DeepSeek V3 (通过 OpenRouter API)
- **数据存储**：localStorage

## 🛠️ 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **访问应用**
   打开浏览器访问 `http://localhost:3000`

## 📱 使用方法

1. **输入对方的话**：在文本框中输入对方说的内容
2. **调节语气强度**：使用滑块选择回复的强烈程度（1-10）
3. **开始吵架**：点击按钮生成3个不同角度的反驳回复
4. **复制使用**：点击复制按钮将回复复制到剪贴板

## 🎨 设计理念

- **微信风格**：采用微信的绿色主题和简洁设计
- **移动优先**：针对手机用户进行优化
- **用户友好**：简单直观的操作流程
- **娱乐为主**：轻松有趣的用户体验

## 🔧 配置说明

### API 配置
项目使用 OpenRouter 的 DeepSeek V3 模型，API 密钥配置在 `/src/app/api/fight/route.ts` 文件中。

### 语气强度说明
- **1-3级**：温和理性，用逻辑和事实反驳
- **4-6级**：稍微激烈，带有情绪和反讽
- **7-10级**：非常激烈，使用强烈语言但不包含脏话

## 📦 构建部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 🎯 注意事项

- 本应用仅供娱乐使用，请理性沟通
- 生成的回复不包含脏话和人身攻击
- 历史记录存储在本地浏览器中
- 需要网络连接以使用 AI 功能

## 📄 许可证

本项目仅供学习和娱乐用途。

---

**免责声明**：本应用生成的内容仅供娱乐，请在实际交流中保持理性和尊重。 