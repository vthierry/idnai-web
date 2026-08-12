/** Implements a wrapper to C/C++ implemented functions on the server side.
 * 
 * - This is the client side of a simple client/[server](./WrapperCCService.html) C/C++ wrapping mechanism.
 *
 * - The interface is used in HTML page, using a construct of the form:
 *```
 * <script type='text/javascript' src='.../aideweb.js'></script>
 * <script type='text/javascript'>
 *  var ccWrapper = New WrapperCC("http://localhost:8080/_ccwrapper"); 
 *
 *  let result = ccWrapper.call(query);
 *```
 * @param {string} url The service URL.
 * @class
 */
const WrapperCC = function(url) {
  var httpQuery = new HttpQuery(url);
  /** Calls a C/C++ implemented function.
   * @param {string} query The function query, a string of the form `name=value&other_name=other_value`.
   * @param {callback} callback The callback that handles the returned value.
   * - Runs the <tt>callback(value: string)</tt> function called with the returned value.
   *   - The returned value may parse to a JSON string.
   */
  this.call = function(query, callback = function() {}) {
    httpQuery.send(query, callback);
  }
};
