import { abstraction } from '@ysk8hori/typescript-graph/dist/src/graph/abstraction';
import { mergeGraph } from '@ysk8hori/typescript-graph/dist/src/graph/utils';
import { Graph } from '@ysk8hori/typescript-graph/dist/src/models';
import { pipe } from 'remeda';
import { log } from '../utils/log';
import addStatus from './addStatus';
import extractAbstractionTarget from './extractAbstractionTarget';
import extractNoAbstractionDirs from './extractNoAbstractionDirs';
import markRelationsAsDeleted from './markRelationsAsDeleted';

/** ２つのグラフからその差分を反映した１つのグラフを生成する */
export default function createDifferenceGraph(
  baseGraph: Graph,
  headGraph: Graph,
  created: string[],
  deleted: string[],
  modified: string[],
  renamed:
    | { filename: string; previous_filename: string | undefined }[]
    | undefined,
) {
  markRelationsAsDeleted(baseGraph, headGraph);

  // base と head のグラフをマージする
  const mergedGraph = mergeGraph(headGraph, baseGraph);
  log('mergedGraph:', mergedGraph);

  const abstractedGraph = pipe(
    extractNoAbstractionDirs(
      [
        created,
        deleted,
        modified,
        renamed?.map(diff => diff.previous_filename).filter(Boolean) ?? [],
      ].flat(),
    ),
    dirs => extractAbstractionTarget(dirs, mergedGraph),
    dirs => abstraction(dirs, mergedGraph),
  );
  log('abstractedGraph:', abstractedGraph);

  const graph = addStatus({ modified, created, deleted: [] }, abstractedGraph);
  log('graph:', graph);
  return graph;
}
