function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i], 10)
    const num2 = parseInt(v2[i], 10)

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

/**
 * 防抖函数，延迟执行某个回调
 * @param func    回调函数
 * @param delay    延迟时间
 * @param immediate    是否立即执行
 * @returns {Function}
 */
function debounce(func, delay, immediate) {
  let timer;
  // 返回一个函数，这个函数会在一个时间区间结束后的 delay 毫秒时执行 fn 函数
  return () => {
    // 保存函数调用时的上下文和参数，传递给 fn
    const context = this,
      args = arguments;
    const later = () => {
      timer = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timer;
    // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
    clearTimeout(timer);
    // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
    // 再过 delay 毫秒就执行 fn
    timer = setTimeout(later, delay);
    if (callNow)
      func.apply(context, args);
  };
}

/**
 * 节流函数，使用设定的频率执行回调函数，降低频繁事件回调的执行次数。
 * 注：可使用requestAnimationFrame()原生函数实现。
 * @param fn {Function}   实际要执行的函数
 * @param threshold {Number}  执行间隔，单位是毫秒（ms）
 * @return {Function}     返回一个“节流”函数
 */
function throttle(fn, threshold) {
  // 记录上次执行的时间
  let last;
  // 定时器
  let timer;
  // 默认间隔为 250ms
  threshold || (threshold = 250);
  // 返回的函数，每过 threshold 毫秒就执行一次 fn 函数
  return () => {
    // 保存函数调用时的上下文和参数，传递给 fn
    const context = this;
    const args = arguments;
    const now = (new Date()).getTime();
    // 如果距离上次执行 fn 函数的时间小于 threshhold，那么就放弃
    // 执行 fn，并重新计时
    if (last && now < last + threshold) {
      clearTimeout(timer);
      // 保证在当前时间区间结束后，再执行一次 fn
      timer = setTimeout(function() {
        last = now;
        fn.apply(context, args)
      }, threshold);
      // 在时间区间的最开始和到达指定间隔的时候执行一次 fn
    } else {
      last = now;
      fn.apply(context, args)
    }
  }
}

module.exports = {
  compareVersion,
  debounce,
  throttle,
}