// extractAbstractionTarget のテスト
import extractAbstractionTarget from './extractAbstractionTarget';

it('グラフと、抽象化してはいけないファイルのパスから、抽象化して良いディレクトリのパスを取得する', () => {
  expect(
    extractAbstractionTarget(
      [
        '.github',
        '.github/workflows',
        'src',
        'src/components',
        'src/components/game',
        'src/components/game/cell',
      ],
      {
        nodes: [
          {
            path: 'src/components/game/cell/Hoge.ts',
            name: 'Hoge.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/components/game/cell/Cell.tsx',
            name: 'Cell.tsx',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/components/game/utils/answers/getAnswerClass.ts',
            name: 'getAnswerClass.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/components/game/cell/MemoLayer.tsx',
            name: 'MemoLayer.tsx',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/atoms.ts',
            name: 'atoms.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/components/game/GameBoard.tsx',
            name: 'GameBoard.tsx',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/components/game/cell/Cell.stories.tsx',
            name: 'Cell.stories.tsx',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/components/game/cell/Cell.test.tsx',
            name: 'Cell.test.tsx',
            changeStatus: 'not_modified',
          },
        ],
        relations: [
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/components/game/utils/answers/getAnswerClass.ts',
              name: 'getAnswerClass.ts',
              changeStatus: 'not_modified',
            },
            fullText: 'getAnswerClass',
            changeStatus: 'not_modified',
          },
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/components/game/cell/MemoLayer.tsx',
              name: 'MemoLayer.tsx',
              changeStatus: 'not_modified',
            },
            fullText: 'MemoLayer, { Props as MemoLayerProps }',
            changeStatus: 'not_modified',
          },
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/atoms.ts',
              name: 'atoms.ts',
              changeStatus: 'not_modified',
            },
            fullText: '{ AnswerImageVariant }',
            changeStatus: 'not_modified',
          },
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/components/game/cell/Hoge.ts',
              name: 'Hoge.ts',
              changeStatus: 'not_modified',
            },
            fullText: 'hoge',
            changeStatus: 'not_modified',
          },
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/GameBoard.tsx',
              name: 'GameBoard.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            fullText: 'Cell',
            changeStatus: 'not_modified',
          },
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/cell/Cell.stories.tsx',
              name: 'Cell.stories.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            fullText: 'Cell',
            changeStatus: 'not_modified',
          },
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/cell/Cell.test.tsx',
              name: 'Cell.test.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            fullText: 'Cell',
            changeStatus: 'not_modified',
          },
        ],
      },
    ),
  ).toEqual(['src/components/game/utils/answers']);
});
