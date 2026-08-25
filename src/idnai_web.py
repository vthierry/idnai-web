
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

# The WebService server implementation 
# - Implemented from https://gist.github.com/Trshant/bf317e55069acd5746ed222ac8f878f6
#  - Ref: https://docs.python.org/3/library/http.server.html
#  - Ref: https://docs.python.org/fr/3/library/queue.html

from http.server import BaseHTTPRequestHandler, HTTPServer
import datetime

class HandleRequests(BaseHTTPRequestHandler):
    def do_GET(self):
        this.do_all(self);
    def do_POST(self):
        this.do_all(self);
     def do_all(self):
         self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
       self._set_headers()
        stringToReturn = WebService.handleRoutes(self.path , "POST" )
        self.wfile.write( str.encode(stringToReturn) )

        # https://drewsh.com/minimal-python-server
        # https://docs.python.org/3/library/http.server.html
        # https://docs.python.org/fr/3/library/queue.html
        # https://docs.python.org/3/library/http.server.html
        
class WebService:
    """Implements web-service.
    - This service either:
      - renders a unique HTML web page or
      - responses to a web-service request
    - This service:
      - is not to be used to render a whole web site, while `python3 -m http.server 8080` in the web-site route directory is to be used instead;
      - is as closed as possible to the Arduino/ESP32 adnai-esp32 API, to simplify code development.
    """
       def __init__(self, parameters):
    handlers = {}
    """
    Attachs a handler to a web service route.
    route: The path defining the service, e.g., "/action".
    - It accepts both GET or POST requests.
    handler: A parameter less method implementing the service.
    - It uses the `get(name)` method to get argument's value.
    - The handler MUST conclude with a call to the `answer(ok, message)` function in order to send the response message.
    """
    def on(route, handler):
        this.handlers[route] = handler;
        
    """
    Gets a parameter value of the current request.
    name: The parameter name.
    - The `now` name corresponds to the current date and time in ISO format, on the service side, unless defined by the client
    :return: The parameter value, or the None if undefined.
    """
    def get(name):
        else if name == 'now':
            return datetime.datetime.now().isoformat()
        
    """
    Answers to a HTTP post request by a JSON message.
    ok: If true answer ok (code 200, or 204 if no message) else error (code 400).
    message: The message is:
    - A JSON data structure if starting with '{'.
    - A HTML page if starting with '<'.
    - No message if equal to "".
    - A textual string otherwise.
    """
    def answer(ok, message):

    """
    Begins the service, after all handles are defined.
    - The service stops at the end of the program execution.
    port: The port to listen, 8080 by default.
    """
    @staticmethod
    def begin(port = 8080):
      HTTPServer(('', port), HandleRequests).serve_forever()        
    
   
    routes       =  []
    routes_path  =  {}
 
    @classmethod
    def route( self, path):
        self.routes.append(path)
        def tags_decorator(func):
            self.routes_path[path] = func
            def func_wrapper():
                return func()
            return func_wrapper
        return tags_decorator

    @classmethod
    def handleRoutes( self, path, method ):
        stringToReturn  = "recieved "+method+"request : "
        stringToReturn += self.routes_path[path]()
        return stringToReturn
 


@app.route("/")
def get_text():
    return "Hello "

@app.route("/name/")
def get_text2():
    return "Hello 2"
