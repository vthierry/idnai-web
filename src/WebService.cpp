#include "WebService.hpp"
#include "std.hpp"
#include <map>
#include <time.h>

#include "httplib.h"
// Ref: https://yhirose.github.io/cpp-httplib/en/tour/03-basic-server/

struct WebServiceServer {
  httplib::Server svr;
  struct Transaction : public WebService::Transaction {
    const httplib::Request &request;
    httplib::Response &response;
    Transaction(const httplib::Request &request, httplib::Response &response) : request(request), response(response) {}
    std::string get(name)
    {
      auto it = request.params.find(name);
      return it != request.params.cend() ? it->second : name == "now" ? now() : "";
      // request.method == "GET" ? request.has_param(name) ? request.get_param_value(name) : name == "now" ? WebService::now() : "" :
    }
    void answer(bool ok, String message) {
      char h = message.length > 0 ? message.trim().at(0);
      response.status = ok ? (message.length > 0 ? 200 : 204) : 400;
      response.set_content(message, h == '<' ? "text/html" : h == '{' ? "application/json": "text/plain");
    }
  };
  std::map<std::string, void (*)(const WebService::Transaction&)> handlers;
  void handler(const httplib::Request &request, httplib::Response &response)
  {
    auto it = handlers.find(request.matched_route);
    if (it != handlers.cend()) {
      Transaction transaction(request, response);
      it->second(transaction);
    } else
      response.status = 404;
  }
  static void badMethod(const httplib::Request &request, httplib::Response &response)
  {
    response.status = 405;
  }
  static std::string now()
  {
    struct tm datetime = *localtime(time(NULL));
    char output[64];
    strftime(output, 50, "%Y-%m-%dT%H:%M:%S", &datetime);
    return output;
  }
};

WebService::WebService()
{
  server = new WebServiceServer();
}
	    
void WebService::on(String route, void (*handler)(const Transaction&)) {
  server->handlers[route] = handler;
  server->srv.Get(route, WebServiceServer::handler);
  server->srv.Post(route, WebServiceServer::handler);
  server->svr.Put(route, WebServiceServer::badMethod);
  server->svr.Delete(route, WebServiceServer::badMethod);
}

void WebService:begin(port = 8080) {
  server->svr.listen("0.0.0.0", port);
}
