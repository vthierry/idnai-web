/** Implements Javascript mechanisms to dialog with a connected object via a web page.
 * 
 * - In order to use these functionnalities, use a construct of the form:
 * ```
 * <html>
 *  <head>
 *   <!-- page title and others head elements -->
 *    <link rel='stylesheet' href='https://line.gitlabpages.inria.fr/aide-group/esp32gpiocontrol/webcontrols.css'/>
 *    <script type='text/javascript' src='https://line.gitlabpages.inria.fr/aide-group/esp32gpiocontrol/webcontrols.js'></script>
 *  </head>
 *  <body style='width:800px'>
 *   <!-- page content -->
 *  </body>
 * </html>
 * ```
 * 
 * - To add a control button in this framewrok, simply introduce a construct of the form, adjusting the style at will:
 * ```    
 * <div class='button-ba'>
 *   <button onclick='doButton(this)' style='background-color:yellow'>Do it</button>
 *   <!-- other buttons -->
 * </div>
 * ```
 *
 * - Examples of usage are given [here]() and [there]().
 *
 * @class
 */
const webcontrols = {
  /** Creates a button which is alternatively on and off.
   * @param {string} id A unique ID to index the HTML element
   * @param {object} options Optional options, 
   * defining the element on and off text and [color](https://www.w3schools.com/cssref/css_colors.asp), and optional CSS style directives:
   * ``` 
   * {
   *   on_text: "ON",
   *   off_text: "OFF",
   *   on_color: "red",
   *   off_color: "lightgreen",
   *   style: ""
   * }
   * ```
   * @param {callback} callback A `callback(on_else_off)` function called when the button is clicked.
   */
  addButtonOnOff: function(id, options = {}, callback = function(on_else_off) {}) {
    options = Object.assign({
      on_text: "ON",
      off_text: "OFF",
      on_color: "red",
      off_color: "lightgreen"
    }, options);
    document.write("<button id='" + id + "' style='" + options.style + "'></button>");
    let button = document.getElementById(id);
    button.addEventListener("click", function(event) {
      let on_else_off = button.textContent == options.on_text;
      button.textContent = on_else_off ? options.off_text : options.on_text;
      button.style.backgroundColor = on_else_off ? options.off_color : options.on_color;
      callback(on_else_off);
    });
    button.textContent = options.on_text;
    button.style.backgroundColor = options.on_color;
  },
  /** Creates a button to input a numerical value.
   * @param {string} id A unique ID to index the HTML element
   * @param {object} options Optional options, 
   * defining the element value minimal, maximal and initial default value, the text input number of chars, the slider width in pixel, and optional CSS style directives:
   * ``` 
   * {
   *   min: 0,
   *   max: 100,
   *   default: 50, 
   *   size: 4,
   *   width: 200,
   *   style: ""
   * }
   * ```
   * @param {callback} callback A `callback(value)` function called when the value is changed.
   * - A global variable is also assigned with value, its name corresponds to the ID in lowercase with '_' for any non-letter, e.g., "My value" writes "my_value".
   */
  addButtonRange: function(id, options, callback = function(value) {}) {
    let var_name = id.toLowerCase().replace(/\W/g, '_');
    options = Object.assign({
      min: 0,
      max: 100,
      size: 4,
      width: 200
    }, options);
    options = Object.assign({
      default: (options.min + options.max) / 2
    }, options);
    document.write("<span id='" + id + "' class='range' style='" + options.style + "'><label for='" + id + "-label' style='padding:5px;margin:10px 0 10px 0'>" + id + "</label><input id='" + id + "-range' type='range' min='" + options.min + "' max='" + options.max + "' class='slider' style='width:" + options.width + "px'><input id='" + id + "-text' type='text' size='" + options.size + "' style='height:28px;text-align:right;font-size:18px;background-color:whitesmoke'/></span>");
    let range = document.getElementById(id + "-range");
    let text = document.getElementById(id + "-text");
    text.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
        range.value = text.value;
        callback(window[var_name] = text.value = range.value);
      }
    });
    range.addEventListener("change", function(event) {
      callback(window[var_name] = text.value = range.value);
    });
    window[var_name] = text.value = range.value = options.default;
  },
  /** Adds a textual console to print some log information. 
   * - It is inserted in the HTML using a construct of the form:
   * ```
   * <script>webcontrols.addConsole();</script>
   * ```
   *
   * - The `webcontrols.consoleLog(string)` and `webcontrols.consoleClear()` functions allows to use the console.
   * @param {boolean} verbose If true the curl function outputs a message before and after the call.
   */
  addConsole: function(verbose = false) {
    webcontrols.verbose = verbose;
    document.write("<div id='console' class='console'></div><button id='verbose-button' title='' onclick='webcontrols.verboseMode(true)' style='float:left;font-size:18;margin-right:10px'>Verbose</button><button title='Clears the console' onclick='webcontrols.consoleClear()' style='float:right;font-size:18;margin-right:10px'>Clear</button><div style='height:5px;clear:both'></div>");
    webcontrols.verboseMode(false);
  },
  verboseMode: function(change) {
    if (change)
      webcontrols.verbose = !webcontrols.verbose;
    if (webcontrols.verbose) {
      document.getElementById("verbose-button").title = "Desactivate verbose mode";
      document.getElementById("verbose-button").innerHTML = "Verbose is on";
    } else {
      document.getElementById("verbose-button").title = "Activate verbose mode";
      document.getElementById("verbose-button").innerHTML = "Verbose is off";
    }
  },
  /** Prints a message in the console.
   * @param {string} text The message string, without HTML tag, a newline is added.
   */
  consoleLog: function(text) {
    let element = document.getElementById("console");
    element.innerHTML += "<pre>" + text + "</pre>";
    element.scrollTop = element.scrollHeight;
  },
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
  /** Clears the text in the console.
   */
  consoleClear: function() {
    document.getElementById("console").innerHTML = "";
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
  curl: function(url = "", input = "", method = "GET", callback) {
    if (url.charAt(0) == '@')
      url = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + url.replace(new RegExp("^@/?"), "/");
    let what = "{http-request method:" + method + " url: " + url + " input: '" + input + "'";
    let request = new XMLHttpRequest();
    request.onload = function(event) {
      if (webcontrols.verbose)
        webcontrols.consoleLog(what + " response: '" + this.responseText + "' }");
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
  /** Defines if the curl call is verbose.
   * - If true output a message in the `<div id='console' ...` before and after the call.
   */
  verbose: false
};
