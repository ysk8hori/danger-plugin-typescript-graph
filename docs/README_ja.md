# danger-plugin-typescript-graph

<p align="center">
  <a href="../README.md">English</a> 
</p>

[![npm version](https://badge.fury.io/js/danger-plugin-typescript-graph.svg)](https://badge.fury.io/js/danger-plugin-typescript-graph)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

このプラグインは、TypeScript のコードベース内のファイル間の依存関係を視覚化する CLI ツール typescript-graph を、CI 環境で自動的に実行するための Danger プラグインです。
コードの健全性を維持する上で、依存関係を理解することは非常に重要です。このプラグインを使用することで、プルリクエストを作成またはマージする前に依存関係を簡単にチェックできます。

## Usage

### インストール

```sh
yarn add danger-plugin-typescript-graph --dev
```

### 使用方法

```js
// dangerfile.js
import typescriptGraph from 'danger-plugin-typescript-graph';

typescriptGraph();
```

### 動作サンプル

#### 基本的なファイル変更

この例では、outputGraph.ts と関連するテストファイルを修正した場合の依存関係グラフを示します。変更されたファイルは黄色でハイライトされ、依存関係にあるファイルもグラフ上で明示されています。

```mermaid
flowchart
    classDef modified fill:yellow,stroke:#999,color:black
    subgraph src["src"]
        src/utils["/utils"]:::dir
        src/index.ts["index.ts"]
        subgraph src/outputGraph["/outputGraph"]
            src/outputGraph/outputGraph.ts["outputGraph.ts"]:::modified
            src/outputGraph/output2Graphs.test.ts["output2Graphs.test.ts"]:::modified
            src/outputGraph/mergeGraphsWithDifferences.ts["mergeGraphsWithDifferences.ts"]
            src/outputGraph/applyMutualDifferences.ts["applyMutualDifferences.ts"]
        end
    end
    src/outputGraph/outputGraph.ts-->src/utils
    src/outputGraph/outputGraph.ts-->src/outputGraph/mergeGraphsWithDifferences.ts
    src/outputGraph/outputGraph.ts-->src/outputGraph/applyMutualDifferences.ts
    src/index.ts-->src/outputGraph/outputGraph.ts
    src/outputGraph/output2Graphs.test.ts-->src/outputGraph/outputGraph.ts
    src/outputGraph/mergeGraphsWithDifferences.ts-->src/utils
    src/outputGraph/applyMutualDifferences.ts-->src/utils
    src/index.ts-->src/utils
```

#### ファイルの削除または移動を含む変更

このケースでは、ファイルが削除または移動された場合の影響を示しています。base branch と head branch でそれぞれ依存関係グラフが生成されます。削除されたファイルはグレーアウトで表示されます。

##### Base Branch

```mermaid
flowchart
    classDef modified fill:yellow,stroke:#999,color:black
    classDef deleted fill:dimgray,stroke:#999,color:black,stroke-dasharray: 4 4,stroke-width:2px;
    subgraph src["src"]
        src/index.ts["index.ts"]:::modified
        src/index.test.ts["index.test.ts"]
        src/getRenameFiles.ts["getRenameFiles.ts"]
        src/getFullGraph.ts["getFullGraph.ts"]
        subgraph src/graph_["/graph"]
            src/_graph__/index.ts["index.ts"]:::deleted
            src/_graph__/outputGraph.ts["outputGraph.ts"]
            src/_graph__/output2Graphs.ts["output2Graphs.ts"]
        end
    end
    src/_graph__/index.ts-->src/_graph__/outputGraph.ts
    src/_graph__/index.ts-->src/_graph__/output2Graphs.ts
    src/index.ts-->src/getRenameFiles.ts
    src/index.ts-->src/getFullGraph.ts
    src/index.ts-->src/_graph__/index.ts
    src/index.test.ts-->src/index.ts
```

##### Head Branch

```mermaid
flowchart
    classDef modified fill:yellow,stroke:#999,color:black
    subgraph src["src"]
        src/index.ts["index.ts"]:::modified
        src/index.test.ts["index.test.ts"]
        src/getRenameFiles.ts["getRenameFiles.ts"]
        src/getFullGraph.ts["getFullGraph.ts"]
        subgraph src/graph_["/graph"]
            src/_graph__/output2Graphs.ts["output2Graphs.ts"]
            src/_graph__/outputGraph.ts["outputGraph.ts"]
        end
    end
    src/index.ts-->src/getRenameFiles.ts
    src/index.ts-->src/getFullGraph.ts
    src/index.ts-->src/_graph__/output2Graphs.ts
    src/index.ts-->src/_graph__/outputGraph.ts
    src/index.test.ts-->src/index.ts
```

## 設定

`.danger-tsgrc.json`は設定情報を JSON 形式で格納する設定ファイルです。該当する設定ファイルが存在しない、または不正な形式である場合、デフォルト設定が適用されます。
各設定項目には対応する環境変数が存在し、環境変数が設定ファイルより優先されます。

| 設定項目                      | 詳細                                                                              | 型           | デフォルト値 | 説明                                                                                                                                                                                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------- | ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| tsconfig のルートディレクトリ | Env: `TSG_TSCONFIG_ROOT`<br>Key: `tsconfigRoot`                                   | `string`     | `"./"`       | tsconfig を探索するディレクトリ情報を指定します。                                                                                                                                                                                                                              |
| 最大ノード数                  | Env: `TSG_MAX_SIZE`<br>Key: `maxSize`                                             | `number`     | `30`         | 変更ファイル数が多い場合にグラフの表示を抑止する値を指定します。                                                                                                                                                                                                               |
| グラフの方向                  | Env: `TSG_ORIENTATION`<br>Key: `orientation`                                      | `TB` or `LR` | 指定なし     | グラフの方向（`TB`または`LR`）を指定します。ただし、Mermaid は指定された方向と逆向きのグラフを出力する場合があります。                                                                                                                                                         |
| デバッグモード                | Env: `TSG_DEBUG`<br>Key: `debug`                                                  | `boolean`    | `false`      | デバッグモードを有効にするか指定します。デバッグモードではログを出力します。                                                                                                                                                                                                   |
| `<details>`タグで囲む         | Env: `TSG_IN_DETAILS`<br>Key: `inDetails`                                         | `boolean`    | `true`       | Mermaid を `<details>` タグで囲み折りたたむかどうかを指定します。                                                                                                                                                                                                              |
| ファイルの除外対象            | Env: なし<br>Key: `exclude`                                                       | `string[]`   | `[]`         | グラフから除外するファイルを指定します。ファイルやディレクトリのパスが指定された文字列に部分一致する場合、それらのファイルやディレクトリを依存関係グラフから除外します。ただし、指定されたファイルが変更対象となった場合、そのファイルは除外されず依存関係グラフに含まれます。 |
| index.ts 依存ファイルを表示   | Env: `TSG_INCLUDE_INDEX_FILE_DEPENDENCIES`<br>Key: `includeIndexFileDependencies` | `boolean`    | `false`      | 変更対象のファイルが同階層の index.ts から参照されている場合、その依存ファイルも表示するかどうかを指定します。                                                                                                                                                                 |

## Changelog

See the GitHub [release history](https://github.com/ysk8hori/danger-plugin-typescript-graph/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
