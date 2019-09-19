import { str, Parser, regex } from './parser-combinators';

export type RootNode = { type: 'root', children: Node[] }

export type TextNode = { type: 'text', text: string };

export type JumpNode = { type: 'jump', children: Node[] };

export type BigNode = { type: 'big', children: Node[] };

export type BoldNode = { type: 'bold', children: Node[] };

export type ItalicNode = { type: 'italic', children: Node[] };

export type SmallNode = { type: 'small', children: Node[] };

export type MotionNode = { type: 'motion', children: Node[] };

export type StrikeNode = { type: 'strike', children: Node[] };

export type FlipNode = { type: 'flip', children: Node[] };

export type SpinNode = { type: 'spin', attr: string, children: Node[] };

export type GroupNode
  = JumpNode
  | BigNode
  | BoldNode
  | ItalicNode
  | SmallNode
  | MotionNode
  | StrikeNode
  | FlipNode
  | SpinNode;

export type Node
  = RootNode
  | TextNode
  | GroupNode;

const _groupType = false ? (null as GroupNode).type : null;

type PartialNode = { type: typeof _groupType, children: Node[] };

export type Group = {
  type: typeof _groupType,
  opening: Parser<any>,
  closing: Parser<any>,
  gen?: (partialNode: PartialNode, values: [any, any]) => Node,
};

function group<S, T>(type: typeof _groupType, opening: Parser<S>, closing: Parser<T>, gen?: (partialNode: PartialNode, values: [S, T]) => Node): Group {
  if (typeof gen === 'undefined') gen = (partialNode, values) => partialNode as Node;
  return { type, opening, closing, gen };
}

const groups: Group[] = [
  group('jump', str('<jump>'), str('</jump>')),
  group('big', str('***'), str('***')),
  group('bold', str('**'), str('**')),
  group('italic', str('<i>'), str('</i>')),
  group('small', str('<small>'), str('</small>')),
  group('motion', str('((('), str(')))')),
  group('motion', str('<motion>'), str('</motion>')),
  group('strike', str('~~'), str('~~')),
  group('flip', str('<flip>'), str('</flip>')),
  group('spin', regex(/^<spin\s?([a-z]*)>/), str('</spin>'), (partialNode, [[, attr]]) => {
    return Object.assign({}, partialNode, { attr }) as Node;
  }),
];

export const language = { groups };
