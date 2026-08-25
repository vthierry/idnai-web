
const express = require('express');
const arp = require('node-arp');
const Queue = require('Queue');

/** Implements a web service.
 * - In this context, the request processing is sequential.
 * - This service either:
 *   - renders a unique HTML web page or
 *   - responses to a web-service request
 * - This service:
 *   - is not to be used to render a whole web site, the [http-server](https://www.npmjs.com/package/http-server) is to be used instead;
 *   - is as closed as possible to the Arduino/ESP32 adnai-esp32 API, to simplify code development.
 * @param {uint} [overflow=1024] The maximal number of simultaneous requests, bounded to avoid deny-of-service attacks.
 * @class
 */
class WebService {
  let app = express();
  let queue = new Queue();
  let port;
  constructor(overflow = 1024) {
    this.port = port;
    app.use(express.urlencoded({ extended: true }));
    queue.setMaximalSize(overflow);
  }
  /** Attachs a handler to a web service route.
   * @param {string} route The path defining the service, e.g., "/action".
   * - It accepts both GET or POST requests.
   * @param {callback} handler. A parameter less method implementing the service.
   * - It uses the `get(name)` method to get argument's value.
   * - The handler MUST conclude with a call to the `answer(ok, message)` function in order to send the response message.
   */
  on(route, handler) {
    let callback = (request, response) => {
      queue.push({
	"handler": handler;
	"request": request;
	"response": response;
      });
      if (queue.size == 1) {
	handler();
      }
    };
    app.all(route, callback);
  }
  /** Gets a parameter value of the current request.
   * @param {string} name The parameter name.
   * - The `now` name corresponds to the current date and time in ISO format, on the service side, unless defined by the client
   * @return {string} The parameter value, or the empty string if undefined.
   */
  get(name) {
    return name in queue.front().request.arg ? queue.front().request.args[name] : name == "now" ? Date.now().toISOString() : "";
  }
  /** Answers to a HTTP post request by a JSON message.
   * @param {bool} ok If true answer ok (code 200, or 204 if no message) else error (code 400).
   * @param {string} message The message is:
   * - A JSON data structure if starting with '{'.
   * - A HTML page if starting with '<'.
   * - No message if equal to "".
   * - A textual string otherwise.
   */
  answer(ok, message) {
    let h = message.trim()[0];
    queue.pull().response
      .append("Access-Control-Allow-Origin", "*")
      .append("Access-Control-Allow-Methods", "GET, POST")
      .status(ok ? (message.length > 0 ? 200 : 204) : 400)
      .type(h == '<' ? "text/html" : h == '{' ? "application/json": "text/plain")
      .send(message);
    if (queue.size > 0) {
      queue.front().handler();
    }
   }
  /** Begins the service, after all handles are defined.
   * - The service stops at the end of the program execution.
   * @param {uint} [port=8080] The port to listen.
   */
  begin(port = 8080) {
    app.listen(port);
  }
  /** Gets the handler request for derived services.
   * @return The [request](https://expressjs.com/en/5x/api/request).
   */
  getRequest() {
    return queue.front().request;
  }
  /** Checks if the client has a given MAC address.
   * - This allows to secure the service, limiting access to a unique machine.
   * - It is used in a construct of the form:
   * ```
   * on(route, () => {
   *   checkMAC(mac, () => {
   *     // Handler implementation.
   *   });
   * });
   * ```
   * @param {string} mac The expected MAC address.
   * @param {callback} handler The secured handler.
   */
  checkMAC(mac, handler) {
    let ip = getRequest().ip;
    arp.getMAC(ip, function(err, mac_) {
      if (err) {
	this.answer(false, "Unable to check the client MAC address of IP '" + ip "'");
      } else if (mac != mac_) {
	this.answer(false, "The IP '" + ip "' is not allowed to use the requested service");
      } else {
	handler();
      }
    });
  }
}

module.exports = WebService;
