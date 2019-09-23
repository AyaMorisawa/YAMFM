type Source = {
  text: string,
  offset: number,
};

export type Succeed<T> = {
  status: 'succeed',
  value: T,
  length: number,
};

function succeed<T>(length: number, value: T): Succeed<T> {
  return { status: 'succeed', value, length };
}

type Failed = {
  status: 'failed',
};

const failed: Failed = { status: 'failed' };

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
          return succeed(res1.length + res2.length, res2.value);
        } else {
          return failed;
        }
      } else {
        return failed;
      }
    });
  }

  skip<S>(nextParser: Parser<S>): Parser<T> {
    return new Parser(source => {
      const res1 = this.parse(source);
      if (res1.status === 'succeed') {
        const res2 = nextParser.parse({ text: source.text, offset: source.offset + res1.length });
        if (res2.status === 'succeed') {
          return succeed(res1.length + res2.length, res1.value);
        } else {
          return failed;
        }
      } else {
        return failed;
      }
    });
  }

  many(): Parser<T[]> {
    return new Parser(({ text, offset }) => {
      const values: T[] = [];
      let length = 0;
      while (offset + length < text.length) {
        const res = this.parse({ text, offset: offset + length });
        if (res.status === 'succeed') {
          length += res.length;
          values.push(res.value);
        } else {
          return succeed(length, values);
        }
      }
      return succeed(length, values);
    });
  }

  nonGreedyMany1<S>(nextParser: Parser<S>): Parser<T[]> {
    return new Parser(({ text, offset }) => {
      const values: T[] = [];
      let length = 0;
      while (offset + length < text.length) {
        const res1 = this.parse({ text, offset: offset + length });
        if (res1.status === 'succeed') {
          length += res1.length;
          values.push(res1.value);
          const res2 = nextParser.parse({ text, offset: offset + length });
          if (res2.status === 'succeed') {
            length += res2.length;
            return succeed(length, values);
          }
        } else {
          return failed;
        }
      }
      return failed;
    });
  }

  map<S>(f: (x: T) => S): Parser<S> {
    return new Parser(source => {
      const res = this.parse(source);
      if (res.status === 'succeed') {
        return succeed(res.length, f(res.value));
      } else {
        return failed;
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
      return succeed(s.length, s);
    } else {
      return failed;
    }
  });
}

export function regex(r: RegExp): Parser<RegExpMatchArray> {
  return new Parser(source => {
    const match = source.text.substr(source.offset).match(r);
    if (match !== null) {
      return succeed(match[0].length, match);
    } else {
      return failed;
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
    return failed;
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
    return succeed(length, values);
  });
}

export function lazy<S>(lazyParser: () => Parser<S>): Parser<S> {
  let parser = null;
  return new Parser(source => {
    if (parser === null) parser = lazyParser();
    return parser.parse(source);
  });
}
