class MyPromise {
  constructor(executor) {
    let state = "pending";        // private
    let value = undefined;        // private
    const thenCallbacks = [];
    const catchCallbacks = [];

    const resolve = (val) => {
      queueMicrotask(() => {
        if (state !== "pending") return;
        state = "fulfilled";
        value = val;
        thenCallbacks.forEach(cb => cb(val));
      });
    };

    const reject = (err) => {
      queueMicrotask(() => {
        if (state !== "pending") return;
        state = "rejected";
        value = err;
        catchCallbacks.forEach(cb => cb(err));
      });
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }

    // 외부 노출 API만 정의
    this.then = (onFulfilled) => {
      return new MyPromise((resolveNext, rejectNext) => {
        const handler = (val) => {
          try {
            resolveNext(onFulfilled(val));
          } catch (e) {
            rejectNext(e);
          }
        };

        if (state === "fulfilled") handler(value);
        else if (state === "pending") thenCallbacks.push(handler);
      });
    };

    this.catch = (onRejected) => {
      return new MyPromise((resolveNext, rejectNext) => {
        const handler = (err) => {
          try {
            resolveNext(onRejected(err));
          } catch (e) {
            rejectNext(e);
          }
        };

        if (state === "rejected") handler(value);
        else if (state === "pending") catchCallbacks.push(handler);
      });
    };

    // 외부 변경 완전 차단
    Object.freeze(this);
  }
}
