const fs = require("fs");
const os = require("os");
const exec = require("child_process").execSync;
const HttpQueryService = require("./HttpQueryService");

/** Implements a persistent data mechanism.
 * 
 * - A POST service is attached to the given route.
 *
 * - This is the server side of a simple [client](./PersistantData.html)/server mechanism for persistent data.
 *
 * - The local service is attached to an express web mechanism, using a construct of the form:
 *```
 * // Loads required packages
 * const express = require("express");
 * const server = express();
 * const PersistantDataService = require("./PersistantDataService.js");
 * 
 * // Defines a minimal persistantData service
 * new PersistantDataService(server, "/_persitantData/upload");
 * server.listen(8080);
 *```
 *
 * @param {express} server The express server mechanism.
 * @param {string}  route   The route, both :
 *  - The URL route to this service and
 *  - The local root directory path.
 *
 * @class
 */
var PersistantDataService = function(server, route = "/_persitantData/upload") {
  /** Implements the date file management query.
   * The data file management queries are:
   * - `action=list[&format=json]` :
   *   - Returns the data file base names list, separated `\n`.
   * - `action=load&file=data-file-base-name-without-extension[&format=json]&value=default-value` :
   *   - Loads a file with a default-value if the file does not exists.
   * - `action=save&file=data-file-base-name-without-extension[&format=json]&value=value&backup=true-or-false` :
   *   - Saves a value in a text file, with a git backup possibility.
   * - `action=unlink&file=data-file-base-name-without-extension` :
   *   - Moves a data in the _./trash_ directory.
   * - `action=newid&where=true-or-false&when=true-or-false&suffix=suffix-string` :
   *   - Returns new file ID built from : (i) the date in standard format, if when is true, (ii) the machine MAC address, if where is true, (iii) a suffix is not empty.
   * @param {map<string,string>} query The HTTP query, as a structured `map<string,string>` object already parsed.
   * @return {string} The query response.
   */
  const getQuery = function(query) {
    switch (query.action) {
      // Lists the date files
      case "list": {
        // Scans the data directory.
        let files = fs.readdirSync(this.directory);
        // Adds each json file to the output.
        let value = "";
        const pattern = new RegExp("^(.*)\." + (query.format == undefined ? "json" : query.format) + "$");
        for (let i in files) {
          if (files[i].match(pattern)) {
            value += (value == "" ? "" : "\n") + files[i].replace(pattern, "$1");
          }
        }
        return value;
      }
      // Returns a unique ID to name a new file
      case "newid": {
        return getNewId(query.when != "false", query.where != "false", query.suffix);
      }
      default: {
        if (query.file != undefined) {
          query.filename = query.file + "." + (query.format == undefined ? "json" : query.format);
          query.path = this.directory + "/" + query.filename;
          switch (query.action) {
            // Saves a value in a file.
            case "save": {
              if (query.value != undefined) {
                // Backups the file in the trash with newid extension
                if ((query.backup == "true") && fs.existsSync(query.path)) {
                  getQuery(this.directory, {
                    "action": "unlink",
                    "path": query.path
                  });
                }
                // Saves the file
                fs.writeFileSync(query.path, query.value);
              }
              return "";
            }
            // Loads a value from a file.
            case "load": {
              // Creates the file and store the default value if needed.
              if (!fs.existsSync(query.path)) {
                fs.writeFileSync(query.path, query.value);
              }
              // Returns the file contents.
              return fs.readFileSync(query.path);
            }
            // Deletes a file moving it in the trash directory
            case "unlink": {
              if (fs.existsSync(query.path)) {
                exec("mv " + query.path + " " + this.directory + "/trash/" + query.filename + "." +
                  getQuery({
                    "action": "newid",
                    "where": "true"
                  }));
              }
              return "";
            }
          }
        }
      }
    }
  };
  // Creates the upload directory if not yet done
  const uploadDirectoryCheck = function(route) {
    this.directory = route.replace(new RegExp("^/*"), "");
    if (!this.started) {
      if (!fs.existsSync(this.directory)) {
        fs.mkdirSync(this.directory + "/trash/", {
          recursive: true
        });
      }
      this.started = true;
    }
  };
  uploadDirectoryCheck(route);
  var started, directory;
  /** Returns a new unique ID
   * @param when If true 
   * - adds the current date and time in `YYYY-MM-DDThh:mm:ss:msec` standard format, 
   * - otherwise generates a unique integer for the given machine.
   * @param where If true adds the current machine MAC as localisation.
   * @param suffix If defined, adds a suffix to the ID.
   * @return The constructed ID.
   * @static
   */
  const getNewId = function(when = true, where = false, suffix = "") {
    // Gets a unique ID for this machine
    const getUniqueID = function() {
      // Returns the number of milliseconds elapsed since January 1970 00:00:00 UTC or more if already used
      let id = Math.max(Date.now(), lastID + 1);
      return lastID = id;
    };
    var lastID = 0;
    // Gets the date in a standard format
    const getNow = function() {
      const i2s = function(value, digit = 2) {
        return (digit == 3 ? (value < 100 ? (value < 10 ? "00" : "0") : "") : (value < 10 ? "0" : "")) + value;
      }
      let now = new Date();
      return now.getFullYear() + "-" + i2s(1 + now.getMonth()) + "-" + i2s(now.getDate()) +
        "T" + i2s(now.getHours()) + ":" + i2s(now.getMinutes()) + ":" + i2s(now.getSeconds()) +
        ":" + i2s(now.getMilliseconds(), 3);
    };
    // Gets the 1st computer MAC adress.
    const getMacAdress = function() {
      let networks = os.networkInterfaces();
      for (let i in networks) {
        for (let j in networks[i]) {
          if (networks[i][j]["mac"] != "00:00:00:00:00:00") {
            return networks[i][j]["mac"];
          }
        }
      }
    };
    // Concatenates and return
    return (when ? getNow() : getUniqueID()) + (where ? "@" + getMacAdress() : "") + (suffix == undefined || suffix != "" ? "+" + suffix : "");
  };
  // Connects to a Http query service
  new HttpQueryService(server, route, function(input, answer) {
    answer(getQuery(input));
  });
};

module.exports = PersistantDataService;
