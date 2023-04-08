import { DangerDSLType } from '../node_modules/danger/distribution/dsl/DangerDSL';
import getRenameFiles from './getRenameFiles';
import getFullGraph from './getFullGraph';
import output2Graphs from './output2Graphs';
import outputGraph from './outputGraph';
// Provides dev-time type structures for  `danger` - doesn't affect runtime.
declare let danger: DangerDSLType;
export declare function message(message: string): void;
export declare function warn(message: string): void;
export declare function fail(message: string): void;
export declare function markdown(message: string): void;

/**
 * Visualize the dependencies between files in the TypeScript code base.
 */
export default function typescriptGraph() {
  // Replace this with the code from your Dangerfile
  const title = danger.github.pr.title;
  message(`PR Title: ${title}`);

  makeGraph();
}

async function makeGraph() {
  // 以下の *_files は src/index.ts のようなパス文字列になっている
  const modified = danger.git.modified_files;
  const created = danger.git.created_files;
  const deleted = danger.git.deleted_files;

  // .tsファイルの変更がある場合のみ Graph を生成する。コンパイル対象外の ts ファイルもあるかもしれないがわからないので気にしない
  if (
    ![modified, created, deleted].flat().some(file => /\.ts|\.tsx/.test(file))
  ) {
    return;
  }

  const [renamed, { headGraph, baseGraph, meta }] = await Promise.all([
    getRenameFiles(),
    getFullGraph(),
  ]);

  // head のグラフが空の場合は何もしない
  if (headGraph.nodes.length === 0) return;

  const hasRenamed = headGraph.nodes.some(headNode =>
    renamed?.map(({ filename }) => filename).includes(headNode.path),
  );

  if (deleted.length !== 0 || hasRenamed) {
    // ファイルの削除またはリネームがある場合は Graph を2つ表示する
    output2Graphs(baseGraph, headGraph, meta, renamed);
  } else {
    outputGraph(baseGraph, headGraph, meta, renamed);
  }
}
