/** Implements Javascript mechanisms to dialog with a connected object via a web page.
 * 
 * - In order to use these functionnalities, use a construct of the form:
 * ```
 * <html>
 *  <head>
 *    <script type='text/javascript' src='https://vthierry.github.io/idnai-web/webcontrols.js'></script>
 *    <script type='text/javascript' src='https://vthierry.github.io/idnai-web/fetchService.js'></script>
 *    <link rel='stylesheet' href='https://vthierry.github.io/idnai-web/webcontrols.css'/> <!-- … or any other style sheet -->
 *  </head>
 *  <body style='width:800px'>
 *   <!-- page content -->
 *  </body>
 * </html>
 * ```
 * - A predefined style allows to define a button and other controls bar:
 * ```
 * <div class='button-bar'><script>
 *   addButton(…);
 *   …/…
 * </script></div>
 * ```
 *
 * @class
 */
const webcontrols = {
  /** Creates a button to trigger an action.
   * @param {string} id A unique ID to index the HTML element.
   * @param {object} options Optional options, 
   * defining the element on and off text and [color](https://www.w3schools.com/cssref/css_colors.asp), and optional CSS style directives:
   * ``` 
   * {
   *   text: "GO",
   *   color: "blue",
   *   style: ""
   * }
   * ```
   * @param {callback} callback A `callback(on_else_off)` function called when the button is clicked.
   */
  addButton: function(id, options = {}, callback = function() {}) {
    options = Object.assign({
      text: "GO",
      color: "blue",
    }, options);
    document.write("<button id='" + id + "' style='" + options.style + "'></button>");
    button.addEventListener("click", function(event) {
      callback();
    });
  },
  /** Creates a button which is alternatively on and off.
   * @param {string} id A unique ID to index the HTML element.
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
   * @param {string} id A unique ID to index the HTML element.
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
   */
  addConsole: function() {
    document.write("<div id='console' class='console'></div><button title='Clears the console' onclick='webcontrols.consoleClear()' style='float:right;font-size:18;margin-right:10px'>Clear</button><div style='height:5px;clear:both'></div>");
  },
  /** Prints a message in the console.
   * @param {string} text The message string, without HTML tag, a newline is added.
   */
  consoleLog: function(text) {
    let element = document.getElementById("console");
    element.innerHTML += "<pre>" + text + "</pre>";
    element.scrollTop = element.scrollHeight;
  },
  /** Clears the text in the console.
   */
  consoleClear: function() {
    document.getElementById("console").innerHTML = "";
  }
};
