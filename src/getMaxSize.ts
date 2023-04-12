/** 変更ファイル数が多い場合にグラフの表示を抑止するが、その際のノード数を指定する値を取得する。 */
export default function getMaxSize() {
  // 環境変数の TSG_MAX_SIZE を返却する
  return process.env.TSG_MAX_SIZE ? parseInt(process.env.TSG_MAX_SIZE, 10) : 30;
}
