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
  P.str('__').then(P.regex(/^[a-zA-Z0-9\s]+/)).skip(P.str('__')).map(([text]) => N.bold([N.text(text)])),
  P.str('*').then(P.regex(/^[a-zA-Z0-9\s]+/)).skip(P.str('*')).map(([text]) => N.italic([N.text(text)])),
  P.str('_').then(P.regex(/^[a-zA-Z0-9\s]+/)).skip(P.str('_')).map(([text]) => N.italic([N.text(text)])),
  P.str('`').then(P.regex(/^[^`\n]+/)).skip(P.str('`')).map(([code]) => N.inlineCode(code)),
  P.str('\\\(').then(P.any.until(P.str('\\\)'))).map(m => N.inlineMath(m.join(''))),
];

