import { Stack } from './stack';
import * as N from './nodes';
import * as P from './parser-combinators';

export function parse(source: string): N.RootNode {
  return N.root(parseInline(source));
}

function parseInline(source: string): N.MfmNode[] {
  const resultStack = new Stack<Stack<N.MfmNode>>();
  resultStack.push(new Stack());
  let offset = 0;
  while (offset < source.length) tryPrimitives();
  return concatConsecutiveTextNodes(resultStack.pop().toArray());

  function tryPrimitives() {
    const res = inline.parse({ text: source, offset });
    if (res.status === 'succeed') {
      resultStack.top().push(res.value);
      offset += res.length;
      return true;
    }
  }
}

const inline: P.Parser<N.MfmNode> = P.lazy(() => P.alt<N.MfmNode>([
  P.str('<jump>').then(inline.nonGreedyMany1(P.str('</jump>'))).map(concatConsecutiveTextNodes).map(N.jump),
  P.str('***').then(inline.nonGreedyMany1(P.str('***'))).map(concatConsecutiveTextNodes).map(N.big),
  P.str('**').then(inline.nonGreedyMany1(P.str('**'))).map(concatConsecutiveTextNodes).map(N.bold),
  P.str('<i>').then(inline.nonGreedyMany1(P.str('</i>'))).map(concatConsecutiveTextNodes).map(N.italic),
  P.str('<small>').then(inline.nonGreedyMany1(P.str('</small>'))).map(concatConsecutiveTextNodes).map(N.small),
  P.str('<motion>').then(inline.nonGreedyMany1(P.str('</motion>'))).map(concatConsecutiveTextNodes).map(N.motion),
  P.str('(((').then(inline.nonGreedyMany1(P.str(')))'))).map(concatConsecutiveTextNodes).map(N.motion),
  P.str('~~').then(inline.nonGreedyMany1(P.str('~~'))).map(concatConsecutiveTextNodes).map(N.strike),
  P.str('<flip>').then(inline.nonGreedyMany1(P.str('</flip>'))).map(concatConsecutiveTextNodes).map(N.flip),
  P.seq([P.regex(/^<spin\s?([a-z]*)>/), inline.nonGreedyMany1(P.str('</spin>'))]).map(([[, attr], children]) => N.spin(attr, concatConsecutiveTextNodes(children))),
  P.regex(/^__([a-zA-Z0-9\s]+)__/).map(m => m[1]).map(text => [N.text(text)]).map(N.bold),
  P.regex(/^\*([a-zA-Z0-9\s]+)\*/).map(m => m[1]).map(text => [N.text(text)]).map(N.italic),
  P.regex(/^_([a-zA-Z0-9\s]+)_/).map(m => m[1]).map(text => [N.text(text)]).map(N.italic),
  P.regex(/^`([^\n]+?)`/).map(m => m[1]).map(N.inlineCode),
  P.regex(/^\\\((.+?)\\\)/).map(m => m[1]).map(N.inlineMath),
  P.any.map(N.text),
]));

function concatConsecutiveTextNodes(nodes: N.MfmNode[]): N.MfmNode[] {
  const newNodes = new Stack<N.MfmNode>();
  for (const node of nodes) {
    if (node.type === 'text') {
      if (newNodes.empty() || newNodes.top().type !== 'text') {
        newNodes.push(N.text(''));
      }
      (newNodes.top() as N.TextNode).text += node.text;
    } else {
      newNodes.push(node);
    }
  }
  return newNodes.toArray();
}
