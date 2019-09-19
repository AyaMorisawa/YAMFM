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

function group(type: typeof _groupType, opening: string | RegExp, closing: string, gen?: (partialNode: PartialNode, matches: { openingMatch?: RegExpMatchArray, closingMatch?: RegExpMatchArray }) => Node) {
  if (typeof gen === 'undefined') gen = (partialNode, matches) => partialNode as Node;
  return { type, opening, closing, gen };
}

const groups: Group[] = [
  group('jump', '<jump>', '</jump>'),
  group('big', '***', '***'),
  group('bold', '**', '**'),
  group('italic', '<i>', '</i>'),
  group('small', '<small>', '</small>'),
  group('motion', '(((', ')))'),
  group('motion', '<motion>', '</motion>'),
  group('strike', '~~', '~~'),
  group('flip', '<flip>', '</flip>'),
  group('spin', /^<spin\s?([a-z]*)>/, '</spin>', (partialNode, { openingMatch }) => {
    return Object.assign({}, partialNode, { attr: openingMatch[1] }) as Node;
  }),
];

export const language = { groups };
