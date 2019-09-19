import { Stack } from './stack';
import * as L from './language';

export function parse(source: string): L.RootNode {
  return { type: 'root', children: parseInline(source) };
}

function parseInline(source: string): L.MfmNode[] {
  const groupValueStack = new Stack<{ group: L.Group, openingValue?: any }>();
  const resultStack = new Stack<Stack<L.MfmNode>>();
  resultStack.push(new Stack());
  let needle = 0;
  while (needle < source.length) {
    {
      if (!groupValueStack.empty()) {
        const { group, openingValue } = groupValueStack.top();
        const res = group.closing({ text: source, offset: needle });
        if (res.status === 'succeed') {
          groupValueStack.pop();
          const children = resultStack.pop().toArray();
          const node = group.gen({ type: group.type, children }, [openingValue, res.value]);
          resultStack.top().push(node);
          needle += res.length;
          continue;
        }
      }
    }
    {
      const { group, length, value } = (() => {
        for (const group of L.groups) {
          const res = group.opening({ text: source, offset: needle });
          if (res.status === 'succeed') {
            return { group, length: res.length, value: res.value };
          }
        }
        return { group: null, length: 0, value: null };
      })();
      if (group !== null) {
        groupValueStack.push({ group, openingValue: value });
        resultStack.push(new Stack());
        needle += length;
        continue;
      }
    }
    {
      const siblings = resultStack.top();
      if (siblings.empty() || siblings.top().type !== 'text') {
        siblings.push({ type: 'text', text: '' });
      }
      (siblings.top() as L.TextNode).text += source[needle];
      needle++;
    }
  }
  return resultStack.pop().toArray();
}
