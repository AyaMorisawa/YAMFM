import * as T from './types';
import * as P from './parser-combinators';

export type RootNode = { type: 'root', children: MfmNode[] }

export type TextNode = { type: 'text', text: string };

export type JumpNode = { type: 'jump', children: MfmNode[] };

export type BigNode = { type: 'big', children: MfmNode[] };

export type BoldNode = { type: 'bold', children: MfmNode[] };

export type ItalicNode = { type: 'italic', children: MfmNode[] };

export type SmallNode = { type: 'small', children: MfmNode[] };

export type MotionNode = { type: 'motion', children: MfmNode[] };

export type StrikeNode = { type: 'strike', children: MfmNode[] };

export type FlipNode = { type: 'flip', children: MfmNode[] };

export type SpinNode = { type: 'spin', attr: string, children: MfmNode[] };

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

export type MfmNode
  = RootNode
  | TextNode
  | GroupNode;

const _groupType = false ? (null as GroupNode).type : null;

export type Group = T.Group<typeof _groupType, MfmNode, any, any>;

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
    return Object.assign({}, partialNode, { attr }) as unknown as MfmNode;
  })
];
