import { abstraction } from '@ysk8hori/typescript-graph/dist/src/graph/abstraction';
import { mergeGraph } from '@ysk8hori/typescript-graph/dist/src/graph/utils';
import mermaidify from '@ysk8hori/typescript-graph/dist/src/mermaidify';
import {
  Graph,
  Meta,
  isSameRelation,
} from '@ysk8hori/typescript-graph/dist/src/models';
import addStatus from './addStatus';
import extractAbstractionTarget from './extractAbstractionTarget';
import extractNoAbstractionDirs from './extractNoAbstractionDirs';
import { DangerDSLType } from 'danger/distribution/dsl/DangerDSL';
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
  let tmpGraph = mergeGraph(headGraph, baseGraph);

  tmpGraph = abstraction(
    extractAbstractionTarget(
      tmpGraph,
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
    tmpGraph,
  );
  tmpGraph = addStatus({ modified, created, deleted: [] }, tmpGraph);

  const mermaidLines: string[] = [];
  mermaidify((arg: string) => mermaidLines.push(arg), tmpGraph, {
    rootDir: meta.rootDir,
    LR: true,
  });

  markdown(`
# TypeScript Graph - Diff

\`\`\`mermaid
${mermaidLines.join('\n')}
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
  // base の書き出し
  const baseLines: string[] = [];
  await mermaidify((arg: string) => baseLines.push(arg), tmpBaseGraph, {
    rootDir: meta.rootDir,
    LR: true,
  });

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
${baseLines.join('\n')}
\`\`\`

## Head Branch

\`\`\`mermaid
${headLines.join('\n')}
\`\`\`

`);
}
