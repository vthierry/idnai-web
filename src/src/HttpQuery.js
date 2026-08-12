/** Low-level HTTP POST query interface with the server service.
 * 
 * - This is the client side of a simple client/[server](./HttpQueryService.html) service mechanism.
 * 
 * @param {string} url The server URL, including the service port. 
 * @class
 */
const HttpQuery = function(url) {
  let self = this;
  /** Returns the server response, if activated.
   * @param {string} query The server query as a string, of the form `name=value&...`.
   * @param {callback} [callback=function(value){}] The callback that handles the query return value.
   * - Runs the <tt>callback(value: string)</tt> function with the query answer.
   * - If the server is not running, a JavaScript alert is raised to ask the user to run it.
   * - If the query is invalid or not implemented, the callback value is the empty string, without any further information.
   * @param {unit} timeout The query timeout in millisecond, 0 means no timeout.
   * - When timeout is triggered the callback is called with the `{ "timeout": true }` value.
   * - Timeout is not considered as an error.
   */
  this.send = function(query = "", callback = function(value) {}, timeout = 0) {
    this.lastQuery = query;
    let request = new XMLHttpRequest();
    request.onload = function(event) {
      noError = true;
      callback(this.responseText);
    };
    request.ontimeout = function(event) {
      callback("{ \"timeout\": true }");
    };
    request.onerror = function(event) {
      reportError(request, event);
    }
    request.open("POST", url, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.responseType = "text";
    request.timeout = timeout;
    request.send(query);
  };
  var reportError = function(request, event) {
    if (self.noError) {
      // Shows this message at the 1st error occurence
      alert("Upps : you must run the persistentdata service on '" + url + "' to gain the web service");
      self.noError = false;
    }
    console.log("HttpQuery.send XMLHttpRequest error: http-status = '" + request.status + "' when querying: '" + this.lastQuery + "'");
    console.log(event);
  };
  /* Indicates if there is no error after the last call. */
  this.lastQuery = undefined;
  this.noError = true;
};
