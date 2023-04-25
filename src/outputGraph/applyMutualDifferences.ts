import { abstraction } from '@ysk8hori/typescript-graph/dist/src/graph/abstraction';
import { Graph } from '@ysk8hori/typescript-graph/dist/src/models';
import { pipe } from 'remeda';
import { log } from '../utils/utils2/log';
import addStatus from './addStatus';
import extractAbstractionTarget from './extractAbstractionTarget';
import extractNoAbstractionDirs from './extractNoAbstractionDirs';
import { filterGraph } from '@ysk8hori/typescript-graph/dist/src/graph/filterGraph';

/**
 * ２つのグラフの差分を互いに反映する。
 *
 * 実際にグラフの差分を見ているのではなく、github api で取得したファイルの差分を見ている。
 */
export default function applyMutualDifferences(
  created: string[],
  deleted: string[],
  modified: string[],
  renamed:
    | { filename: string; previous_filename: string | undefined }[]
    | undefined,
  fullBaseGraph: Graph,
  fullHeadGraph: Graph,
) {
  const includes = [
    ...created,
    ...modified,
    ...(renamed
      ?.flatMap(diff => [diff.previous_filename, diff.filename])
      .filter(Boolean) ?? []),
  ];

  const abstractionTargetsForBase = pipe(
    includes,
    extractNoAbstractionDirs,
    dirs => extractAbstractionTarget(dirs, fullBaseGraph),
  );
  const baseGraph = pipe(
    fullBaseGraph,
    graph => filterGraph(includes, ['node_modules'], graph),
    graph => abstraction(abstractionTargetsForBase, graph),
    graph => addStatus({ modified, created, deleted }, graph),
  );
  log('baseGraph(abstracted):', baseGraph);

  const abstractionTargetsForHead = pipe(
    includes,
    extractNoAbstractionDirs,
    dirs => extractAbstractionTarget(dirs, fullHeadGraph),
  );
  const headGraph = pipe(
    fullHeadGraph,
    graph => filterGraph(includes, ['node_modules'], graph),
    graph => abstraction(abstractionTargetsForHead, graph),
    graph => addStatus({ modified, created, deleted }, graph),
  );
  log('headGraph(abstracted):', headGraph);
  return { baseGraph, headGraph };
}
