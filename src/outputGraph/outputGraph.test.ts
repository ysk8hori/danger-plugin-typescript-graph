import { outputGraph } from './outputGraph';

beforeEach(() => {
  global.markdown = jest.fn();
});

afterEach(() => {
  global.markdown = undefined;
});

test('出力可能なグラフがない場合は何も出力しない', () => {
  const graph = {
    nodes: [],
    relations: [],
  };
  const meta = {
    rootDir: '',
  };
  const renamed = undefined;
  global.danger = {
    github: { pr: { title: 'My Test Title' } },
    git: {
      modified_files: [],
      created_files: [],
      deleted_files: [],
    },
  };
  outputGraph(graph, graph, meta, renamed);
  expect(global.markdown).not.toHaveBeenCalled();
});
