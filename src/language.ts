import * as T from './types';
import * as P from './parser-combinators';

export type RootNode = { type: 'root', children: MfmNode[] }

export type TextNode = { type: 'text', text: string };

type JumpNode = { type: 'jump', children: MfmNode[] };

type BigNode = { type: 'big', children: MfmNode[] };

type BoldNode = { type: 'bold', children: MfmNode[] };

type ItalicNode = { type: 'italic', children: MfmNode[] };

type SmallNode = { type: 'small', children: MfmNode[] };

type MotionNode = { type: 'motion', children: MfmNode[] };

type StrikeNode = { type: 'strike', children: MfmNode[] };

type FlipNode = { type: 'flip', children: MfmNode[] };

type SpinNode = { type: 'spin', attr: string, children: MfmNode[] };

type InlineCodeNode = { type: 'inlineCode', code: string };

type InlineMathNode = { type: 'inlineMath', formula: string };

type GroupNode
  = JumpNode
  | BigNode
  | BoldNode
  | ItalicNode
  | SmallNode
  | MotionNode
  | StrikeNode
  | FlipNode
  | SpinNode;

type PrimitiveNode
  = BoldNode
  | ItalicNode
  | InlineCodeNode
  | InlineMathNode;

export type MfmNode
  = RootNode
  | TextNode
  | GroupNode
  | PrimitiveNode;

const _groupType = false ? (null as GroupNode).type : null;

export type GroupT<S, T> = T.Group<typeof _groupType, MfmNode, S, T>;
type Group = <R>(cont: <S, T>(t: GroupT<S, T>) => R) => R;

export const groups: Group[] = [
  T.group('jump', P.str('<jump>'), P.str('</jump>')),
  T.group('big', P.str('***'), P.str('***')),
  T.group('bold', P.str('**'), P.str('**')),
  T.group('italic', P.str('<i>'), P.str('</i>')),
  T.group('small', P.str('<small>'), P.str('</small>')),
  T.group('motion', P.str('((('), P.str(')))')),
  T.group('motion', P.str('<motion>'), P.str('</motion>')),
  T.group('strike', P.str('~~'), P.str('~~')),
  T.group('flip', P.str('<flip>'), P.str('</flip>')),
  T.group('spin', P.regex(/^<spin\s?([a-z]*)>/), P.str('</spin>'), (partialNode, [[, attr]]) => {
    return Object.assign({}, partialNode, { attr }) as SpinNode;
  }),
];

const _primitiveType = false ? (null as PrimitiveNode).type : null;

type Primitive = <R>(cont: <S>(t: T.Primitive<typeof _primitiveType, MfmNode, S>) => R) => R

export const primitives: Primitive[] = [
  T.primitive('bold', P.regex(/^__([a-zA-Z0-9\s]+?)__/), (partialNode, [, text]) => {
    return Object.assign({}, partialNode, { children: [{ type: 'text', text } as TextNode] });
  }),
  T.primitive('italic', P.regex(/^\*([a-zA-Z0-9\s]+?)\*/), (partialNode, [, text]) => {
    return Object.assign({}, partialNode, { children: [{ type: 'text', text } as TextNode] });
  }),
  T.primitive('italic', P.regex(/^_([a-zA-Z0-9\s]+?)_/), (partialNode, [, text]) => {
    return Object.assign({}, partialNode, { children: [{ type: 'text', text } as TextNode] });
  }),
  T.primitive('inlineCode', P.regex(/^`([^`\n]+?)`/), (partialNode, [, code]) => {
    return Object.assign({}, partialNode, { code });
  }),
  T.primitive('inlineMath', P.regex(/^\\\((.+?)\\\)/), (partialNode, [, formula]) => {
    return Object.assign({}, partialNode, { formula });
  }),
];
