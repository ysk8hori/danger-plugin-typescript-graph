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

export default function outputGraph(
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
