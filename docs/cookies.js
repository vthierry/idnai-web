/** Browser side cookie interface.
 * - This provides small data persistent storage.
 * @class
 */
const cookies = {
  /** Gets a cookie value for the current domain.
   * @param {string} name The cookie name.
   * @return {string} The cookie value.
   * @static
   */
  get: function(name) {
    if (typeof document !== 'undefined') {
      let cookie = document.cookie.split("; ").find(row => row.startsWith(name + "="));
      return cookie == undefined ? undefined : cookie.split("=")[1];
    }
  },

  /** Sets a cookie value for the current domain.
   * @param {string} name The cookie name.
   * @param {string} value The cookie value.
   * @static
   */
  set: function(name, value) {
    if (typeof document == 'undefined') {
      console.log("cookies.set: undefined document");
    } else if (document.URL.match(new RegExp("^file:/"))) {
      console.log("cookies.set: cookies do not work on 'file:/'");
    } else {
      document.cookie = name + "=" + value + "; SameSite=None; Secure;"
    }
  }
}
