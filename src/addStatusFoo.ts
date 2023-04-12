import {
  Graph,
  ChangeStatus,
} from '@ysk8hori/typescript-graph/dist/src/models';
import hoge1 from './hoge1';
import hoge2 from './hoge2';
import hoge3 from './hoge3';
import hoge4 from './hoge4';
import hoge5 from './hoge5';
import hoge6 from './hoge6';
import hoge7 from './hoge7';
import hoge8 from './hoge8';
import hoge9 from './hoge9';
import hoge10 from './hoge10';
import hoge11 from './hoge11';
import hoge12 from './hoge12';
import hoge13 from './hoge13';
import hoge14 from './hoge14';
import hoge15 from './hoge15';
import hoge16 from './hoge16';
import hoge17 from './hoge17';
import hoge18 from './hoge18';
import hoge19 from './hoge19';
import hoge20 from './hoge20';
import hoge21 from './hoge21';
import hoge22 from './hoge22';
import hoge23 from './hoge23';
import hoge24 from './hoge24';
import hoge25 from './hoge25';
import hoge26 from './hoge26';
import hoge27 from './hoge27';
import hoge28 from './hoge28';
import hoge29 from './hoge29';

export default function addStatus(
  {
    modified,
    created,
    deleted,
  }: {
    modified: string[];
    created: string[];
    deleted: string[];
  },
  graph: Graph,
): Graph {
  const { nodes, relations } = graph;
  const newNodes = nodes.map(node => {
    const changeStatus: ChangeStatus = (function () {
      if (deleted.includes(node.path)) return 'deleted';
      if (created.includes(node.path)) return 'created';
      if (modified.includes(node.path)) return 'modified';
      return 'not_modified';
    })();
    return {
      ...node,
      changeStatus,
    };
  });
  return {
    nodes: newNodes,
    relations,
  };
}
