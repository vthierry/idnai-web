/** Implements the interface with a persistent data mechanism.
 * 
 * - This is the client side of a simple client/[server](./PersistantDataService.html) mechanism.
 *
 * - The interface is used in HTML page, using a construct of the form:
 *```
 * <script type='text/javascript' src='.../aideweb.js'></script>
 * <script type='text/javascript'>
 *
 *  var persistantData = New PersistantData("http://localhost:8080/_persistantData/upload");
 *
 *  // Using, e.g., getNewID
 *  persistantData.getNewID(true, true, "", function(value) { 
 *    console.log("Testing getNewID: " + value);
 *  });
 *```
 * @param {string} url The service URL.
 * @class
 */
const PersistantData = function(url) {
  var httpQuery = new HttpQuery(url);
  /** Loads a structured value from a given filename.
   * @param {string} filename The data file base name without extension.
   * @param {object} default_value The default value stored into the file if it does not yet exists.
   * @param {callback} callback The callback that handles the loaded value.
   * - Runs the <tt>callback(value: object)</tt> function with the loaded or the default value.
   * - If a syntax error occurs, the value is given as a string.
   */
  this.loadJSON = function(filename, default_value, callback = function() {}) {
    httpQuery.send("action=load&file=" + filename + "&format=json&value=" + encodeURIComponent(JSON.stringify(default_value, null, 2)), function(value) {
      try {
        v = JSON.parse(value);
        callback(v);
      } catch (e) {
        callback(value);
      }
    });
  };

  /** Saves a structured value in a given filename.
   * @param {string} filename The data file base name without extension.
   * @param {object} value The value to save as a JSON data structure.
   * @param {boolean} [backup=true] If true, backup the file, with date.
   * @param {callback} callback The callback that handles the next action after saving.
   * - Runs the <tt>callback()</tt> function after the value is saved.
   */
  this.saveJSON = function(filename, value, backup = true, callback = function() {}) {
    httpQuery.send("action=save&file=" + filename + "&format=json&value=" + encodeURIComponent(JSON.stringify(value, null, 2)) + "&backup=" + backup, callback);
  };

  /** Lists all data file names, and runs the callback function for each file name.
   * @param {string} The file format.
   * @param {callback} callback The callback that handles each data file name.
   * - Runs the <tt>callback(value: array(string))</tt> function with the loaded or the default value.
   * - The list of the data file base name without extension is given.
   */
  this.list = function(format = "json", callback = function() {}) {
    httpQuery.send("action=list&format=" + format, function(files) {
      files = files.split("\n");
      for (let i in files) {
        if (files[i] != "") {
          callback(files[i]);
        }
      }
    });
  }

  /** Unlinks a data file moving it in the data/old directory.
   * @param {string} filename The data file base name without extension.
   */
  this.unlink = function(filename) {
      httpQuery.send("action=unlink&file=" + filename);
    },

    /** Returns a new ID built from the date in standard format and optionnally the local machine MAC address.
     * @param {boolean} [when=true] If true, appends the local machine MAC address.
     * @param {boolean} [where=true] If true, appends the local machine MAC address.
     * @param {string}  [suffix=""] If not empty, appends the suffix to the proposed ID.
     * @param {callback} callback The callback that handles the new ID value.
     * - Runs the <tt>callback(value: string)</tt> function with this ID.
     */
    this.getNewID = function(when = true, where = true, suffix = "", callback = function() {}) {
      httpQuery.send("action=newid&when=" + when + "&where=" + where + "&suffix=" + suffix, callback);
    }
};
