# DSH DPIA Workbench / DPIA 工作台

> **Pre-release candidate.** Review the requirements and limits below before installing.

A DeepSeek Harness bundle for versioned data protection impact assessments. It keeps source material and fact corrections, supports follow-up questions and reassessment, and prepares reviewable reports with a record of versions and outstanding decisions.

这是一个用于 DeepSeek Harness 的 DPIA 工作台插件：保留材料来源与事实修订，支持补答复评，并生成带版本和未决事项记录的报告。

## Current evidence / 当前证据

- Source candidate version: **0.3.11-beta.5**. Its runtime JavaScript is unchanged from beta.4. Consult the matching release notes for tag-specific artifact and installation evidence.
- The installed **0.3.10** baseline passed a real-host saved-result and refresh replay with DeepSeek Harness Desktop **0.2.0-rc.2** on macOS; its internal automated suite ended with 111 passing checks. That evidence does not certify the later source candidate.
- The beta.4 predecessor was installed in an isolated DSH web profile. In Safari, the plugin entry and empty state appeared; a synthetic assessment was created and reopened after refresh without configuring a model key. No analysis or report was run.
- Installation on another machine, Windows compatibility, and full-page layout of long reports have not been established by this evidence.

## Workflow / 使用流程

1. Create an assessment and import permitted project material. Review facts alongside their sources.
2. Start analysis in a dedicated DSH session. Saving material alone does not call a model.
3. Record corrections, answers, actions and review decisions. Saving an answer does not mark a question resolved.
4. Reassess against a new material revision. Review the changes and remaining gaps.
5. Generate an internal report or a clearly marked draft/formal document when the applicable gates are met.

新建评估并导入获准材料 → 核对事实与来源 → 在专用 DSH 会话分析 → 补答和复评 → 核对风险、整改及未决事项 → 生成相应状态的报告。

## License and third-party materials / 许可与第三方素材

Original plugin code and project-authored documentation use [Apache-2.0](LICENSE). The EDPB original template and its unofficial Chinese working translation are listed in [NOTICE](NOTICE) and are not relicensed as Apache-2.0. The project owner confirmed redistribution rights for the translation on 2026-10-14.

原创插件代码及项目自制说明采用 Apache-2.0。EDPB 原模板与非官方中文工作译本按 NOTICE 单独标注，不因随包提供而变为 Apache-2.0 素材。项目负责人已确认译本可公开再分发。

## Data and limits / 数据与限制

Assessment files are stored as plaintext on the local machine, under `~/.dsh/dpia-workbench` by default (or the configured DSH data directory). When analysis is started, the relevant material is sent through the user's configured DSH model workflow. The plugin does not replace professional review or approve a processing activity.

评估文件默认在本机明文保存；启动分析后，相关材料会进入用户配置的 DSH 模型流程。插件不会代替专业复核，也不会自动批准处理活动。

The bundled EDPB template is tracked as a consultation version unless its current official status is verified. The Chinese working translation is unofficial. Neither is an EDPB endorsement of this plugin.

内置 EDPB 模板须按核验时的官方状态标识；中文工作译本不是官方译本。插件不代表 EDPB 背书。

## Runtime requirements / 运行依赖

The bundled Skill needs Python 3.9+. Document extraction and report checks need `python-docx` with native comment support and `pypdf`; PDF template work also needs `reportlab` and a compatible `pdftoppm`. Report rendering uses an executable selected by `DSH_DPIA_RENDERER`, or the current user's `~/.local/bin/codex-render-docx`. It must accept the plugin's DOCX rendering arguments and produce the expected PDF and page images. The plugin reports missing dependencies instead of installing them automatically. Installation and report rendering outside the development Mac are unverified.

内置 Skill 需要 Python 3.9+。文档提取与检查需要支持原生批注的 `python-docx` 和 `pypdf`；PDF 模板还需 `reportlab` 与兼容的 `pdftoppm`。报告渲染使用 `DSH_DPIA_RENDERER` 指定的可执行程序，或当前用户目录下的默认入口。插件不会自动安装这些依赖；开发机以外的完整安装仍待验证。

## Tests / 测试

The `test/` directory contains nine files adapted from the internal suite that do not depend on private cases or absolute development paths. The beta.3 standalone suite ran once: 46 Node checks and 17 template-preservation checks passed; the native-PDF group initially passed 3/4, with one test failing because it still wrote to an internal evidence path. After removing that test-only path, only the failed test was rerun and passed. Thus 67 distinct checks passed with none skipped, although the initial suite run was not all green. The beta.5 runtime and test logic are unchanged from that corrected beta.3 candidate. See the matching release notes for artifact-specific checks; internal tests requiring local cases, scripts or Codex runtimes were intentionally left out. See [CONTRIBUTING.md](CONTRIBUTING.md) for focused commands.

`test/` 保留九个不依赖内部案例或个人绝对路径的测试文件。beta.3 独立全组仅运行一次，最终 67 项各通过、0 跳过；原生 PDF 组初次有一项测试夹具残留内部路径，修正后只复验该失败项。beta.5 的运行时与修正后的测试逻辑不变；对应标签的制品核验结果以发布说明为准。

## Installation / 安装

Use a DSH profile whose existing plugins and data have been backed up. Once the named tag is published, install from GitHub, or install the exact release archive from its local path. Then start that profile:

```sh
dsh plugin --profile web add github:The-Data-Galaxy/dsh-dpia-workbench#v0.3.11-beta.5
# Or: dsh plugin --profile web add /absolute/path/dsh-dpia-workbench-0.3.11-beta.5.tgz
dsh --profile web
```

Replace `web` with the intended profile. These commands become usable only after the corresponding repository tag or archive is published. Installing the plugin does not start an assessment or call a model. To roll back, reinstall the previously verified archive. Assessment files are separate from the bundle; back them up before changing profiles or versions. Do not delete the data directory when removing the plugin.

请先备份目标 DSH profile 的插件与数据；对应仓库标签或归档公开后，再按精确版本安装并启动该 profile。`web` 可替换为实际 profile 名称。安装本身不会启动评估或调用模型；回退时重装先前验证过的包，保留并事先备份评估数据。
