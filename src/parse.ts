import { Stack } from './stack';
import { RootNode, Group, TextNode, MfmNode, language } from './language';

export function parse(source: string): RootNode {
  return { type: 'root', children: parseInline(source) };
}

function parseInline(source: string): MfmNode[] {
  const groupMatchStack = new Stack<{ group: Group, openingValue?: any }>();
  const resultStack = new Stack<MfmNode[]>();
  resultStack.push([]);
  let needle = 0;
  while (needle < source.length) {
    {
      if (!groupMatchStack.empty()) {
        const { group, openingValue } = groupMatchStack.top();
        const res = group.closing({ text: source, offset: needle });
        if (res.status === 'succeed') {
          groupMatchStack.pop();
          const children = resultStack.pop();
          const node = group.gen({ type: group.type, children }, [openingValue, res.value]);
          resultStack.top().push(node);
          needle += res.length;
          continue;
        }
      }
    }
    {
      const { group, length, value } = (() => {
        for (const group of language.groups) {
          const res = group.opening({ text: source, offset: needle });
          if (res.status === 'succeed') {
            return { group, length: res.length, value: res.value };
          }
        }
        return { group: null, length: 0, value: null };
      })();
      if (group !== null) {
        groupMatchStack.push({ group, openingValue: value });
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
