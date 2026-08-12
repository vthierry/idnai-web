
const fetchSync = require("node-sync-fetch");

function fetchService(url, parameters = null)
{
  let res = parameters == null || typeof parameters !== 'object' || Object.keys(parameters).length() == 0 ? fetchSync(url) : fetchSync(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parameters);
  });
  if (res.ok) {
    return res.text();
  } else {
    throw new Error(`fetchService query to ${url}$ failed: ${res.statusText}`);
  }
}
