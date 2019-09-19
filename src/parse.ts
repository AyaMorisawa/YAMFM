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

type SpinNode = { type: 'spin', attr: string, children: Node[] };

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

type Node
  = RootNode
  | TextNode
  | GroupNode;

const _groupType = false ? (null as GroupNode).type : null;

type PartialNode = { type: typeof _groupType, children: Node[] };

type Group = {
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

export function parse(source: string): RootNode {
  return parseInline(source);
}

function parseInline(source: string): RootNode {
  const groupMatchStack = new Stack<{ group: Group, openingMatch?: RegExpMatchArray }>();
  const resultStack = new Stack<Node[]>();
  resultStack.push([]);
  let needle = 0;
  while (needle < source.length) {
    {
      if (!groupMatchStack.empty()) {
        const { group, openingMatch } = groupMatchStack.top();
        if (source.substr(needle, group.closing.length) === group.closing) {
          groupMatchStack.pop();
          const children = resultStack.pop();
          const partialNode: PartialNode = { type: group.type, children };
          const node = typeof group.gen !== 'undefined' ? group.gen(partialNode, { openingMatch }) : partialNode as Node;
          resultStack.top().push(node);
          needle += group.closing.length;
          continue;
        }
      }
    }
    {
      const { group, length, matched } = (() => {
        for (const group of groups) {
          if (typeof group.opening === 'string') {
            if (source.substr(needle, group.opening.length) === group.opening) {
              return { group, length: group.opening.length, matched: null };
            }
          } else {
            const match = source.substr(needle).match(group.opening);
            if (match !== null) {
              return { group, length: match[0].length, matched: match };
            }
          }
        }
        return { group: null, length: 0, matched: null };
      })();
      if (group !== null) {
        groupMatchStack.push({ group, openingMatch: matched });
        resultStack.push([]);
        needle += length;
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
