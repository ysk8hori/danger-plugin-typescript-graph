/**
 * tsconfig を探索するディレクトリ情報を取得する。
 *
 * ここで指定した階層から上の階層に向かって tsconfig を探索する。
 */
export function getTsconfigRoot() {
  // 環境変数の TSG_TSCONFIG_ROOT を返却する
  return process.env.TSG_TSCONFIG_ROOT ?? './';
}

/** 変更ファイル数が多い場合にグラフの表示を抑止するが、その際のノード数を指定する値を取得する。 */
export function getMaxSize() {
  // 環境変数の TSG_MAX_SIZE を返却する
  return process.env.TSG_MAX_SIZE ? parseInt(process.env.TSG_MAX_SIZE, 10) : 30;
}

/** グラフの方向を指定したオブジェクトを取得する */
export function getOrientation() {
  // 環境変数の TSG_ORIENTATION を返却する
  return process.env.TSG_ORIENTATION === 'TB'
    ? { TB: true }
    : process.env.TSG_ORIENTATION === 'LR'
    ? { LR: true }
    : {};
}

export function isDebugEnabled() {
  return process.env.TSG_DEBUG;
}

/** Mermaid を `<details>` タグで囲み折りたたむかどうか */
export function isInDetails() {
  return process.env.TSG_IN_DETAILS;
}
