
# The fetchService client implementation 

import requests

def fetchService(url, parameters = None):
    """Implements a web service query
    - Note: requires `pip3 install requests`
    url: The URL to query.
    parameters: The `{ name: value, … }` parameters, as a dictionnary.
    - It uses a "POST" method if parameters is defined and not empty.
    - It uses a "GET" method otherwise.
    :return: The response content, either a JSON string, or a HTML page, or textual message, if synchrobeous, else nothing.
    - JSON string starts with '{'.
    - HTML page  starts with '<'.
    - Other textual messages do not, by contract, starts with '{' or '<'.
    """
    if parameters == None || parameters == {}:
        return requests.get(url)
    else:
        return requests.post(url, data=parameters)

# The WebService implementation 

# - Implemented from https://gist.github.com/Trshant/bf317e55069acd5746ed222ac8f878f6
#  - Ref: https://docs.python.org/3/library/http.server.html
        
from http.server import BaseHTTPRequestHandler, HTTPServer
import datetime
import urlparse

class WebService(BaseHTTPRequestHandler):
    """
    Implements web-service.
    - Note: requires `pip3 install http.server`
    - This service either:
      - renders a unique HTML web page or
      - responses to a web-service request
    - This service:
      - is not to be used to render a whole web site, while `python3 -m http.server 8080` in the web-site route directory is to be used instead;
      - is as closed as possible to the Arduino/ESP32 adnai-esp32 API, to simplify code development.
    """
    handlers = {}
    def do_GET(self):
        self.args = dict(urllib.parse.parse_qsl(urllib.parse.url(self.path)))
        self.do_all(self);
    def do_POST(self):
        self.args = dict(urllib.parse.parse_qsl(self.rfile.read(int(self.headers['Content-Length']))))
        self.do_all(self);
    def do_PUT(self):
        self.send_response(405)
    def do_DELETE(self):
        self.send_response(405)
    def do_all(self):
        if self.handlers.path in handlers:
            self.handlers[path](Transaction(self))
        else:
            self.send_response(404)
                
    class Transaction:
        """
        Defines the methods to manage a translation.
        """
        webservice
        def __init__(self, webservice)
                self.webservice = webservice
        
        def get(name):
            """
            Gets a parameter value of the current request.
            name: The parameter name.
            - The `now` name corresponds to the current date and time in ISO format, on the service side, unless defined by the client
            :return: The parameter value, or None if undefined.
            """
            if name in self.webservice.args:
                return self.webservice.args[name]
            else if name == 'now':
                return datetime.datetime.now().isoformat()
            else
                return ""
                
            def answer(ok, message):
                """
                Answers to a HTTP post request by a JSON message.
                ok: If true answer ok (code 200, or 204 if no message) else error (code 400).
                message: The message is:
                - A JSON data structure if starting with '{'.
                - A HTML page if starting with '<'.
                - No message if equal to "".
                - A textual string otherwise.
                """
                h = message.message.strip()
                self.webservice.send_response((200 if len(message) > 0 else 204) if ok else 400)
                self.webservice.send_header("Content-type", "text/html" if h[0] == '<' else "application/json" if h[0] = '{' else "text/plain");
                self.webservice.end_headers()
                self.webservice.wfile.write(message)

        def on(route, handler):
            """
            Attachs a handler to a web service route.
            route: The path defining the service, e.g., "/action".
            - It accepts both GET or POST requests.
            handler: A parameter less method implementing the service.
            - It uses the `get(name)` method to get argument's value.
            - The handler MUST conclude with a call to the `answer(ok, message)` function in order to send the response message.
            """
            this.handlers[route] = handler;
        
        def begin(port = 8080):
            """
            Begins the service, after all handles are defined.
            - The service stops at the end of the program execution.
            port: The port to listen, 8080 by default.
            """
            HTTPServer(('', port), HandleRequests).serve_forever()        
    
