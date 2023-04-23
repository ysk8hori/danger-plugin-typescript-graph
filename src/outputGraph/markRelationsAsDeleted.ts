import {
  Graph,
  RelationOfDependsOn,
  isSameRelation,
  Relation,
} from '@ysk8hori/typescript-graph/dist/src/models';
import { pipe, filter, forEach, set } from 'remeda';

/** 削除された Relation にマークをつける */
export default function markRelationsAsDeleted(
  baseGraph: Graph,
  headGraph: Graph,
) {
  pipe(
    headGraph.relations,
    filter(isRelationOfDependsOn),
    filter(
      headRelation =>
        !baseGraph.relations.some(baseRelation =>
          isSameRelation(baseRelation, headRelation),
        ),
    ),
    forEach(relation => set(relation, 'changeStatus', 'deleted')),
  );
}

function isRelationOfDependsOn(
  relation: Relation,
): relation is RelationOfDependsOn {
  return relation.kind === 'depends_on';
}
