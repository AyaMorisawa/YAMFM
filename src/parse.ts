import { Stack } from './stack';
import * as S from './language/syntaxes';
import * as N from './language/nodes';

export function parse(source: string): N.RootNode {
  return { type: 'root', children: parseInline(source) };
}

function fallback(fn: (() => boolean)[]): void {
  fn.find(f => f());
}

function parseInline(source: string): N.MfmNode[] {
  const groupValueStack = new Stack<<R>(cont: <S, T>(t: { g: S.GroupT<S, T>, openingValue?: S }) => R) => R>();
  const resultStack = new Stack<Stack<N.MfmNode>>();
  resultStack.push(new Stack());
  let offset = 0;
  while (offset < source.length) {
    fallback([
      () => {
        if (!groupValueStack.empty()) {
          const groupValue = groupValueStack.top();
          const done = groupValue(({ g, openingValue }) => {
            const res = g.closing({ text: source, offset });
            if (res.status === 'succeed') {
              groupValueStack.pop();
              const children = resultStack.pop().toArray();
              const node = g.gen({ type: g.type, children }, [openingValue, res.value]);
              resultStack.top().push(node);
              offset += res.length;
              return true;
            }
          });
          if (done) return true;
        }
      },
      () => {
        for (const group of S.groups) {
          const done = group(g => {
            const res = g.opening({ text: source, offset });
            if (res.status === 'succeed') {
              groupValueStack.push(cont => cont({ g, openingValue: res.value }));
              resultStack.push(new Stack());
              offset += res.length;
              return true;
            }
          });
          if (done) return true;
        }
      },
      () => {
        for (const primitive of S.primitives) {
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
        (siblings.top() as N.TextNode).text += source[offset];
        offset++;
        return true;
      },
    ]);
  }
  return resultStack.pop().toArray();
}
