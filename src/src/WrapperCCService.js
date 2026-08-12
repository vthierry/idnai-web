const fs = require("fs");
const bindings = require('bindings');
const HttpQueryService = require("./HttpQueryService");

/** Implements a wrapper to C/C++ implemented functions.
 *
 * - A POST service is attached to the given route.
 * 
 * - This is the server side of a simple [client](./WrapperCC.html)/server  C/C++ wrapping mechanism.
 *
 * - The local service is attached to an express web mechanism, using a construct of the form:
 *```
 * // Loads required packages
 * const express = require("express");
 * const server = express();
 * const CCWrapperService = require("./CCWrapper.js");
 * 
 * // Defines a minimal persistantdata service
 * new WrapperCCService(server, "/_ccwrapper");
 * server.listen(8080);
 *```
 *
 * - The C/C++ wrapping mechanism is implemented vis a unique C [`wrap(query)`](global.html) function, stored in a `wrap.cpp` file in the `./src` directory.
 *
 * @param {express} server      The express server mechanism.
 * @param {string}  route       The route to this service.
 * @param {string}  target_name The wrapper name as defined in `binding.gyp` 
 * ```
 * {
 *   "targets": [{
 *     "target_name": "wrapper",
 * ../..
 * ```
 * @class
 */
var WrapperCCService = function(server, route = "/_ccwrapper", target_name = "wrapper") {
  // Dumps all available info on error
  const errorLog = function(what) {
    console.log("Error in CCWrapperService: the wrapper is " + what);
    onError = what;
  }
  var onError = "";
  // Implements the wrapper if available
  if (fs.existsSync("./build/Release/" + target_name + ".node")) {
    var wrapper = bindings({
      bindings: target_name,
      module_root: process.cwd()
    });
    if (wrapper == undefined)
      errorLog("not loadable");
  } else
    errorLog("not available");
  // Implements the service
  const doQuery = function(query, answer) {
    // Prepares the query to be compatible with C/C++ wrapper string value
    for (let name in query) {
      if (typeof query[name] != "string") {
        query[name] = "" + query[name];
      }
    }
    if (onError == "") {
      answer(wrapper.wrap(query));
    } else {
      answer("{ \"onError\": \"wrapper " + onError + "\", \"query\": \"" + JSON.stringify(query) + "\" }");
    }
  };
  // Connects to a Http query service
  new HttpQueryService(server, route, doQuery);
};

module.exports = WrapperCCService;
