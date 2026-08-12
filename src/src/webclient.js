


  /** Gets a remote JSON file.
   * @param {string} url The JSON file URL. 
   * @param {callback} [callback=function(value){}] The callback that handles the JSON returned value, as a text.
   */
  loadJSON: function(url, callback) {
    let request = new XMLHttpRequest();
    request.onload = function(event) {
      callback(this.responseText);
    }
    request.onerror = function(event) {
      console.log("loadJSON.send XMLHttpRequest error: http-status: '" + request.status + "' url: '" + url + "' event: '");
      console.log(event);
      console.log("'");
    }
    request.overrideMimeType("application/json");
    request.open("GET", url, true);
    request.send(null);
  },
  /** Performs a Javascript HTTP request to dialog with a web service and returns response.
   * @param {string} [url=""] The HTTP URL. 
   *  - An URL of the form `@/$route` stands for `http[s]:/$hostname:$port/$route` considering the current page address.
   * @param {string} [input=""] The URL query or content:
   * - GET method, the URL query, if not empty, it is appended to the URL adding and prefixed with a '?' char, thus input is empty.
   * - POST method, the URL query, a string of the form _name_1=encodeURIComponent(value_1)&name_2=encodeURIComponent(value_2)_, which will be URL encoded.
   * - PUT method, the URL put content, a string of the form _name_1=encodeURIComponent(value_1)&name_2=encodeURIComponent(value_2)_, usually encoded as a JSON string.
   * @param {string} [method ="GET"] Either `GET`, `POST` or `PUT`, i.e. the HTTP method.
   * @param {callback} [callback=function(value){}] The callback that handles the query return value.
   * - Runs the <tt>callback(value: string, error: string)</tt> function with 
   *   - value: the query answer value,
   *   - error: false if no error, else the http.status as a string.
   * - If the server is not running, or if the query is invalid or not implemented, the callback value is the empty string, and information is given in the console of the browser.
   * @return {string} The response value, or an error message, if any.
   */
  wget: function(url = "", input = "", method = "GET", callback) {
    if (url.charAt(0) == '@')
      url = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + url.replace(new RegExp("^@/?"), "/");
    let what = "{http-request method:" + method + " url: " + url + " input: '" + input + "'";
    let request = new XMLHttpRequest();
    request.onload = function(event) {
      if (callback != undefined)
        callback(this.responseText, false);
    };
    request.onerror = function(event) {
      console.log(what + "error http-status: '" + request.status + "' event: '");
      console.log(event);
      console.log("'}");
      if (callback != undefined)
        callback("", "" + request.status);
    }
    request.open(method, url, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.responseType = "text";
    request.send(input);
  },
};



  /** Gets a remote JSON file.
   * @param {string} url The JSON file URL. 
   * @param {callback} [callback=function(value){}] The callback that handles the JSON returned value, as a text.
   */
  loadJSON: function(url, callback) {
    let request = new XMLHttpRequest();
    request.onload = function(event) {
      callback(this.responseText);
    }
    request.onerror = function(event) {
      console.log("loadJSON.send XMLHttpRequest error: http-status: '" + request.status + "' url: '" + url + "' event: '");
      console.log(event);
      console.log("'");
    }
    request.overrideMimeType("application/json");
    request.open("GET", url, true);
    request.send(null);
  },
  /** Performs a Javascript HTTP request to dialog with a web service and returns response.
   * @param {string} [url=""] The HTTP URL. 
   *  - An URL of the form `@/$route` stands for `http[s]:/$hostname:$port/$route` considering the current page address.
   * @param {string} [input=""] The URL query or content:
   * - GET method, the URL query, if not empty, it is appended to the URL adding and prefixed with a '?' char, thus input is empty.
   * - POST method, the URL query, a string of the form _name_1=encodeURIComponent(value_1)&name_2=encodeURIComponent(value_2)_, which will be URL encoded.
   * - PUT method, the URL put content, a string of the form _name_1=encodeURIComponent(value_1)&name_2=encodeURIComponent(value_2)_, usually encoded as a JSON string.
   * @param {string} [method ="GET"] Either `GET`, `POST` or `PUT`, i.e. the HTTP method.
   * @param {callback} [callback=function(value){}] The callback that handles the query return value.
   * - Runs the <tt>callback(value: string, error: string)</tt> function with 
   *   - value: the query answer value,
   *   - error: false if no error, else the http.status as a string.
   * - If the server is not running, or if the query is invalid or not implemented, the callback value is the empty string, and information is given in the console of the browser.
   * @return {string} The response value, or an error message, if any.
   */
  wget: function(url = "", input = "", method = "GET", callback) {
    if (url.charAt(0) == '@')
      url = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + url.replace(new RegExp("^@/?"), "/");
    let what = "{http-request method:" + method + " url: " + url + " input: '" + input + "'";
    let request = new XMLHttpRequest();
    request.onload = function(event) {
      if (callback != undefined)
        callback(this.responseText, false);
    };
    request.onerror = function(event) {
      console.log(what + "error http-status: '" + request.status + "' event: '");
      console.log(event);
      console.log("'}");
      if (callback != undefined)
        callback("", "" + request.status);
    }
    request.open(method, url, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.responseType = "text";
    request.send(input);
  },
};
