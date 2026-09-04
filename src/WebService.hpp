#ifndef __idnai_WebService__
#define __idnai_WebService__

class WebService {
  class WebServiceServer;
  WebServiceServer* server = NULL;  
public:
  struct Transaction {
  public:
    virtual std::string get(name);
    virtual void answer(bool ok, String message);
  };
  WebService();
  void on(String route, void (*handler)(void));
  void begin(port = 8080);
};

#endif
