export type RootNode = { type: 'root', children: MfmNode[] };

export function root(children: MfmNode[]): RootNode {
  return { type: 'root', children };
}

export type TextNode = { type: 'text', text: string };

export function text(text: string): TextNode {
  return { type: 'text', text };
}

type JumpNode = { type: 'jump', children: MfmNode[] };

export function jump(children: MfmNode[]): JumpNode {
  return { type: 'jump', children };
}

type BigNode = { type: 'big', children: MfmNode[] };

export function big(children: MfmNode[]): BigNode {
  return { type: 'big', children };
}

type BoldNode = { type: 'bold', children: MfmNode[] };

export function bold(children: MfmNode[]): BoldNode {
  return { type: 'bold', children };
}

type ItalicNode = { type: 'italic', children: MfmNode[] };

export function italic(children: MfmNode[]): ItalicNode {
  return { type: 'italic', children };
}

type SmallNode = { type: 'small', children: MfmNode[] };

export function small(children: MfmNode[]): SmallNode {
  return { type: 'small', children };
}

type MotionNode = { type: 'motion', children: MfmNode[] };

export function motion(children: MfmNode[]): MotionNode {
  return { type: 'motion', children };
}

type StrikeNode = { type: 'strike', children: MfmNode[] };

export function strike(children: MfmNode[]): StrikeNode {
  return { type: 'strike', children };
}

type FlipNode = { type: 'flip', children: MfmNode[] };

export function flip(children: MfmNode[]): FlipNode {
  return { type: 'flip', children };
}

type SpinNode = { type: 'spin', attr: string, children: MfmNode[] };

export function spin(attr: string, children: MfmNode[]): SpinNode {
  return { type: 'spin', attr, children };
}

type InlineCodeNode = { type: 'inlineCode', code: string };

export function inlineCode(code: string): InlineCodeNode {
  return { type: 'inlineCode', code };
}

type InlineMathNode = { type: 'inlineMath', formula: string };

export function inlineMath(formula: string): InlineMathNode {
  return { type: 'inlineMath', formula };
}

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
