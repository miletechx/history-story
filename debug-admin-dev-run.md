# Debug Session: admin-dev-run

Status: [OPEN]

## Problem
Windows/PowerShell 环境中管理后台项目无法正常运行或访问。

## Hypotheses
1. 有残留 `next dev` 进程占用了 `.next/dev/lock`。
2. 端口 `3000` 被其他进程占用或服务启动后立刻退出。
3. `.next` 缓存锁文件残留，但实际没有服务在跑。
4. 当前启动脚本依赖 `bash`，Windows 下 `pnpm dev` 必然失败，需要改用 `next dev`。
5. 管理员环境变量未配置导致能运行但访问 `/admin` 跳登录，看起来像“运行不了”。

## Evidence Log
- Pending.
