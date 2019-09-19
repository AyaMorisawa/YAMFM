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

export type PartialNode = { type: typeof _groupType, children: Node[] };

export type Group = {
  type: typeof _groupType,
  opening: string | RegExp,
  closing: string,
  gen?: (partialNode: PartialNode, matches: { openingMatch?: RegExpMatchArray, closingMatch?: RegExpMatchArray }) => Node,
};

const groups: Group[] = [
  { type: 'jump', opening: '<jump>', closing: '</jump>' },
  { type: 'big', opening: '***', closing: '***' },
  { type: 'bold', opening: '**', closing: '**' },
  { type: 'italic', opening: '<i>', closing: '</i>' },
  { type: 'small', opening: '<small>', closing: '</small>' },
  { type: 'motion', opening: '(((', closing: ')))' },
  { type: 'motion', opening: '<motion>', closing: '</motion>' },
  { type: 'strike', opening: '~~', closing: '~~' },
  { type: 'flip', opening: '<flip>', closing: '</flip>' },
  {
    type: 'spin', opening: /^<spin\s?([a-z]*)>/, closing: '</spin>',
    gen: (partialNode, { openingMatch }) => Object.assign({}, partialNode, { attr: openingMatch[1] }) as Node
  },
];

export const language = { groups };
