#include "fetchService.hpp"
#include "Webservice.hpp"


int main(unsigned int argc, char v)
{
  if (argc > 2 && argv[1] == "-go") {
    unsigned int count = 0;
    webservice = New WebService();
    webservice.on("/now", [](transaction) => transaction.answer(true, transaction.get("now")));
    webservice.on("/set", [count](transaction) => count = transation.get("count"));
    webservice.on("/get", [count](transaction) => transation.answer(true, count));
    webservice.on("/post", [count(transaction) => {
	  fetchService(echo("http:/localhost:8082/set?count=%d", count+1));
	  fetchService("http:/localhost:8082/post");
    });
    webserice.begin(8081);
  }
}

