import { abstraction } from '@ysk8hori/typescript-graph/dist/src/graph/abstraction';
import { Graph } from '@ysk8hori/typescript-graph/dist/src/models';
import { pipe } from 'remeda';
import { log } from '../utils/log';
import addStatus from './addStatus';
import extractAbstractionTarget from './extractAbstractionTarget';
import extractNoAbstractionDirs from './extractNoAbstractionDirs';

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
  const noAbstractionDirs = extractNoAbstractionDirs(
    [
      created,
      deleted,
      modified,
      renamed?.map(diff => diff.previous_filename).filter(Boolean) ?? [],
    ].flat(),
  );

  const baseGraph = pipe(
    noAbstractionDirs,
    dirs => extractAbstractionTarget(dirs, fullBaseGraph),
    dirs => abstraction(dirs, fullBaseGraph),
    graph => addStatus({ modified, created, deleted }, graph),
  );
  log('baseGraph(abstracted):', baseGraph);
  const headGraph = pipe(
    noAbstractionDirs,
    dirs => extractAbstractionTarget(dirs, fullHeadGraph),
    dirs => abstraction(dirs, fullHeadGraph),
    graph => addStatus({ modified, created, deleted }, graph),
  );
  log('headGraph(abstracted):', headGraph);
  return { baseGraph, headGraph };
}
