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

const _primitiveType = false ? (null as N.PrimitiveNode).type : null;

type Primitive = <R>(cont: <S>(t: T.Primitive<typeof _primitiveType, N.MfmNode, S>) => R) => R

export const primitives: Primitive[] = [
  T.primitive('bold', P.regex(/^__([a-zA-Z0-9\s]+?)__/), (partialNode, [, text]) => {
    return Object.assign({}, partialNode, { children: [N.text(text)] });
  }),
  T.primitive('italic', P.regex(/^\*([a-zA-Z0-9\s]+?)\*/), (partialNode, [, text]) => {
    return Object.assign({}, partialNode, { children: [N.text(text)] });
  }),
  T.primitive('italic', P.regex(/^_([a-zA-Z0-9\s]+?)_/), (partialNode, [, text]) => {
    return Object.assign({}, partialNode, { children: [N.text(text)] });
  }),
  T.primitive('inlineCode', P.regex(/^`([^`\n]+?)`/), (partialNode, [, code]) => {
    return Object.assign({}, partialNode, { code });
  }),
  T.primitive('inlineMath', P.regex(/^\\\((.+?)\\\)/), (partialNode, [, formula]) => {
    return Object.assign({}, partialNode, { formula });
  }),
];
