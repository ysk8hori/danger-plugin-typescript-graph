import { Graph } from '@ysk8hori/typescript-graph/dist/src/models';
import { uniqueString } from '../../utils/reducer';

/**
 * includes 対象のファイルが同階層の index.ts または index.tsx から参照されている場合、その index.ts のパスのリストを返却する。
 */
export function extractIndexFileDependencies({
  graph,
  includeFilePaths,
}: {
  graph: Graph;
  includeFilePaths: string[];
}): string[] {
  return includeFilePaths
    .map(path => ({
      from: path.split('/').slice(0, -1).join('/').concat('/index.'),
      to: path,
    }))
    .map(hoge => (console.log(hoge), hoge))
    .map(
      ({ from, to }) =>
        graph.relations.find(
          relation =>
            relation.from.path.startsWith(from) && relation.to.path === to,
        )?.from.path,
    )
    .reduce(uniqueString, [])
    .filter(Boolean);
}
