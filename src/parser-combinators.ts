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

export type Parser<T> = (source: Source) => ParseResult<T>;

export function str(s: string): Parser<string> {
  return (source: Source) => {
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
  };
}

export function regex(r: RegExp): Parser<RegExpMatchArray> {
  return (source: Source) => {
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
  };
}
