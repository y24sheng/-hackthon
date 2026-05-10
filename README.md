# Moments · 之间

<div align="center">
  <img width="1200" height="475" alt="Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<p align="center">
  <a href="https://ai.studio/apps/31b55afb-45c5-418b-8ac6-311d156a492e">🌐 在线预览</a>
</p>

---

## ✨ 项目简介

> 让爱被看见，让焦虑被分解。

**Moments · 之间** 是一个专为东亚母女设计的轻量沟通工具。

我们存放说不出口的爱，翻译听不懂的焦虑，沉淀忘不掉的回忆。

东亚母女之间的爱往往藏在唠叨里、锁在沉默里。妈妈的表达裹着焦虑，女儿的回应带着疲惫。这款工具用 AI 搭建一座温柔的桥 —— 让关心被准确接收，让爱不再迷路。

---

## 🎯 核心功能

### 🤖 AI 去焦虑化沟通
妈妈发来的消息往往夹杂着担心、焦虑和控制欲。AI 会智能识别其中的「焦虑词汇」（如"又"、"万一"、"怎么办"），并生成一份**温和版本** —— 保留关心，去掉压力，让女儿真正听进去。

### 💬 女儿消息转译
女儿想对妈妈说的话，往往因为怕"太生硬"而咽回去。AI 支持两种转译风格：
- **温柔版**：将生硬的话变得柔软、充满关心
- **海绵宝宝版**：用幽默风趣的方式表达，化解尴尬

### 📝 温情摘要
妈妈一天发了好多条消息？AI 自动提炼核心诉求，用 3 条简洁要点呈现，帮女儿快速理解妈妈的真实需要。

### 💌 低能耗反馈
女儿不想长篇大论回应？一键发送三种轻量反馈：
- **已读** —— 让妈妈知道"我看到了"
- **拥抱** —— 传递温暖，无需言语
- **思考中** —— 告诉妈妈"我在消化你的话"

### 🌈 多维度记录
| 类型 | 说明 |
|------|------|
| `心情` | 记录当下情绪，让彼此更了解 |
| `暂存` | 妈妈专属空间，存放那些"想说又怕打扰"的话 |
| `挑战` | 家庭互动小任务，用游戏化的方式拉近彼此 |

### 👩‍👧 双角色视角
- **妈妈视角**：发送关心、查看反馈、发起挑战
- **女儿视角**：接收温和版消息、轻量反馈、回顾温情摘要

---

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | React 19 + TypeScript |
| **构建工具** | Vite 6 |
| **样式方案** | Tailwind CSS 4 |
| **后端服务** | Express.js |
| **数据库 / 认证** | Firebase（Firestore + Authentication） |
| **AI 能力** | Google Gemini API（`@google/genai`） |
| **动画** | Motion（Framer Motion） |
| **图标** | Lucide React |

---

## 🚀 本地运行

**环境要求：** Node.js 已安装

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
#    复制 .env.example 为 .env.local，填入你的 Gemini API Key
cp .env.example .env.local
#    编辑 .env.local，设置 GEMINI_API_KEY

# 3. 启动开发服务器
npm run dev
#    访问 http://localhost:3000
```

### 环境变量说明

| 变量名 | 说明 |
|--------|------|
| `GEMINI_API_KEY` | Google Gemini API 密钥（**必填**） |
| `APP_URL` | 应用部署地址（可选） |

> 💡 获取 Gemini API Key：访问 [Google AI Studio](https://aistudio.google.com/apikey)

---

## 📁 项目结构

```
-hackthon/
├── index.html                    # 入口 HTML
├── package.json                 # 依赖配置
├── vite.config.ts               # Vite 构建配置
├── tsconfig.json                # TypeScript 配置
├── .env.example                 # 环境变量示例
├── firebase-applet-config.json  # Firebase 配置
├── firebase-blueprint.json      # Firebase 蓝图
├── firestore.rules              # Firestore 安全规则
└── src/
    ├── main.tsx                 # 应用入口
    ├── App.tsx                  # 主应用（路由 & 认证）
    ├── types.ts                 # TypeScript 类型定义
    ├── index.css                # 全局样式
    ├── components/              # React 组件
    │   ├── Landing.tsx          # 着陆页
    │   ├── Onboarding.tsx       # 用户引导
    │   ├── Dashboard.tsx        # 仪表板路由
    │   ├── MotherDashboard.tsx  # 妈妈视角
    │   ├── DaughterDashboard.tsx# 女儿视角
    │   ├── RecordInput.tsx      # 记录输入
    │   ├── RecordCard.tsx       # 记录卡片
    │   ├── Timeline.tsx         # 时间线
    │   └── ChallengeSection.tsx # 挑战模块
    ├── lib/
    │   ├── firebase.ts          # Firebase 初始化
    │   └── utils.ts             # 工具函数
    └── services/
        └── gemini.ts            # Gemini AI 服务（核心 AI 功能）
```

---

## 🔑 Firebase 配置

本项目使用 Firebase 作为后端服务，配置已在 `firebase-applet-config.json` 中提供。

如需部署到自己的 Firebase 项目：

```bash
# 安装 Firebase CLI
npm install -g firebase-tools

# 登录 Firebase
firebase login

# 初始化项目（如未初始化）
firebase init

# 部署 Firestore 规则
firebase deploy --only firestore:rules
```

---

## 📦 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（端口 3000） |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产版本 |
| `npm run clean` | 清理构建产物 |
| `npm run lint` | TypeScript 类型检查 |

---

## 💡 设计理念

> 东亚母女的沟通困境，往往不是"不爱"，而是"不会爱"。

- **去焦虑，不是去关心** —— AI 剥离的是表达方式中的压力，保留的是背后的爱
- **低能耗，不是冷漠** —— 一键反馈让女儿在疲惫时也能维持连接
- **双向理解** —— 既帮助女儿"听懂"妈妈，也帮助妈妈"看见"女儿

---

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支（`git checkout -b feature/AmazingFeature`）
3. 提交你的更改（`git commit -m 'Add some AmazingFeature'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 打开一个 Pull Request

---

## 📄 License

本项目采用 Apache 2.0 许可证 —— 详见代码头部声明。

---

<p align="center">
  Made with 💚 for every mother and daughter who struggle to say "I love you".
</p>
