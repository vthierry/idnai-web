import sys
from idnai-web import fetchSerice, WebService

def main(argv)
    if len(argv) > 1 and argv[2] == "-go" :
      count = 0;
      webservice = New WebService();
      webservice.on("/now", lambda transation :  transaction.answer(true, transaction.get("now")));
      webservice.on("/set", lambda transation :  count = transation.get("count"));
      webservice.on("/get", lambda transation :  transation.answer(true, count));
      webservice.on("/post", lambda transation : {
        fetchService("http:/localhost:8082/set?count="+(count+1));
        fetchService("http:/localhost:8082/post");
      });
      webserice.begin(8082);

if __name__ == "__main__":
    main(sys.argv)
    
