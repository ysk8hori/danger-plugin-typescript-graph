import path = require('path');

/** （本PRで）変更のあったファイルのパスから、抽象化してはいけないディレクトリのリストを作成する */
export default function extractNoAbstractionDirs(filePaths: string[]) {
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
      .map(dir => {
        const directoryPaths: string[] = [];
        let currentPath = dir;
        while (currentPath !== path.dirname(currentPath)) {
          directoryPaths.unshift(currentPath);
          currentPath = path.dirname(currentPath);
        }
        directoryPaths.unshift(currentPath);
        return directoryPaths;
      })
      .flat()
      .filter(dir => dir !== '.')
  );
}
