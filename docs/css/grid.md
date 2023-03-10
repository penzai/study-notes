## Grid布局
显式单元格指手动明确设置的单元格，隐式单元格指其他没有明确设置的单元格。

### 容器属性
- `grid-template-columns`、`grid-template-rows`。repeat、auto-fill、fr、minmax、auto
- `gap`。先row后column的顺序。
- `grid-template-areas`。
- `grid-auto-flow`。dense。
- `place-items`。先align后justify的顺序。
- `place-content`。先align后justify的顺序。
- `grid-auto-columns`、`grid-auto-rows`。

### 项目属性
- `grid-area`。
- `grid-column-start`、`grid-column-end`、`grid-row-start`、`grid-row-end`。可使用`span`进行跨行设置。
- `place-self`。先align后justify的顺序

> 不想项目自动撑开时，可使用`min-height: 0`、`overflow: hidden`。