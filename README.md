# danger-plugin-typescript-graph

<p align="center">
  <a href="/docs/README_ja.md">日本語 (Japanese)</a> 
</p>

[![npm version](https://badge.fury.io/js/danger-plugin-typescript-graph.svg)](https://badge.fury.io/js/danger-plugin-typescript-graph)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

This plugin is a Danger plugin designed to automatically run the CLI tool typescript-graph, which visualizes the dependencies between files in a TypeScript codebase, in a CI environment. Understanding dependencies is crucial for maintaining code integrity. By using this plugin, you can easily check dependencies before creating or merging a pull request.

## Usage

Install:

```sh
yarn add danger-plugin-typescript-graph --dev
```

At a glance:

```js
// dangerfile.js
import typescriptGraph from 'danger-plugin-typescript-graph';

typescriptGraph();
```

## Configuration

The `.danger-tsgrc.json` is a configuration file that stores settings in JSON format. If the relevant configuration file does not exist, or if it is in an invalid format, the default settings will be applied.
Each configuration item has a corresponding environment variable, which takes precedence over the settings in the configuration file.

| Configuration Item                | Details                                                                           | Type         | Default Value | Description                                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------- | ------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Root directory for tsconfig       | Env: `TSG_TSCONFIG_ROOT`<br>Key: `tsconfigRoot`                                   | `string`     | `"./"`        | Specifies the directory where tsconfig will be searched.                                                                  |
| Maximum Node Count                | Env: `TSG_MAX_SIZE`<br>Key: `maxSize`                                             | `number`     | `30`          | Specifies the value to limit graph display when the number of changed files is large.                                     |
| Graph Orientation                 | Env: `TSG_ORIENTATION`<br>Key: `orientation`                                      | `TB` or `LR` | Not specified | Specifies the orientation (`TB` or `LR`) of the graph. However, Mermaid may produce graphs in the opposite direction.     |
| Debug Mode                        | Env: `TSG_DEBUG`<br>Key: `debug`                                                  | `boolean`    | `false`       | Specifies whether to enable debug mode. Logs will be output in debug mode.                                                |
| Enclose in `<details>` tag        | Env: `TSG_IN_DETAILS`<br>Key: `inDetails`                                         | `boolean`    | `true`        | Specifies whether to enclose Mermaid in a `<details>` tag and collapse it.                                                |
| Exclude Files                     | Env: None<br>Key: `exclude`                                                       | `string[]`   | `[]`          | Specifies the files to be excluded from the graph.                                                                        |
| Display index.ts Dependency Files | Env: `TSG_INCLUDE_INDEX_FILE_DEPENDENCIES`<br>Key: `includeIndexFileDependencies` | `boolean`    | `false`       | Specifies whether to display dependency files when the changed file is referenced from an index.ts in the same directory. |

## Changelog

See the GitHub [release history](https://github.com/ysk8hori/danger-plugin-typescript-graph/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
