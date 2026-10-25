# v0.3.11-beta.7 — Dynamic community contact / 自动更新交流群入口

Independent, non-official open-source GDPR DPIA plugin for DeepSeek Harness, maintained by [朱玲凤](https://xingchendata.com/). The domestic PIA/policy commercial edition is a separate product and was not changed.

首页和评估内「帮助与交流」自动加载官网最新群码。入口可见时每五分钟读取，切回窗口立即刷新；过期、满员或暂停的群会被跳过，没有可用群时保留个人网站。只展示二维码方块及留白，失败时才提供重试。维护者仍需提供微信生成的新二维码并更新官网，系统不生成群码或检测实际群人数。

Contact refresh uses public configuration only, without assessment identifiers/content, credentials, referrer or model calls.

## Install

Back up existing data and use a separate DSH profile/environment. **Do not overwrite the domestic commercial edition.** Installation alone does not call a model.

```sh
dsh plugin --profile web add github:The-Data-Galaxy/dsh-dpia-workbench#v0.3.11-beta.7
# Or install the attached archive:
# dsh plugin --profile web add /absolute/path/dsh-dpia-workbench-0.3.11-beta.7.tgz
dsh --profile web
```

[官网下载安装包](https://xingchendata.com/dsh-dpia-workbench.html#download) · [技术交流](https://xingchendata.com/dsh-dpia-workbench.html#community)

## Exact artifact and verification

- `dsh-dpia-workbench-0.3.11-beta.7.tgz`: **363,443 bytes**, **70 files**.
- SHA-256: `f97acda4362e8317b0e0f23ea3d84afcd9a5bcfb86b1cf12f1013847900d0932`.
- The once-built archive and isolated installation match all 70 frozen files. The archive is published unchanged. Public README is updated separately; the other 69 archive files match tagged source. The archive README retains pre-acceptance candidate wording and internal status references; use these release notes for current results.
- One 22-file internal regression ended with **121 distinct passing checks**, after failed-only fixture/evidence rechecks. The first full run was not entirely green. This is not a claim of 121 standalone public tests.
- Actual Chrome E2E on macOS with official DSH Desktop CLI **0.2.1-rc.2**, isolated `web` profile: website → plugin QR, home/help, Esc/close and focus return, preserved synthetic assessment, personal website fallback, foreground refresh, and interval HTTP 200 after **300.293 seconds**.
- Focused tests cover replacement QR URLs, expiry/full/paused and empty states, failed configuration/images, retry, unsafe payloads, races and cleanup. Only the affected public frontend test group is rechecked for release; no full regression, install or build is repeated.
- No model execution, business report render, live group-manifest mutation or actual WeChat join was performed. Other machines, Windows, a full model-driven analysis journey and long-report layout remain unverified.

Original code and project-authored documentation remain **AGPL-3.0-only**. EDPB templates and the unofficial Chinese working translation retain their separate terms in `NOTICE`. Historical beta.5 remains Apache-2.0.
