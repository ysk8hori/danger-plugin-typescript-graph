import mermaidify from '@ysk8hori/typescript-graph/dist/src/mermaidify';
import { Graph, Meta } from '@ysk8hori/typescript-graph/dist/src/models';
import { DangerDSLType } from 'danger/distribution/dsl/DangerDSL';
import { log } from '../utils/log';
import { getMaxSize, getOrientation, isInDetails } from '../utils/config';
import createDifferenceGraph from './createDifferenceGraph';
import applyMutualDifferences from './applyMutualDifferences';
declare let danger: DangerDSLType;
export declare function markdown(message: string): void;

export function outputGraph(
  fullBaseGraph: Graph,
  fullHeadGraph: Graph,
  meta: Meta,
  renamed:
    | {
        filename: string;
        previous_filename: string | undefined;
      }[]
    | undefined,
) {
  const modified = danger.git.modified_files;
  const created = danger.git.created_files;
  const deleted = danger.git.deleted_files;
  // 削除された Relation にマークをつける
  const graph = createDifferenceGraph(
    fullBaseGraph,
    fullHeadGraph,
    created,
    deleted,
    modified,
    renamed,
  );

  // グラフが大きすぎる場合は表示しない
  if (graph.nodes.length > getMaxSize()) {
    markdown(`
## TypeScript Graph - Diff

> 表示ノード数が多いため、グラフを表示しません。
> グラフを表示したい場合、環境変数 TSG_MAX_SIZE を設定してください。
>
> 本PRでの表示ノード数: ${graph.nodes.length}
> 最大表示ノード数: ${getMaxSize()}
`);
    return;
  }

  const mermaidLines: string[] = [];
  mermaidify((arg: string) => mermaidLines.push(arg), graph, {
    rootDir: meta.rootDir,
    ...getOrientation(),
  });
  log('mermaidLines:', mermaidLines);

  markdown(`
## TypeScript Graph - Diff

${outputIfInDetails(`
<details>
<summary>mermaid</summary>
`)}

\`\`\`mermaid
${mermaidLines.join('')}
\`\`\`

${outputIfInDetails('</details>')}
`);
}

/**
 * ファイルの削除またはリネームがある場合は Graph を2つ表示する
 */
export async function output2Graphs(
  fullBaseGraph: Graph,
  fullHeadGraph: Graph,
  meta: Meta,
  renamed:
    | {
        filename: string;
        previous_filename: string | undefined;
      }[]
    | undefined,
) {
  const modified = danger.git.modified_files;
  const created = danger.git.created_files;
  const deleted = danger.git.deleted_files;

  const { baseGraph, headGraph } = applyMutualDifferences(
    created,
    deleted,
    modified,
    renamed,
    fullBaseGraph,
    fullHeadGraph,
  );

  // base または head のグラフが大きすぎる場合は表示しない
  if (
    baseGraph.nodes.length > getMaxSize() ||
    headGraph.nodes.length > getMaxSize()
  ) {
    markdown(`
## TypeScript Graph - Diff

> 表示ノード数が多いため、グラフを表示しません。
> グラフを表示したい場合、環境変数 TSG_MAX_SIZE を設定してください。
>
> Base branch の表示ノード数: ${baseGraph.nodes.length}
> Head branch の表示ノード数: ${headGraph.nodes.length}
> 最大表示ノード数: ${getMaxSize()}
`);
    return;
  }

  // base の書き出し
  const baseLines: string[] = [];
  await mermaidify((arg: string) => baseLines.push(arg), baseGraph, {
    rootDir: meta.rootDir,
    ...getOrientation(),
  });
  log('baseLines:', baseLines);

  // head の書き出し
  const headLines: string[] = [];
  await mermaidify((arg: string) => headLines.push(arg), headGraph, {
    rootDir: meta.rootDir,
    ...getOrientation(),
  });
  log('headLines:', headLines);

  markdown(`
## TypeScript Graph - Diff

${outputIfInDetails(`
<details>
<summary>mermaid</summary>
`)}

### Base Branch

\`\`\`mermaid
${baseLines.join('')}
\`\`\`

### Head Branch

\`\`\`mermaid
${headLines.join('')}
\`\`\`

${outputIfInDetails('</details>')}
`);
}

/** isMermaidInDetails() の結果が true ならば与えられた文字列を返し、そうでなければ空文字を返す関数。 */
function outputIfInDetails(str: string): string {
  return isInDetails() ? str : '';
}
