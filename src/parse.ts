import { Stack } from './stack';

type RootNode = { type: 'root', children: Node[] }

type TextNode = { type: 'text', text: string };

type JumpNode = { type: 'jump', children: Node[] };

type BigNode = { type: 'big', children: Node[] };

type BoldNode = { type: 'bold', children: Node[] };

type ItalicNode = { type: 'italic', children: Node[] };

type SmallNode = { type: 'small', children: Node[] };

type MotionNode = { type: 'motion', children: Node[] };

type StrikeNode = { type: 'strike', children: Node[] };

type FlipNode = { type: 'flip', children: Node[] };

type GroupNode
  = JumpNode
  | BigNode
  | BoldNode
  | ItalicNode
  | SmallNode
  | MotionNode
  | StrikeNode
  | FlipNode;

type Node
  = RootNode
  | TextNode
  | GroupNode;

const _groupType = false ? (null as GroupNode).type : null;

type Group = {
  type: typeof _groupType,
  opening: string,
  closing: string,
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
];

export function parse(source: string): RootNode {
  return parseInline(source);
}

function parseInline(source: string): RootNode {
  const groupStack = new Stack<Group>();
  const resultStack = new Stack<Node[]>();
  resultStack.push([]);
  let needle = 0;
  while (needle < source.length) {
    {
      if (!groupStack.empty()) {
        const group = groupStack.top();
        if (source.substr(needle, group.closing.length) === group.closing) {
          groupStack.pop();
          const children = resultStack.pop();
          resultStack.top().push({ type: group.type, children });
          needle += group.closing.length;
          continue;
        }
      }
    }
    {
      const group = groups.find(group => source.substr(needle, group.opening.length) === group.opening);
      if (typeof group !== 'undefined') {
        groupStack.push(group);
        resultStack.push([]);
        needle += group.opening.length;
        continue;
      }
    }
    {
      const siblings = resultStack.top();
      if (siblings.length === 0 || siblings[siblings.length - 1].type !== 'text') {
        siblings.push({ type: 'text', text: '' });
      }
      (siblings[siblings.length - 1] as TextNode).text += source[needle];
      needle++;
    }
  }
  return { type: 'root', children: resultStack.pop() };
}
