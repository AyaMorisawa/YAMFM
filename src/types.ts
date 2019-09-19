import { Parser } from './parser-combinators';

type PartialNode<GroupType, NodeType> = { type: GroupType, children: NodeType[] };

export type Group<GroupType, NodeType, S, T> = {
  type: GroupType,
  opening: Parser<S>,
  closing: Parser<T>,
  gen?: (partialNode: PartialNode<GroupType, NodeType>, values: [S, T]) => NodeType,
};

export function group<GroupType, NodeType, S, T>(
  type: GroupType,
  opening: Parser<S>,
  closing: Parser<T>,
  gen?: (partialNode: PartialNode<GroupType, NodeType>, values: [S, T]) => NodeType): Group<GroupType, NodeType, S, T> {
  if (typeof gen === 'undefined') gen = (partialNode, values) => partialNode as unknown as NodeType;
  return { type, opening, closing, gen };
}
