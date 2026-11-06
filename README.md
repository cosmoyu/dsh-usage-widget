# 用量卡片 / Usage card

DeepSeek Harness（DSH）侧栏头像上方的常驻用量卡片。显示账户余额、本轮对话的输入/输出/缓存/花费、24 小时高峰低谷时间轴，以及最近 10 轮对话用量。

![用量卡片](docs/preview.png)

## 功能

- **账户余额**：读取 DSH 已登录的钱包余额，显示 CNY 或 USD。
- **本轮对话**：同一行显示输入、输出、缓存命中、花费；点击卡片翻转查看今日汇总。
- **24 小时高峰低谷**：蓝色低谷、橙色高峰，箭头每秒自动跟随当前时间移动，无需手动刷新。
- **最近 10 轮**：每轮独立显示输入/输出柱状图。
- **3D 效果**：卡片支持悬停倾斜、动态阴影和跟随光标的光斑；翻转后同样生效。
- **多语言**：跟随 DSH 当前语言实时切换，覆盖 DSH 支持的全部 8 种语言。
- **数值自适应**：数字过长时自动缩小字号；K/M/%/货币符号以更小、更浅的样式显示。

## 环境要求

- DSH Desktop，且当前 profile 启用插件管理能力。
- DSH 自带的 Node 运行时即可；读取 `.zstd` 会话日志需要 Node 22.15+。

## 安装

### 方式一：从本地目录安装（推荐）

```bash
git clone https://github.com/cosmoyu/dscost-skill.git dsh-avatar-cost
```

在 DSH 中让 Agent 执行：

```text
plugin_manager install_bundle <dsh-avatar-cost 的绝对路径>
```

例如：

```text
plugin_manager install_bundle C:\Users\you\plugins\dsh-avatar-cost
```

安装完成后刷新 DSH 页面。卡片会出现在左下角头像上方；DSH 原始头像和账户菜单不会被替换。

### 方式二：手动准备依赖后安装

插件依赖 `zod`。如果 profile 安装时没有自动安装依赖，可在插件目录执行：

```bash
cd dsh-avatar-cost
npm install
```

然后重新执行 `plugin_manager install_bundle <绝对路径>`。

安装是按 DSH profile 生效的，切换 profile 后需要重新安装。

## 使用

- 卡片只在侧栏展开（宽栏）时显示。
- 点击「本轮对话」卡片：正面为本轮数据，背面为今日汇总。
- 右上角刷新按钮会重新读取余额和会话用量。
- 余额下方单位为钱包币种：CNY 显示 `¥`，USD 显示 `$`。

## 多语言

跟随 DSH 的当前语言实时切换：

- 简体中文
- English
- Deutsch
- Español
- Français
- 日本語
- Português
- Русский

切换 DSH 语言后卡片会立即重绘，不需要刷新页面。

## 数据与计费口径

- 用量来自 `$DSH_HOME/sessions/**/session.*.jsonl(.zstd)` 中已提交的 `assistant/message` 与 `compaction/summary` 用量块；插件不维护第二份账本。
- 「本轮对话」取最近活跃会话的最新 `turn`；「今日汇总」跨所有会话，按宿主机本地日期分日。
- 输入为缓存未命中的输入 Token；输出为输出 Token；两者都不含缓存读取/写入。
- 缓存命中率 = 缓存读取 /（输入 + 缓存读取 + 缓存写入）。
- 「最近 10 轮」取最近活跃会话的最后 10 个 `turn`。
- 费用按 DeepSeek 官方 Flash / Pro 峰谷价估算：UTC 01:00–04:00、06:00–10:00 为峰时（双倍）；北京时间的周末与 2026 年公众假期按谷价。
- 24 小时时间轴按宿主机本地时间绘制。
- 余额和花费跟随钱包币种：USD 按 1:1 显示；CNY 默认按 7.2 换算。
- 环境变量 `DSH_AVATAR_COST_FX` 可覆盖 CNY 的美元兑人民币汇率。

> 花费为估算值，不等同于官方账单；实际扣费以 DeepSeek 账单为准。若模型不属于 DeepSeek 官方渠道，Token 仍计入用量，但费用显示为 0，并提示「部分模型未定价」。

## 隐私

所有统计都在本地完成。插件读取本机会话日志以汇总 Token 和费用，不会上传会话内容；余额通过 DSH 账户服务或官方余额接口读取。

## 项目结构

```text
dsh-avatar-cost/
├─ client.js          # DSH Client 半：侧栏卡片 UI
├─ index.js           # DSH Host 半：会话扫描、余额、费用估算
├─ typert.host.js     # Host/Client 远程契约
├─ cordis.patch.yml   # Bundle 安装入口
├─ locale/            # 8 种语言的插件元数据
├─ docs/preview.png   # 预览图
└─ icon.svg           # 插件图标
```

## 开发

无需构建步骤，DSH 直接加载源码。修改后：

1. 在 DSH 中关闭再启用插件，或重新执行 `plugin_manager set_plugin`。
2. 刷新页面。
3. 检查 `sidebar.footer.action` 中 `avatar-cost-card` 是否处于 active 状态。

## 许可

[MIT](LICENSE)
