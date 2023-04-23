import {
  Graph,
  RelationOfDependsOn,
  isSameRelation,
  Relation,
} from '@ysk8hori/typescript-graph/dist/src/models';
import { pipe, filter, forEach, set } from 'remeda';
import { log } from '../utils/log';

/** 削除された Relation にマークをつける */
export default function updateRelationsStatus(
  baseGraph: Graph,
  headGraph: Graph,
) {
  const deletedRelations = pipe(
    headGraph.relations,
    filter(isRelationOfDependsOn),
    filter(
      headRelation =>
        !baseGraph.relations.some(baseRelation =>
          isSameRelation(baseRelation, headRelation),
        ),
    ),
    forEach(relation => set(relation, 'changeStatus', 'deleted')),
    filter(relation => relation.changeStatus === 'deleted'),
    relations => (log('deletedRelations:', relations), relations),
  );
  const createdRelations = pipe(
    baseGraph.relations,
    filter(isRelationOfDependsOn),
    filter(
      baseRelation =>
        !headGraph.relations.some(headRelation =>
          isSameRelation(baseRelation, headRelation),
        ),
    ),
    forEach(relation => set(relation, 'changeStatus', 'created')),
    filter(relation => relation.changeStatus === 'created'),
    relations => (log('createdRelations:', relations), relations),
  );
  return { deletedRelations, createdRelations };
}

function isRelationOfDependsOn(
  relation: Relation,
): relation is RelationOfDependsOn {
  return relation.kind === 'depends_on';
}
