function fibonacci(n) {
  if (n === 1 || n === 2) {
    return 1;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

/**
 * 让主线程卡住
 */
export const makeMainThreadBusy = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      console.time('主线程耗时计算操作：fibonacci');
      fibonacci(40);
      console.timeEnd('主线程耗时计算操作：fibonacci');
    });
  });
}

/**
 * 模拟主线程5s内，间隔卡住
 */
export function mockMainThreadBusy() {
  let i = 0;
  let timer = null;
  timer = setInterval(() => {
    if (i >= 5000) {
      clearInterval(timer);
      return;
    }
    i += 500;
    console.time('主线程耗时计算操作：fibonacci');
    fibonacci(38);
    console.timeEnd('主线程耗时计算操作：fibonacci');
  }, 500);
}
