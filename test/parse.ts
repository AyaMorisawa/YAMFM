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
  })

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
