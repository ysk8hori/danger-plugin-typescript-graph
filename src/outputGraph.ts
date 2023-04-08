import { abstraction } from '@ysk8hori/typescript-graph/dist/src/graph/abstraction';
import { mergeGraph } from '@ysk8hori/typescript-graph/dist/src/graph/utils';
import mermaidify from '@ysk8hori/typescript-graph/dist/src/mermaidify';
import {
  Graph,
  Meta,
  isSameRelation,
} from '@ysk8hori/typescript-graph/dist/src/models';
import addStatus from './addStatusFoo';
import extractAbstractionTarget from './extractAbstractionTarget';
import extractNoAbstractionDirs from './extractNoAbstractionDirs';
import { DangerDSLType } from 'danger/distribution/dsl/DangerDSL';
import { log } from './log';
import getMaxSize from './getMaxSize';
declare let danger: DangerDSLType;
export declare function markdown(message: string): void;

export function outputGraph(
  baseGraph: Graph,
  headGraph: Graph,
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
  headGraph.relations.forEach(current => {
    for (const baseRelation of baseGraph.relations) {
      if (
        !isSameRelation(baseRelation, current) &&
        baseRelation.kind === 'depends_on'
      ) {
        baseRelation.changeStatus = 'deleted';
      }
    }
  });
  // base と head のグラフをマージする
  const mergedGraph = mergeGraph(headGraph, baseGraph);
  log('mergedGraph:', mergedGraph);

  const abstractedGraph = abstraction(
    extractAbstractionTarget(
      mergedGraph,
      extractNoAbstractionDirs(
        [
          created,
          deleted,
          modified,
          (renamed?.map(diff => diff.previous_filename).filter(Boolean) ??
            []) as string[],
        ].flat(),
      ),
    ),
    mergedGraph,
  );
  log('abstractedGraph:', abstractedGraph);

  const graph = addStatus({ modified, created, deleted: [] }, abstractedGraph);
  log('graph:', graph);

  // グラフが大きすぎる場合は表示しない
  if (graph.nodes.length > getMaxSize()) {
    markdown(`
# TypeScript Graph - Diff

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
    LR: true,
  });
  log('mermaidLines:', mermaidLines);

  markdown(`
# TypeScript Graph - Diff

\`\`\`mermaid
${mermaidLines.join('')}
\`\`\`

`);
}

export async function output2Graphs(
  baseGraph: Graph,
  headGraph: Graph,
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
  // ファイルの削除またはリネームがある場合は Graph を2つ表示する
  let tmpBaseGraph = abstraction(
    extractAbstractionTarget(
      baseGraph,
      extractNoAbstractionDirs(
        [
          created,
          deleted,
          modified,
          (renamed?.map(diff => diff.previous_filename).filter(Boolean) ??
            []) as string[],
        ].flat(),
      ),
    ),
    baseGraph,
  );
  tmpBaseGraph = addStatus({ modified, created, deleted }, tmpBaseGraph);

  let tmpHeadGraph = abstraction(
    extractAbstractionTarget(
      headGraph,
      extractNoAbstractionDirs(
        [
          created,
          deleted,
          modified,
          (renamed?.map(diff => diff.previous_filename).filter(Boolean) ??
            []) as string[],
        ].flat(),
      ),
    ),
    headGraph,
  );
  tmpHeadGraph = addStatus({ modified, created, deleted }, tmpHeadGraph);

  // base または head のグラフが大きすぎる場合は表示しない
  if (
    tmpBaseGraph.nodes.length > getMaxSize() ||
    tmpHeadGraph.nodes.length > getMaxSize()
  ) {
    markdown(`
# TypeScript Graph - Diff

> 表示ノード数が多いため、グラフを表示しません。
> グラフを表示したい場合、環境変数 TSG_MAX_SIZE を設定してください。
>
> Base branch の表示ノード数: ${tmpBaseGraph.nodes.length}
> Head branch の表示ノード数: ${tmpHeadGraph.nodes.length}
> 最大表示ノード数: ${getMaxSize()}
`);
    return;
  }

  // base の書き出し
  const baseLines: string[] = [];
  await mermaidify((arg: string) => baseLines.push(arg), tmpBaseGraph, {
    rootDir: meta.rootDir,
    LR: true,
  });

  // head の書き出し
  const headLines: string[] = [];
  await mermaidify((arg: string) => headLines.push(arg), tmpHeadGraph, {
    rootDir: meta.rootDir,
    LR: true,
  });

  markdown(`
# TypeScript Graph - Diff

## Base Branch

\`\`\`mermaid
${baseLines.join('')}
\`\`\`

## Head Branch

\`\`\`mermaid
${headLines.join('')}
\`\`\`

`);
}
