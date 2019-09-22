import { Stack } from './stack';
import * as S from './language/syntaxes';
import * as N from './language/nodes';

export function parse(source: string): N.RootNode {
  return { type: 'root', children: parseInline(source) };
}

function parseInline(source: string): N.MfmNode[] {
  const groupValueStack = new Stack<<R>(cont: <S, T>(t: { g: S.GroupT<S, T>, openingValue?: S }) => R) => R>();
  const resultStack = new Stack<Stack<N.MfmNode>>();
  resultStack.push(new Stack());
  let offset = 0;
  while (offset < source.length) [tryGroupClosing, tryGroupOpenings, tryPrimitives, tryText].find(f => f());
  return resultStack.pop().toArray();

  function tryGroupClosing() {
    if (!groupValueStack.empty()) {
      const groupValue = groupValueStack.top();
      const done = groupValue(({ g, openingValue }) => {
        const res = g.closing.parse({ text: source, offset });
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
  }

  function tryGroupOpenings() {
    for (const group of S.groups) {
      const done = group(g => {
        const res = g.opening.parse({ text: source, offset });
        if (res.status === 'succeed') {
          groupValueStack.push(cont => cont({ g, openingValue: res.value }));
          resultStack.push(new Stack());
          offset += res.length;
          return true;
        }
      });
      if (done) return true;
    }
  }

  function tryPrimitives() {
    for (const primitive of S.primitives) {
      const res = primitive.parse({ text: source, offset });
      if (res.status === 'succeed') {
        resultStack.top().push(res.value);
        offset += res.length;
        return true;
      }
    }
  }

  function tryText() {
    const siblings = resultStack.top();
    if (siblings.empty() || siblings.top().type !== 'text') {
      siblings.push(N.text(''));
    }
    (siblings.top() as N.TextNode).text += source[offset];
    offset++;
    return true;
  }
}
