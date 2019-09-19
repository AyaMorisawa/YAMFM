import { Parser } from './parser-combinators';

type GroupPartialNode<GroupType, NodeType> = { type: GroupType, children: NodeType[] };

export type Group<GroupType, NodeType, S, T> = {
  type: GroupType,
  opening: Parser<S>,
  closing: Parser<T>,
  gen?: (partialNode: GroupPartialNode<GroupType, NodeType>, values: [S, T]) => NodeType,
};

export function group<GroupType, NodeType, S, T>(
  type: GroupType,
  opening: Parser<S>,
  closing: Parser<T>,
  gen?: (partialNode: GroupPartialNode<GroupType, NodeType>, values: [S, T]) => NodeType): Group<GroupType, NodeType, S, T> {
  if (typeof gen === 'undefined') gen = (partialNode, values) => partialNode as unknown as NodeType;
  return { type, opening, closing, gen };
}

type PrimitivePartialNode<PrimitiveType> = { type: PrimitiveType };

export type Primitive<PrimitiveType, NodeType, S> = {
  type: PrimitiveType,
  parser: Parser<S>,
  gen?: (partialNode: PrimitivePartialNode<PrimitiveType>, value: S) => NodeType
};

export function primitive<PrimitiveType, NodeType, S>(
  type: PrimitiveType,
  parser: Parser<S>,
  gen?: (partialNode: PrimitivePartialNode<PrimitiveType>, value: S) => NodeType): Primitive<PrimitiveType, NodeType, S> {
  if (typeof gen === 'undefined') gen = (partialNode, value) => partialNode as unknown as NodeType;
  return { type, parser, gen };
}
