const express = require("express");
const process = require("process");

/** Implements a programmatically stop of the server
 * 
 * - A POST service is attached to the given route.
 *
 * - When a post is sent on the given route, the whole server program stops.
 *
 * @param {express} server The express server mechanism.
 * @param {string} route  The service route.
 * @class
 */
const StopService = function(server, route = "/stop") {
  server.post(route, function(request, response) {
    setTimeout(function() {
      process.exit(0);
    }, 500);
    response.send("");
  });
};

module.exports = StopService;
