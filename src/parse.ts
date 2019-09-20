import { Stack } from './stack';
import * as L from './language';

export function parse(source: string): L.RootNode {
  return { type: 'root', children: parseInline(source) };
}

function fallback(fn: (() => boolean)[]): void {
  fn.find(f => f());
}

function parseInline(source: string): L.MfmNode[] {
  const groupValueStack = new Stack<{ group: L.Group, openingValue?: any }>();
  const resultStack = new Stack<Stack<L.MfmNode>>();
  resultStack.push(new Stack());
  let offset = 0;
  while (offset < source.length) {
    fallback([
      () => {
        if (!groupValueStack.empty()) {
          const { group, openingValue } = groupValueStack.top();
          const res = group.closing({ text: source, offset });
          if (res.status === 'succeed') {
            groupValueStack.pop();
            const children = resultStack.pop().toArray();
            const node = group.gen({ type: group.type, children }, [openingValue, res.value]);
            resultStack.top().push(node);
            offset += res.length;
            return true;
          }
        }
        return false;
      },
      () => {
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
          return true;
        }
        return false;
      },
      () => {
        for (const primitive of L.primitives) {
          const done = primitive(p => {
            const res = p.parser({ text: source, offset });
            if (res.status === 'succeed') {
              const node = p.gen({ type: p.type }, res.value);
              resultStack.top().push(node);
              offset += res.length;
              return true;
            } else {
              return false;
            }
          });
          if (done) return true;
        }
        return false;
      },
      () => {
        const siblings = resultStack.top();
        if (siblings.empty() || siblings.top().type !== 'text') {
          siblings.push({ type: 'text', text: '' });
        }
        (siblings.top() as L.TextNode).text += source[offset];
        offset++;
        return true;
      },
    ]);
  }
  return resultStack.pop().toArray();
}
