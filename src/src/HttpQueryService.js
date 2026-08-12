const express = require("express");

/** Implements a HTTP POST query interface for a server service.
 * 
 * - A POST service is attached to the given route.
 * 
 * - This is the server side of a simple [client](./HttpQuery.html)/server service mechanism.
 *
 * @param {express} server The express server mechanism.
 * @param {string} route  The service route.
 * @param {callback} do_query A <tt>do_query(query: object, answer(response: string))</tt> implementing the service.
 *  - Recieves the query parameters as input, as an `{ name: value, ...}` object.
 *  - Calls `answer(response)` to return the response as a string.
 * @class
 */
const HttpQueryService = function(server, route, do_query) {
  if (!HttpQueryService_initialized) {
    // Decodes POST body with Content-Type: application/x-www-form-urlencoded
    {
      server.use(express.json());
      server.use(express.urlencoded({
        extended: true
      }));
    }
    // Allows any client to connect
    server.use(function(request, response, next) {
      response.setHeader("Access-Control-Allow-Origin", "*");
      next();
    });
    HttpQueryService_initialized = true;
  }
  server.post((route.startsWith("/") ? "" : "/") + route, function(request, response) {
    // console.log(request.headers); console.log(request.body);
    do_query(request.body, function(output) {
      response.send(output);
    });
  });
};

var HttpQueryService_initialized = false;

module.exports = HttpQueryService;
