export type RootNode = { type: 'root', children: MfmNode[] };

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

export function text(text: string): TextNode {
  return { type: 'text', text };
}

export function bold(children: MfmNode[]): BoldNode {
  return { type: 'bold', children };
}

export function italic(children: MfmNode[]): ItalicNode {
  return { type: 'italic', children };
}

export function inlineCode(code: string): InlineCodeNode {
  return { type: 'inlineCode', code };
}

export function inlineMath(formula: string): InlineMathNode {
  return { type: 'inlineMath', formula };
}
