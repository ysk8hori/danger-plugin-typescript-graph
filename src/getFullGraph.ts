import { createGraph } from '@ysk8hori/typescript-graph/dist/src/graph/createGraph';
import { filterGraph } from '@ysk8hori/typescript-graph/dist/src/graph/filterGraph';
import { Graph, Meta } from '@ysk8hori/typescript-graph/dist/src/models';
import { execSync } from 'child_process';
import { DangerDSLType } from 'danger/distribution/dsl/DangerDSL';
import path = require('path');
declare let danger: DangerDSLType;

/**
 * TypeScript Graph の createGraph を使い head と base の Graph を生成する
 *
 * 内部的に git fetch と git checkout を実行するので、テストで実行する際には execSync を mock すること。
 *
 * また、処理に時間がかかるため Promise を返す。
 */
export default function getFullGraph() {
  return new Promise<{
    headGraph: Graph;
    baseGraph: Graph;
    meta: Meta;
  }>(resolve => {
    // head の Graph を生成
    const { graph: fullHeadGraph, meta } = createGraph(path.resolve('./'));
    // head には deleted 対象はない
    const headGraph = filterGraph(
      [danger.git.modified_files, danger.git.created_files].flat(),
      ['node_modules'],
      fullHeadGraph,
    );

    execSync(`git fetch origin ${danger.github.pr.base.ref}`);
    execSync(`git checkout ${danger.github.pr.base.ref}`);
    // base の Graph を生成
    const { graph: fullBaseGraph } = createGraph(path.resolve('./'));
    const baseGraph = filterGraph(
      [
        danger.git.modified_files,
        danger.git.created_files,
        danger.git.deleted_files,
      ].flat(),
      ['node_modules'],
      fullBaseGraph,
    );
    resolve({ headGraph, baseGraph, meta });
  });
}
