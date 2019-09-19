import { Stack } from './stack';
import * as L from './language';

export function parse(source: string): L.RootNode {
  return { type: 'root', children: parseInline(source) };
}

function parseInline(source: string): L.MfmNode[] {
  const groupValueStack = new Stack<{ group: L.Group, openingValue?: any }>();
  const resultStack = new Stack<Stack<L.MfmNode>>();
  resultStack.push(new Stack());
  let offset = 0;
  while (offset < source.length) {
    {
      if (!groupValueStack.empty()) {
        const { group, openingValue } = groupValueStack.top();
        const res = group.closing({ text: source, offset });
        if (res.status === 'succeed') {
          groupValueStack.pop();
          const children = resultStack.pop().toArray();
          const node = group.gen({ type: group.type, children }, [openingValue, res.value]);
          resultStack.top().push(node);
          offset += res.length;
          continue;
        }
      }
    }
    {
      const { group, length, value } = (() => {
        for (const group of L.groups) {
          const res = group.opening({ text: source, offset });
          if (res.status === 'succeed') {
            return { group, length: res.length, value: res.value };
          }
        }
        return { group: null, length: 0, value: null };
      })();
      if (group !== null) {
        groupValueStack.push({ group, openingValue: value });
        resultStack.push(new Stack());
        offset += length;
        continue;
      }
    }
    {
      const { primitive, length, value } = (() => {
        for (const primitive of L.primitives) {
          const res = primitive.parser({ text: source, offset });
          if (res.status === 'succeed') {
            return { primitive, length: res.length, value: res.value };
          }
        }
        return { primitive: null, length: 0, value: null };
      })();
      if (primitive !== null) {
        const node = primitive.gen({ type: primitive.type }, value);
        resultStack.top().push(node);
        offset += length;
        continue;
      }
    }
    {
      const siblings = resultStack.top();
      if (siblings.empty() || siblings.top().type !== 'text') {
        siblings.push({ type: 'text', text: '' });
      }
      (siblings.top() as L.TextNode).text += source[offset];
      offset++;
    }
  }
  return resultStack.pop().toArray();
}
