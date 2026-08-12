#include "WebServer.hpp"

void WebServer::handlerPrologue(const httplib::Request &req, httplib::Response &res) {
  queue.push(new query(handlers.at(req.matched_route), req, res));
  if (queue.size() == 1) {
    queue.front().handler();
  }
}

std::string WebServer::now() {
  struct tm datetime = *localtime(time(NULL));
  char output[64];
  strftime(output, 50, "%Y-%m-%dT%H:%M:%S", &datetime);
    return output;
}

void WebServer::on(String route, void (*handler)(void)) {
  handlers[route] = handler;
  srv.Get(route, handlerPrologue);
  srv.Post(route, handlerPrologue);
}

void WebServer::answer(bool ok, String message) {
  char h = message.length > 0 ? message.trim().at(0);
  httplib::Response &res = queue.pop().response;
  res.set_header("Access-Control-Allow-Origin", "*");
  res.set_header("Access-Control-Allow-Methods", "GET, POST")
    res.status = ok ? (message.length > 0 ? 200 : 204) : 400;
  res.set_content(message, h == '<' ? "text/html" : h == '{' ? "application/json": "text/plain");
  if (queue.size() > 0) {
    queue.front().handler();
  }
}
