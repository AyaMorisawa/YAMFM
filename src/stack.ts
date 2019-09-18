export class Stack<T> {
  private arr: T[] = [];

  push(value: T): void {
    this.arr.push(value);
  }

  pop(): T {
    if (this.empty()) throw 'pop: No such element in stack';
    return this.arr.pop();
  }

  top(): T {
    if (this.empty()) throw 'top: No such element in stack';
    return this.arr[this.arr.length - 1];
  }

  empty(): boolean {
    return this.arr.length === 0;
  }
}
