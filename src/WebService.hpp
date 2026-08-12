#ifndef __aidesys_WebService__
#define __aidesys_WebService__

#include "httplib.h"
// Ref: https://yhirose.github.io/cpp-httplib/en/tour/03-basic-server/
#include <queue>
#include <map>

class WebService {
  httplib::Service svr;
  struct {
    void (*handler)(void);
    const httplib::Request &request;
    httplib::Response &response;
    query(void (*handler)(void), const httplib::Request &request, httplib::Response &response) : handler(handler), request(requesr), response(response) {}
  } query;
  std::queue<query*> queue;
  std::map<std::string, void (*)(void)> handlers;
  unsigned int port, overflow;
  void handlerPrologue(const httplib::Request &req, httplib::Response &res);
  static std::string now();
public:
  WebServer(port = 8080, overflow = 1024): port(port), overflow(overflow){}
  void on(String route, void (*handler)(void));
  std::string get(name) {
    return name in queue.front().request.has_param(name) ? queue.front().request.get_param_value(name) : name == "now" ? now() : "";
  }
  void answer(bool ok, String message);
  void begin() {
    svr.listen("0.0.0.0", post);
  }
};

#endif
