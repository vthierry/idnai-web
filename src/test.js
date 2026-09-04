#!/usr/bin/env node

fetchService = require("fetchService.js");
WebService = require("WebService.js");

if (process.argv.length > 2 && process.argv[2] == "-go") {
  let count = 0;
  webservice = New WebService();
  webservice.on("/now", (transaction) => transaction.answer(true, transaction.get("now")));
  webservice.on("/set", (transaction) => count = transation.get("count"));
  webservice.on("/get", (transaction) => transation.answer(true, count));
  webservice.on("/post", (transaction) => {
    fetchService(`http:/localhost:8081/set?count=${count+1}`);
    fetchService(`http:/localhost:8081/post`);
  });
  webserice.begin(8080);
}
