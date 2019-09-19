import { Stack } from './stack';
import { RootNode, Group, TextNode, Node, language } from './language';

export function parse(source: string): RootNode {
  return { type: 'root', children: parseInline(source) };
}

function parseInline(source: string): Node[] {
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
          const node = group.gen({ type: group.type, children }, { openingMatch });
          resultStack.top().push(node);
          needle += group.closing.length;
          continue;
        }
      }
    }
    {
      const { group, length, matched } = (() => {
        for (const group of language.groups) {
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
  return resultStack.pop();
}
