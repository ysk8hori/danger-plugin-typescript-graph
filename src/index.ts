// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import {
  Graph,
  Meta,
  isSameRelation,
} from '@ysk8hori/typescript-graph/dist/src/models';
import { DangerDSLType } from '../node_modules/danger/distribution/dsl/DangerDSL';
import mermaidify from '@ysk8hori/typescript-graph/dist/src/mermaidify';
import { createGraph } from '@ysk8hori/typescript-graph/dist/src/graph/createGraph';
import { abstraction } from '@ysk8hori/typescript-graph/dist/src/graph/abstraction';
import { filterGraph } from '@ysk8hori/typescript-graph/dist/src/graph/filterGraph';
import { mergeGraph } from '@ysk8hori/typescript-graph/dist/src/graph/utils';
import { execSync } from 'child_process';
import path = require('path');
import addStatus from './addStatus';
import getRenameFiles from './getRenameFiles';
import getFullGraph from './getFullGraph';
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
  if (headGraph.nodes.length === 0) return;

  const hasRenamed = headGraph.nodes.some(headNode =>
    renamed?.map(({ filename }) => filename).includes(headNode.path),
  );

  if (deleted.length !== 0 || hasRenamed) {
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
  } else {
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
}

/** （本PRで）変更のあったファイルのパスから、抽象化してはいけないディレクトリのリストを作成する */
function extractNoAbstractionDirs(filePaths: string[]) {
  return (
    filePaths
      .map(file => {
        const array = file.split('/');
        if (array.includes('node_modules')) {
          // node_modules より深いディレクトリ階層の情報は捨てる
          // node_modules 内の node の name はパッケージ名のようなものになっているのでそれで良い
          return 'node_modules';
        } else if (array.length === 1) {
          // トップレベルのファイルの場合
          return undefined;
        } else {
          // 末尾のファイル名は不要
          return path.join(...array.slice(0, array.length - 1));
        }
      })
      .filter(Boolean)
      .sort()
      // noAbstractionDirs の重複を除去する
      .reduce<string[]>((prev, current) => {
        if (!current) return prev;
        if (!prev.includes(current)) prev.push(current);
        return prev;
      }, [])
  );
}

/** グラフと、抽象化してはいけないファイルのパスから、抽象化して良いディレクトリのパスを取得する */
function extractAbstractionTarget(
  fullGraph: Graph,
  noAbstractionDirs: string[],
): string[] {
  return (
    fullGraph.nodes
      .map(node => path.dirname(node.path))
      .filter(path => path !== '.' && !path.includes('node_modules'))
      .filter(path => noAbstractionDirs.every(dir => dir !== path))
      .sort()
      // 重複を除去する
      .reduce<string[]>((prev, current) => {
        if (!current) return prev;
        if (!prev.includes(current)) prev.push(current);
        return prev;
      }, [])
  );
}
