import { abstraction } from '@ysk8hori/typescript-graph/dist/src/graph/abstraction';
import { mergeGraph } from '@ysk8hori/typescript-graph/dist/src/graph/utils';
import mermaidify from '@ysk8hori/typescript-graph/dist/src/mermaidify';
import {
  Graph,
  Meta,
  Relation,
  RelationOfDependsOn,
  isSameRelation,
} from '@ysk8hori/typescript-graph/dist/src/models';
import addStatus from './addStatus';
import extractAbstractionTarget from './extractAbstractionTarget';
import extractNoAbstractionDirs from './extractNoAbstractionDirs';
import { DangerDSLType } from 'danger/distribution/dsl/DangerDSL';
import { log } from '../log';
import { getMaxSize, getOrientation, isInDetails } from '../config';
import { filter, forEach, pipe, set } from 'remeda';
declare let danger: DangerDSLType;
export declare function markdown(message: string): void;

function isRelationOfDependsOn(
  relation: Relation,
): relation is RelationOfDependsOn {
  return relation.kind === 'depends_on';
}

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
  pipe(
    baseGraph.relations,
    filter(isRelationOfDependsOn),
    filter(
      (baseRelation: RelationOfDependsOn) =>
        !headGraph.relations.some(headRelation =>
          isSameRelation(baseRelation, headRelation),
        ),
    ),
    forEach(relation => set(relation, 'changeStatus', 'deleted')),
  );

  // base と head のグラフをマージする
  const mergedGraph = mergeGraph(headGraph, baseGraph);
  log('mergedGraph:', mergedGraph);

  const abstractedGraph = pipe(
    extractNoAbstractionDirs(
      [
        created,
        deleted,
        modified,
        (renamed?.map(diff => diff.previous_filename).filter(Boolean) ??
          []) as string[],
      ].flat(),
    ),
    dirs => extractAbstractionTarget(dirs, mergedGraph),
    dirs => abstraction(dirs, mergedGraph),
  );
  log('abstractedGraph:', abstractedGraph);

  const graph = addStatus({ modified, created, deleted: [] }, abstractedGraph);
  log('graph:', graph);

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

  const noAbstractionDirs = extractNoAbstractionDirs(
    [
      created,
      deleted,
      modified,
      (renamed?.map(diff => diff.previous_filename).filter(Boolean) ??
        []) as string[],
    ].flat(),
  );

  const tmpBaseGraph = pipe(
    noAbstractionDirs,
    dirs => extractAbstractionTarget(dirs, baseGraph),
    dirs => abstraction(dirs, baseGraph),
    graph => addStatus({ modified, created, deleted }, graph),
  );
  log('tmpBaseGraph(abstracted):', tmpBaseGraph);
  const tmpHeadGraph = pipe(
    noAbstractionDirs,
    dirs => extractAbstractionTarget(dirs, headGraph),
    dirs => abstraction(dirs, headGraph),
    graph => addStatus({ modified, created, deleted }, graph),
  );
  log('tmpHeadGraph(abstracted):', tmpHeadGraph);

  // base または head のグラフが大きすぎる場合は表示しない
  if (
    tmpBaseGraph.nodes.length > getMaxSize() ||
    tmpHeadGraph.nodes.length > getMaxSize()
  ) {
    markdown(`
## TypeScript Graph - Diff

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
    ...getOrientation(),
  });
  log('baseLines:', baseLines);

  // head の書き出し
  const headLines: string[] = [];
  await mermaidify((arg: string) => headLines.push(arg), tmpHeadGraph, {
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
