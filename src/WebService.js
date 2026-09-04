
const http = require('http');
const url = require('url');
const querystring = require('querystring');

/** Implements a web service.
 * - In this context, the request processing is sequential.
 * - This service either:
 *   - renders an HTML web page or
 *   - responses to a web-service request.
 * - This service:
 *   - is not to be used to render a whole web site, the [http-server](https://www.npmjs.com/package/http-server) is to be used instead;
 *   - is as closed as possible to the Arduino/ESP32 adnai-esp32 API, to simplify code development.
 * @class
 */
class WebService {
  handlers = {};
  /** Implements a transaction.
   *  - This is used by a service handler.
   * @memberof WebService
   * @class
   */
  class Transaction {
    let parameters = null, response = null;
    constructor(parameterstring, response) {
      this->parameters = querystring.parse(parameterstring);
      this->response = response;
    }
    /** Gets a parameter value of the current request.
     * @param {string} name The parameter name.
     * - The `now` name corresponds to the current date and time in ISO format, on the service side, unless defined by the client
     * @return {string} The parameter value, or the empty string if undefined.
     */
    get(name) {
      return name in parameters ? parameters[name] : name == "now" ? Date.now().toISOString() : "";
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
      response.writeHead(ok ? (message.length > 0 ? 200 : 204) : 400,
			 { 'Content-Type': h == '<' ? 'text/html' : h == '{' ? 'application/json': 'text/plain' });
      response.end(message);
    }
  };
  const server = http.createServer((request, response) => {
    let url = url.parse(request.url, true);
    let route = url.pathname.replace("^[/]*([^/]*)[/]*$", "$1");
    if (route in handlers) {
      if (request.method == "GET") {
	this->handlers[route](new Transaction(url.search, response));
      } else if (request.method === "POST") {
        let body = '';
        request.on("data", chunk => {
          body += chunk.toString();
        });
        request.on("end", () => {
	  this->handlers[route](new Transaction(body, response));
	});
      } else {
	response.writeHead(405);
	response.end();
      }
    } else {
      response.writeHead(404);
      response.end();
    }
  });
  /** Attachs a handler to a web service route.
   * @param {string} route The path defining the service, e.g., "/action".
   * - It accepts both GET or POST requests.
   * @param {callback} handler. A `handler(transaction) method implementing the service.
   * - It uses the `transaction.get(name)` method to get argument's value.
   * - The handler MUST conclude with a call to the `transaction.answer(ok, message)` function in order to send the response message.
   */
  on: function(route, handler) {
    route = route.replace("^[/]*([^/]*)[/]*$", "$1");
    handlers[route] = hanler;
  }
  /** Begins the service, after all handles are defined.
   * - The service stops at the end of the program execution.
   * @param {uint} [port=8080] The port to listen.
   */
  begin(port = 8080) {
    server.listen(port);
  }
};

module.exports = WebService;
