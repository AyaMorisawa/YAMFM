import * as assert from 'assert';
import { parse } from '../src/parse';

describe('parse', () => {
  it('empty', () => {
    assert.deepStrictEqual(parse(''), {
      type: 'root', children: []
    });
  });

  it('text', () => {
    assert.deepStrictEqual(parse('aa'), {
      type: 'root', children: [{ type: 'text', text: 'aa' }]
    });
  });

  it('jump', () => {
    assert.deepStrictEqual(parse('<jump>aa</jump>'), {
      type: 'root', children: [{ type: 'jump', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('big', () => {
    assert.deepStrictEqual(parse('***aa***'), {
      type: 'root', children: [{ type: 'big', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('bold', () => {
    assert.deepStrictEqual(parse('**aa**'), {
      type: 'root', children: [{ type: 'bold', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('italic', () => {
    assert.deepStrictEqual(parse('*aa*'), {
      type: 'root', children: [{ type: 'italic', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('small', () => {
    assert.deepStrictEqual(parse('<small>aa</small>'), {
      type: 'root', children: [{ type: 'small', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('motion parens', () => {
    assert.deepStrictEqual(parse('(((aa)))'), {
      type: 'root', children: [{ type: 'motion', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('motion xml', () => {
    assert.deepStrictEqual(parse('<motion>aa</motion>'), {
      type: 'root', children: [{ type: 'motion', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('nested', () => {
    assert.deepStrictEqual(parse('aa<jump>bb<jump>cc</jump>dd</jump>ee'), {
      type: 'root', children: [
        { type: 'text', text: 'aa' },
        {
          type: 'jump', children: [
            { type: 'text', text: 'bb' },
            {
              type: 'jump', children: [
                { type: 'text', text: 'cc' }
              ]
            },
            { type: 'text', text: 'dd' }
          ]
        },
        { type: 'text', text: 'ee' },
      ]
    });
  });

  it('parallel', () => {
    assert.deepStrictEqual(parse('aa<jump>bb</jump>cc<jump>dd</jump>ee'), {
      type: 'root', children: [
        { type: 'text', text: 'aa' },
        {
          type: 'jump', children: [
            { type: 'text', text: 'bb' }
          ]
        },
        { type: 'text', text: 'cc' },
        {
          type: 'jump', children: [
            { type: 'text', text: 'dd' }
          ]
        },
        { type: 'text', text: 'ee' },
      ]
    });
  });

  it('nested + parallel', () => {
    assert.deepStrictEqual(parse('aa<jump>bb<jump>cc</jump>dd</jump>ee<jump>ff</jump>gg'), {
      type: 'root', children: [
        { type: 'text', text: 'aa' },
        {
          type: 'jump', children: [
            { type: 'text', text: 'bb' },
            {
              type: 'jump', children: [
                { type: 'text', text: 'cc' }
              ]
            },
            { type: 'text', text: 'dd' },
          ]
        },
        { type: 'text', text: 'ee' },
        {
          type: 'jump', children: [
            { type: 'text', text: 'ff' }
          ]
        },
        { type: 'text', text: 'gg' },
      ]
    });
  });
});
