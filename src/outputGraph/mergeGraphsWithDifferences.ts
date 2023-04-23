import { abstraction } from '@ysk8hori/typescript-graph/dist/src/graph/abstraction';
import { mergeGraph } from '@ysk8hori/typescript-graph/dist/src/graph/utils';
import { Graph } from '@ysk8hori/typescript-graph/dist/src/models';
import { pipe } from 'remeda';
import { log } from '../utils/log';
import addStatus from './addStatus';
import extractAbstractionTarget from './extractAbstractionTarget';
import extractNoAbstractionDirs from './extractNoAbstractionDirs';
import markRelationsAsDeleted from './markRelationsAsDeleted';
import { filterGraph } from '@ysk8hori/typescript-graph/dist/src/graph/filterGraph';

/** ２つのグラフからその差分を反映した１つのグラフを生成する */
export default function mergeGraphsWithDifferences(
  fullBaseGraph: Graph,
  fullHeadGraph: Graph,
  created: string[],
  deleted: string[],
  modified: string[],
  renamed:
    | { filename: string; previous_filename: string | undefined }[]
    | undefined,
) {
  markRelationsAsDeleted(fullBaseGraph, fullHeadGraph);

  // base と head のグラフをマージする
  const mergedGraph = mergeGraph(fullHeadGraph, fullBaseGraph);
  log('mergedGraph:', mergedGraph);

  const includes = [
    ...created,
    ...modified,
    ...(renamed
      ?.flatMap(diff => [diff.previous_filename, diff.filename])
      .filter(Boolean) ?? []),
  ];

  const abstractionTarget = pipe(includes, extractNoAbstractionDirs, dirs =>
    extractAbstractionTarget(dirs, mergedGraph),
  );

  const graph = pipe(
    mergedGraph,
    graph => filterGraph(includes, ['node_modules'], graph),
    graph => abstraction(abstractionTarget, graph),
    graph => (log('abstractedGraph:', graph), graph),
    graph => addStatus({ modified, created, deleted }, graph),
    graph => (log('graph:', graph), graph),
  );

  return graph;
}
