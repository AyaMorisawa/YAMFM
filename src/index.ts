import * as N from './nodes';
import * as L from './language';

export function parse(source: string): N.RootNode {
  return L.root(source);
}
