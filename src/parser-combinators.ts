type Source = {
  text: string,
  offset: number,
};

type Succeed<T> = {
  status: 'succeed',
  value: T,
  length: number,
};

type Failed = {
  status: 'failed',
};

type ParseResult<T> = Succeed<T> | Failed;

export class Parser<T> {
  private parser: (source: Source) => ParseResult<T>;

  constructor(parser: (source: Source) => ParseResult<T>) {
    this.parser = parser;
  }

  parse(source: Source): ParseResult<T> {
    return this.parser(source);
  }

  then<S>(nextParser: Parser<S>): Parser<S> {
    return new Parser(source => {
      const res1 = this.parse(source);
      if (res1.status === 'succeed') {
        const res2 = nextParser.parse({ text: source.text, offset: source.offset + res1.length });
        if (res2.status === 'succeed') {
          return { status: 'succeed', length: res1.length + res2.length, value: res2.value };
        } else {
          return { status: 'failed' };
        }
      } else {
        return { status: 'failed' };
      }
    });
  }

  skip<S>(nextParser: Parser<S>): Parser<T> {
    return new Parser(source => {
      const res1 = this.parse(source);
      if (res1.status === 'succeed') {
        const res2 = nextParser.parse({ text: source.text, offset: source.offset + res1.length });
        if (res2.status === 'succeed') {
          return { status: 'succeed', length: res1.length + res2.length, value: res1.value };
        } else {
          return { status: 'failed' };
        }
      } else {
        return { status: 'failed' };
      }
    });
  }

  nonGreedyMany1<S>(nextParser: Parser<S>): Parser<T[]> {
    return new Parser(({ text, offset }) => {
      const values: T[] = [];
      let length = 0;
      while (offset < text.length) {
        const res1 = this.parse({ text, offset: offset + length });
        if (res1.status === 'succeed') {
          length += res1.length;
          values.push(res1.value);
          const res2 = nextParser.parse({ text, offset: offset + length });
          if (res2.status === 'succeed') {
            length += res2.length;
            return { status: 'succeed', length, value: values };
          }
        } else {
          return { status: 'failed' };
        }
      }
      return { status: 'failed' };
    });
  }

  map<S>(f: (x: T) => S): Parser<S> {
    return new Parser(source => {
      const res = this.parse(source);
      if (res.status === 'succeed') {
        return { status: res.status, length: res.length, value: f(res.value) };
      } else {
        return { status: res.status };
      }
    });
  }
}

export const any: Parser<string> = new Parser(source => {
  return {
    status: 'succeed',
    value: source.text[source.offset],
    length: 1,
  };
});

export function str(s: string): Parser<string> {
  return new Parser(source => {
    if (source.text.substr(source.offset).startsWith(s)) {
      return {
        status: 'succeed',
        value: s,
        length: s.length,
      };
    } else {
      return {
        status: 'failed',
      };
    }
  });
}

export function regex(r: RegExp): Parser<RegExpMatchArray> {
  return new Parser(source => {
    const match = source.text.substr(source.offset).match(r);
    if (match !== null) {
      return {
        status: 'succeed',
        value: match,
        length: match[0].length,
      };
    } else {
      return {
        status: 'failed',
      };
    }
  });
}

export function alt<S>(parsers: Parser<S>[]): Parser<S> {
  return new Parser(source => {
    for (const parser of parsers) {
      const res = parser.parse(source);
      if (res.status === 'succeed') {
        return res;
      }
    }
    return { status: 'failed' };
  });
}

export function seq<S1, S2>(parsers: [Parser<S1>, Parser<S2>]): Parser<[S1, S2]>;
export function seq<S>(parsers: Parser<S>[]): Parser<S[]> {
  return new Parser(({ text, offset }) => {
    const values: S[] = []
    let length = 0;
    for (const parser of parsers) {
      const res = parser.parse({ text, offset: offset + length });
      if (res.status === 'succeed') {
        length += res.length;
        values.push(res.value);
      } else {
        return res;
      }
    }
    return { status: 'succeed', length, value: values };
  });
}

export function lazy<S>(lazyParser: () => Parser<S>): Parser<S> {
  let parser = null;
  return new Parser(source => {
    if (parser === null) parser = lazyParser();
    return parser.parse(source);
  });
}
