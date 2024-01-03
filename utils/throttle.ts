/**
 * throttle function
 * @param func function to be executed
 * @param delay delay time
 * @example
 * function con() {
 *   console.log(1);
 * }
 * let t = throttle(con, 1000);
 * setInterval(() => {
 *   t();
 * }, 100);
 */
function throttle<A extends any[], R>(
  func: (...args: A) => R,
  delay: number = 1000
): (...args: A) => void {
  /**
   * previous time
   */
  let previous = 0;

  /**
   * timer
   */
  let later = null;

  return function (...args) {
    /**
     * current time
     */
    let now = new Date().getTime();

    if (!previous) previous = now;

    /**
     * remaining time
     */
    let remaining = delay - (now - previous);

    /**
     * context
     */
    let context = this;

    /**
     * execute function
     * @description execute function
     */
    let result = function () {
      previous = new Date().getTime();
      later = null;
      func.apply(context, args);
    };

    /**
     * if remaining time is less than 0 or greater than delay time, execute function
     * else if later is null, set timer
     */
    if (remaining <= 0 || remaining > delay) {
      if (later) {
        clearTimeout(later);
        later = null;
      }
      result();
    } else if (!later) {
      later = setTimeout(result, remaining);
    }
  };
}

export default throttle;
