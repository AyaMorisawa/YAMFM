import * as assert from 'assert';
import { parse } from '../src';

describe('parse', () => {
  it('empty', () => {
    assert.deepStrictEqual(parse(''), {
      type: 'root', children: []
    });
  });

  it('emojiName', () => {
    assert.deepStrictEqual(parse(':heart:'), {
      type: 'root', children: [{ type: 'emojiName', name: 'heart' }]
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

  it('bold asterisk', () => {
    assert.deepStrictEqual(parse('**aa**'), {
      type: 'root', children: [{ type: 'bold', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('bold underscore', () => {
    assert.deepStrictEqual(parse('__aa__'), {
      type: 'root', children: [{ type: 'bold', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('italic asterisk', () => {
    assert.deepStrictEqual(parse('*aa*'), {
      type: 'root', children: [{ type: 'italic', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('italic underscore', () => {
    assert.deepStrictEqual(parse('_aa_'), {
      type: 'root', children: [{ type: 'italic', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('italic xml', () => {
    assert.deepStrictEqual(parse('<i>aa</i>'), {
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

  it('strike', () => {
    assert.deepStrictEqual(parse('~~aa~~'), {
      type: 'root', children: [{ type: 'strike', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('flip', () => {
    assert.deepStrictEqual(parse('<flip>aa</flip>'), {
      type: 'root', children: [{ type: 'flip', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('spin', () => {
    assert.deepStrictEqual(parse('<spin>aa</spin>'), {
      type: 'root', children: [{ type: 'spin', attr: '', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('spin attr', () => {
    assert.deepStrictEqual(parse('<spin left>aa</spin>'), {
      type: 'root', children: [{ type: 'spin', attr: 'left', children: [{ type: 'text', text: 'aa' }] }]
    });
  });

  it('inlineCode', () => {
    assert.deepStrictEqual(parse('`aa`'), {
      type: 'root', children: [{ type: 'inlineCode', code: 'aa' }]
    });
  });

  it('inlineMath', () => {
    assert.deepStrictEqual(parse('\\(a + b\\)'), {
      type: 'root', children: [{ type: 'inlineMath', formula: 'a + b' }]
    });
  });

  it('inlineMath mid-backslash', () => {
    assert.deepStrictEqual(parse('\\(a + b \\ = c\\)'), {
      type: 'root', children: [{ type: 'inlineMath', formula: 'a + b \\ = c' }]
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
