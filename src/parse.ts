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
      },
      () => {
        for (const group of L.groups) {
          const res = group.opening({ text: source, offset });
          if (res.status === 'succeed') {
            groupValueStack.push({ group, openingValue: res.value });
            resultStack.push(new Stack());
            offset += res.length;
            return true;
          }
        }
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
            }
          });
          if (done) return true;
        }
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
