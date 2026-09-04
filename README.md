# 工单管理平台

## 虚拟面试要求

本次面试必须在同一个 Fork、同一个分支中完成，并连续录制一段 30–60 分钟的视频。

视频必须始终包含完整桌面、候选人的摄像头画面、清晰的声音和持续可见的系统时间。所有作答过程都必须出现在视频中。视频不得剪辑、暂停或倍速处理，也不得使用视频之外的设备完成部分工作。

录像开始时，请展示系统时间、Fork URL、当前 Git 分支、起始完整 commit ID 和干净的 `git status`。

所有代码必须由候选人在 GUI IDE（如 VS Code 或 WebStorm）中亲自编写，题目要求的页面操作必须由候选人在浏览器中亲自完成。第二、三题必须在修改代码前使用浏览器或 IDE 的 GUI Debugger。可以同时查看 Network、Console 和 React Developer Tools，但不能用它们代替断点调试。

## AI 使用与个人责任

本次面试允许使用 AI 对话工具、IDE 插件或 CLI Agent，但所有 AI 交互都必须出现在录像中。

AI 只能分析问题和提供建议，不得直接修改项目文件，也不得代替候选人编写代码、操作 Debugger、操作页面或执行 Git 命令。使用 Agent 时，候选人必须明确要求它保持只读。

采用 AI 建议前，候选人必须先完整阅读回复，再用自己的话说明建议要解决什么问题、为什么适用于当前代码，以及可能的风险或其它选择。不能解释的内容不视为候选人已经掌握。

之后必须最小化 AI 窗口，回到 IDE 亲自完成修改并解释关键代码。逐行朗读或直接照搬 AI 输出不算个人能力。

可以使用 IDE 的普通代码补全、格式化、重命名和重构功能；不得使用生成式多行补全、Apply、Insert 或 Patch 把 AI 代码写入工程。

## 准备与运行

请在录像前完成 Fork、Clone、依赖下载和 IDE 配置。推荐 Node.js 22.12 或更高版本、npm、Git、支持 JavaScript/TypeScript GUI Debugger 的 IDE 和现代浏览器。

```shell
npm ci --no-audit --no-fund
npm run check
npm run dev
```

- 页面 `http://127.0.0.1:5173`
- API `http://127.0.0.1:3001/api`
- API 状态 `http://127.0.0.1:3001/api/health`

`npm run check` 会依次运行 ESLint、TypeScript 类型检查和 Vite 生产构建。

服务端数据保存在内存中，重启服务端会恢复初始数据。本题不需要数据库、Docker 或外部服务。

## 初始数据

工单状态只有 `open`、`in_progress` 和 `resolved`，优先级只有 `high`、`medium` 和 `low`。

| Ticket | Priority | Status | Assignee |
|---|---|---|---|
| `TCK-101` | high | open | Maya Chen |
| `TCK-102` | medium | in_progress | Owen Brooks |
| `TCK-103` | high | resolved | Priya Shah |
| `TCK-104` | low | resolved | Unassigned |

初始页面可以读取工单、按优先级筛选、查看详情和修改状态。

## 面试题目（共四题）

请按顺序完成以下四题。每题必须形成一个独立 commit，并在 Push 后再开始下一题。不得提前处理后续题目，也不得完成全部代码后再拆分 commits。

### 每题完成后

1. 打开完整的 staged diff，确认没有无关文件、生成文件或后续题目的修改
2. 最小化 AI，在 IDE 中指出关键代码并说明修改内容和原因
3. 使用英文 Conventional Commit 提交并 Push

```text
<type>[optional scope]: <description>
```

候选人需要说明 commit message 的含义，以及为什么选择该 type，例如为什么使用 `feat` 或 `fix`。

### 一、增加未解决工单筛选

在 Priority 筛选旁增加一个名为 `Unresolved only` 的复选框。

要求：

- `open` 和 `in_progress` 是未解决状态，`resolved` 不是
- 复选框和现有 Priority 筛选同时生效
- 页面已在筛选控件下方、工单列表上方提供 `Showing X of Y tickets`，将 X 替换为当前显示数量，将 Y 替换为工单总数
- 没有符合条件的工单时显示 `No tickets match the current filters.`
- 复选框可以使用键盘操作
- 窄屏下所有筛选控件都必须完整显示并可以操作

完成代码后，请在浏览器中依次展示：

- 正常宽度下切换两个筛选条件时，工单列表和数量随之变化
- 一个没有符合条件工单的筛选组合及对应提示
- 约 375px 宽度下完整可用的筛选控件和工单列表
- 只使用键盘操作 Priority 和 `Unresolved only`，并显示当前焦点

最后口头回答一个扩展问题，不需要继续修改代码：假设线上系统中工单数量增长到几十万甚至更多，当前实现可能会有什么问题？你会如何优化？

完成后按之前的要求 commit 并 Push。

### 二、修复筛选后修改错工单的问题

