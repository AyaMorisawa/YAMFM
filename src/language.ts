import { Stack } from './stack';
import * as N from './nodes';
import * as P from './parser-combinators';

export function root(source: string): N.RootNode {
  return (inline.many().map(concatConsecutiveTextNodes).map(N.root).parse({ text: source, offset: 0 }) as P.Succeed<N.RootNode>).value;
}

const inline: P.Parser<N.MfmNode> = P.lazy(() => {
  const inlines = next => inline.nonGreedyMany1(next).map(concatConsecutiveTextNodes);

  return P.alt<N.MfmNode>([
    P.str('<jump>').then(inlines(P.str('</jump>'))).map(N.jump),
    P.str('***').then(inlines(P.str('***'))).map(N.big),
    P.str('**').then(inlines(P.str('**'))).map(N.bold),
    P.str('<i>').then(inlines(P.str('</i>'))).map(N.italic),
    P.str('<small>').then(inlines(P.str('</small>'))).map(N.small),
    P.str('<motion>').then(inlines(P.str('</motion>'))).map(N.motion),
    P.str('(((').then(inlines(P.str(')))'))).map(N.motion),
    P.str('~~').then(inlines(P.str('~~'))).map(N.strike),
    P.str('<flip>').then(inlines(P.str('</flip>'))).map(N.flip),
    P.seq([P.regex(/^<spin\s?([a-z]*)>/), inlines(P.str('</spin>'))]).map(([[, attr], children]) => N.spin(attr, children)),
    P.regex(/^__([a-zA-Z0-9\s]+)__/).map(m => m[1]).map(text => [N.text(text)]).map(N.bold),
    P.regex(/^\*([a-zA-Z0-9\s]+)\*/).map(m => m[1]).map(text => [N.text(text)]).map(N.italic),
    P.regex(/^_([a-zA-Z0-9\s]+)_/).map(m => m[1]).map(text => [N.text(text)]).map(N.italic),
    P.regex(/^`([^\n]+?)`/).map(m => m[1]).map(N.inlineCode),
    P.regex(/^\\\((.+?)\\\)/).map(m => m[1]).map(N.inlineMath),
    P.any.map(N.text),
  ]);
});

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
