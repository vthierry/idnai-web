
/** Implements a web service query.
 * - In C/C++ or JavaScript/nodejs or Python the function is synchronous, returning the response content, thus without a handler.
 * - In a JavaScript/Webpage context, it is asynchronous, requiring a handler, and not providing a response en return.
 * @param {string} url The URL to query.
 * @param {Value} [parameters] The `{ name: value, … }` parameters.
 * - It uses a "POST" method if parameters is defined and not empty.
 * - It uses a "GET" method otherwise.
 * @param {callback} handler In a Web page context, a `handler(string response_content)` has to be defined.
 * @return {string} The response content, either a JSON string, or a HTML page, or textual message, if synchrobeous, else nothing.
 *  - JSON string starts with '{'.
 *  - HTML page  starts with '<'.
 *  - Other textual messages do not, by contract, starts with '{' or '<'.
 * @throws {error} If the query fails.
 */
function fetchService(url, parameters = null, callback)
{
  (parameters == null || typeof parameters !== 'object' || Object.keys(parameters).length() == 0 ?
   fetch(url) :
   fetch(url, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify(parameters);
   })).then(response => {
     if (res.ok) {
       handler(res.text());
     } else {
       throw new Error(`fetchService query to ${url}$ failed: ${res.statusText}`);
     }
   })
}

