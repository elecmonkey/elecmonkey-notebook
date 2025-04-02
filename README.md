# EM Notebook

A modern notebook built with VitePress.

## 技术栈

- **VitePress** - 基于 Vite 的静态网站生成器

## 开发流程

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建静态网站
pnpm build

# 预览构建结果
pnpm preview
```

## 目录结构

```
/
├── docs/                 # 文档内容
│   └── index.md          # 首页
├── .vitepress/           # VitePress 配置
│   ├── config.mts        # 主配置文件
│   ├── theme/            # 自定义主题
│   └── dist/             # 构建输出
├── public/               # 静态资源
└── .github/              # GitHub 配置
    └── workflows/        # GitHub Actions
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/addSomething`)
3. 提交更改 (`git commit -m 'Add something'`)
4. 推送到分支 (`git push origin feature/addSomething`)
5. 提交 Pull Request

## 许可证

- CC BY-NC-SA 4.0 License - [LICENSE](LICENSE) 