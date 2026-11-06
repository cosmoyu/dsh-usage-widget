# 用量卡片 / Usage card

DeepSeek Harness 侧栏底部的用量卡片。

![用量卡片](docs/preview.png)

## 功能

- 账户余额
- 本轮对话：输入、输出、缓存命中、花费；点击可切换到今日汇总
- 默认缩小显示「余额 + 本轮对话」，点标题栏的展开按钮（刷新按钮左侧）可展开高峰时间轴和最近 10 轮；展开 / 收起带缓动动画，选择会被记住
- 24 小时高峰 / 低谷时间轴
- 最近 10 轮输入 / 输出用量
- 跟随 DSH 语言切换，支持全部 8 种语言

## 安装

```bash
git clone https://github.com/cosmoyu/dshcost-skill.git dshcost-skill
```

在 DSH 中执行：

```text
plugin_manager install_bundle <dshcost-skill 的绝对路径>
```

安装后刷新页面。

插件依赖 `zod`（`typert.host.js` 严格清单使用）；如果 profile 安装时未自动安装依赖，可在插件目录执行 `pnpm install` 或 `npm install`。读取 `.zstd` 会话日志需要 Node 22.15+。

## 说明

- 用量来自本机会话日志，不会上传会话内容。
- 花费为估算值，实际扣费以 DeepSeek 账单为准。
- 高峰 / 低谷与节假日规则按插件内的北京时间日期表判断，官方调整后需要更新插件。

## 许可

[MIT](LICENSE)