完成第一题后，重启服务端恢复初始数据，然后：

1. 把 Priority 设置为 `High`
2. 把 `TCK-103` 从 `Resolved` 改为 `Open`
3. 查看 `TCK-102` 的状态

正确表现是 `TCK-103` 变为 `Open`，`TCK-102` 仍为 `In progress`。当前代码会修改错误的工单。

修改代码前，请先猜想几种可能原因。然后使用 GUI Debugger 复现问题，并在断点处展示：

- 点击的工单 ID 和选择的新状态
- 完整工单列表和筛选后的列表
- 状态修改函数收到的参数
- 实际发送给 API 的工单 ID
- 相关变量和调用栈

根据断点中看到的内容，说明哪些猜测正确、哪些可以排除，然后修复问题。修改完成后，重启服务端并重复上面的三步，展示 `TCK-103` 和 `TCK-102` 的状态。再切换几次 Priority，展示每次修改的都是所点击的工单。

最后口头回答一个扩展问题，不需要继续修改代码：如果当前页面需要支持浅色和深色主题，你会如何改造现有 CSS 并实现主题切换？在生产环境中还需要考虑哪些问题？

完成后按之前的要求 commit 并 Push。

### 三、修复快速切换后显示错误详情的问题

完成第二题后，重启应用，然后：

1. 点击 `TCK-101` 的 `View details`
2. 立即点击 `TCK-102` 的 `View details`
3. 等待两个请求结束

最后点击的是 `TCK-102`，详情区域却会显示 `TCK-101`。

修改代码前，请先预测两个请求的执行顺序，并猜想几种可能原因。然后使用 GUI Debugger 复现问题，并在断点处展示：

- 两次点击对应的工单 ID
- 两个响应返回的先后顺序
- 每个响应中的工单 ID
- 响应返回时最后选择的工单 ID
- 页面即将保存的详情数据和调用栈

根据断点中看到的内容说明原因，然后修复问题。修改完成后，请在浏览器中依次展示：

- 按照上面的顺序操作后，最终显示 `TCK-102`
- 快速点击其它工单后，最终显示最后点击的工单
- 单独打开一个工单时正常显示详情

最后说明你的修改方法、较早请求失败时为什么不会影响当前工单，以及继续快速点击其它工单时为什么仍然正确。然后口头解释 JavaScript 中 async/await 的执行原理、它是否涉及多线程、JavaScript 有哪些多线程实现方式，以及这些方式与 async/await 的异同。

运行 `npm run check`，然后按之前的要求 commit 并 Push。

### 四、实现添加备注

工单详情的 `Internal notes` 列表下方已经显示 `To be implemented` 和一个不可用的 `Add note` 按钮。完成这个区域的内部备注功能。

项目已经提供完整的 `createTicketNoteHandler`，但还没有把它注册到 `/api/tickets/{ticketId}/notes`。请选择合适的 HTTP method，在 `server/app.ts` 中注册这个 handler，并在前端请求中使用相同的 method。不要修改 handler 或 `ticketStore.ts` 中的实现。请求体使用 JSON：

```json
{
  "body": "Checked the issue in the latest build."
}
```

前端要求：

- 使用你认为适合填写备注内容的输入控件替换 `To be implemented`
- 控件必须有清楚的文字提示，并且在窄屏下仍能完整显示和正常输入
- 将现有 `Add note` 按钮接入提交功能，输入为空或正在提交时按钮不可用
- 成功后显示新备注并清空输入内容
- 失败时保留输入内容、显示错误，并允许再次提交
- 快速重复点击不能添加重复备注

完成代码后，请在浏览器和 Network 面板中依次展示：

- 提交发送期间禁用 `Add note` 按钮
- 提交成功的请求和页面中新出现的备注
- 提交失败的请求、保留的输入内容和页面上的错误信息
- 失败后可以再次提交
- 重新打开工单后，刚才添加的备注仍然存在

最后，请说明你在注册 `createTicketNoteHandler` 时选择了哪种 HTTP method 及其理由，并比较 GET、POST、PUT、PATCH 和 DELETE 等常见 method 的用途和幂等性，解释为什么其它 method 不适合这里。再说明 handler 为什么会返回 201、400 和 404，它们分别表示什么，并举例说明其它常见响应状态码的用途。

运行 `npm run check`，然后按之前的要求 commit 并 Push。

## 总结与提交

视频结束前，请在 GitHub 中依次打开四个 commits，用 1–3 分钟说明：

- 每个 commit 完成了什么
- 两个问题是如何复现并找到原因的
- 关键页面状态、断点信息和 Network 请求
- AI 提供了什么建议，你采用或拒绝这些建议的原因

需要提交：

- 可直接访问的 Fork URL
- 一段完整视频
- 可选的视频关键时间戳

不要提交源码压缩包、Patch 或上游 Pull Request。不要在仓库中加入密码、令牌、私钥、个人联系方式、AI 对话记录或其它无关内容。
