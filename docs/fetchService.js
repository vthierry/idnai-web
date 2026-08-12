
/** Implements a web service query.
 * - In C/C++ or JavaScript/nodejs the function is synchronous, while in a Web page context, it has asynchronous, requiring a handler.
 * @param {string} url The URL to query.
 * @param {Value} [parameters] The `{ name: value, … }` parameters.
 * - It uses a "POST" method if parameters is defined and not empty.
 * - It uses a "GET" method otherwise.
 * @param {callback} handler In asynchronous mode, i.e., in a Web page context, a `handler(string body)` has to be defined.
 * @return {string} The response content, either a JSON string, or a HTML page, or textual message.
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

