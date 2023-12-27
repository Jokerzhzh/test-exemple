/**
 * debounce function
 * @param func function to be executed
 * @param delay delay time
 * @param immediate immediate
 * @example
 * let count = 0;
 * const de = debounce(() => {
 *   console.log("hello");
 * });
 * const inter = setInterval(() => {
 *   de();
 *   count++;
 *   if (count === 10) {
 *     clearInterval(inter);
 *   }
 * }, 100);
 */
function debounce(
  func: (...args: any[]) => void,
  delay = 1000,
  immediate = false
) {
  /**
   * timer
   */
  let timeoutId: NodeJS.Timeout | null = null;

  /**
   * last function arguments
   */
  let lastArgs: any[];

  /**
   * context
   */
  let content: any;

  /**
   * @description set timeoutId to null and execute function
   */
  const exec = () => {
    if (!immediate) {
      func.apply(content, lastArgs);
    }
    timeoutId = null;
  };

  return function (...args: any[]) {
    context = this;
    lastArgs = args;

    /**
     * callNow is true if immediate is true and timeoutId is null
     */
    const callNow = immediate && !timeoutId;

    /**
     * if timeoutId is not null, clear timeout
     * set timeoutId to setTimeout
     */
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(exec, delay);

    /**
     * if callNow is true, execute function immediately
     */
    if (callNow) func.apply(context, lastArgs);
  };
}

export default debounce;
