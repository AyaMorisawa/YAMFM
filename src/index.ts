import * as N from './nodes';
import * as L from './language';
import * as P from './parser-combinators';

export function parse(source: string): N.RootNode {
  return (L.root.parse({ text: source, offset: 0 }) as P.Succeed<N.RootNode>).value;
}
