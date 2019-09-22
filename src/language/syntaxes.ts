import * as T from '../types';
import * as P from '../parser-combinators';
import * as N from './nodes';

const _groupType = false ? (null as N.GroupNode).type : null;

export type GroupT<S, T> = T.Group<typeof _groupType, N.MfmNode, S, T>;
type Group = <R>(cont: <S, T>(t: GroupT<S, T>) => R) => R;

export const groups: Group[] = [
  T.group('jump', P.str('<jump>'), P.str('</jump>')),
  T.group('big', P.str('***'), P.str('***')),
  T.group('bold', P.str('**'), P.str('**')),
  T.group('italic', P.str('<i>'), P.str('</i>')),
  T.group('small', P.str('<small>'), P.str('</small>')),
  T.group('motion', P.str('((('), P.str(')))')),
  T.group('motion', P.str('<motion>'), P.str('</motion>')),
  T.group('strike', P.str('~~'), P.str('~~')),
  T.group('flip', P.str('<flip>'), P.str('</flip>')),
  T.group('spin', P.regex(/^<spin\s?([a-z]*)>/), P.str('</spin>'), (partialNode, [[, attr]]) => {
    return Object.assign({}, partialNode, { attr });
  }),
];

type Primitive = P.Parser<N.MfmNode>;

export const primitives: Primitive[] = [
  P.regex(/^__([a-zA-Z0-9\s]+)__/).map(([, text]) => N.bold([N.text(text)])),
  P.regex(/^\*([a-zA-Z0-9\s]+)\*/).map(([, text]) => N.italic([N.text(text)])),
  P.regex(/^_([a-zA-Z0-9\s]+)_/).map(([, text]) => N.italic([N.text(text)])),
  P.regex(/^`([^\n]+?)`/).map(([, code]) => N.inlineCode(code)),
  P.regex(/^\\\((.+?)\\\)/).map(([, formula]) => N.inlineMath(formula)),
];

