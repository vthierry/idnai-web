const HttpQueryService = require("./HttpQueryService");

/** Implements a mechanism to react to events from the server.
 *
 * - A POST service is attached to the given route.
 * 
 * - This is the server side of a simple [client](./ServerEvent.html)/server mechanism for persistent data.
 *
 * - The local service is attached to an express web mechanism, using a construct of the form:
 *```
 * // Loads required packages
 * const express = require("express");
 * const server = express();
 * const ServerEventService = require("./ServerEventService.js");
 * 
 * // Defines a minimal persistantdata service
 * new ServerEventService(server, "/_serverevent");
 * server.listen(8080);
 *```
 *
 * @param {express} server The express server mechanism.
 * @param {string}  route The route, both :
 *  - The URL route to this service and
 *  - The local root directory path.
 * @param {uint} [wait_interval=10] The waiting interval between scanning the event queue, minimal value is 10.
 *
 * @class
 */
var ServerEventService = function(server, route = "/_serverevent", wait_interval = 200) {
  let self = this;
  /** Implements the event server management query.
   * The even server management queries are:
   * - `action=clear` :
   *   - Purges all pending events.
   */
  const doQuery = function(query, answer) {
    switch (query.action) {
      // Purges the event queue
      case "clear": {
        self.clear();
        answer("");
        break;
      }
      // Sends one event from the queue
      case "call": {
        if (self.queue.length > 0) {
          answer(self.queue.shift());
        } else {
          let wait = setInterval(function() {
            if (self.queue.length > 0) {
              answer(self.queue.shift());
              clearInterval(wait);
            }
          }, Math.max(10, wait_interval));
        }
        break;
      }
      // Adds a clock event
      case "clock": {
        self.addClock(query.period == undefined ? 0 : query.period,
          query.count == undefined ? 0 : query.count);
        answer("");
        break;
      }
    }
  };
  /** Appends an event to the event queue. 
   * @param {string} value The event value, it might be a JSON string.
   */
  this.add = function(value) {
    self.queue.push(value);
  };
  /** Clears the event queue. */
  this.clear = function() {
    self.queue = [];
  };
  this.clear();
  /** Generates a periodic event (mainly for debugging purpose).
   * - The event value writes `$index`, the occurence index, starting from 0.
   * @param {uint} period The clock period in millisecond, 0 to stop the clock.
   * @param {uint} count The maximal number of event, 0 if no bound.
   */
  this.addClock = function(period = 0, count = 0) {
    if (period > 0) {
      stopClock();
      // Starts a new clock
      {
        self.clock_count = count;
        self.clock_function = setInterval(function() {
          if (self.clock_count == 0 || self.clock_index < self.clock_count) {
            self.add("" + (self.clock_index++));
          } else {
            stopClock();
          }
        }, period);
      }
    } else {
      stopClock();
    }
  };
  const stopClock = function() {
    if (self.clock_function != undefined)
      clearInterval(self.clock_function);
    self.clock_function = undefined;
    self.clock_count = 0;
    self.clock_index = 0;
  }
  stopClock();
  // Connects to a Http query service
  new HttpQueryService(server, route, doQuery);
};

module.exports = ServerEventService;
