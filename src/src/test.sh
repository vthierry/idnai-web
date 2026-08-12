#
# Tests starting a minimal persistantdata_service in interactive mode
#

if [ -z "$*" ] ; then echo 'make test ARGV="-i"' ; exit 0 ; fi # exit if no argument, i.e., if not interactive mode

node-gyp rebuild 2>&1 | grep -v '^gyp info'

mkdir -p ./build/_test_tmp

cat > ./build/_test_tmp/server.js <<EOF
// Loads required packages
const express = require("express");
const PersistantDataService = require("../../src/PersistantDataService.js");
const ServerEventService = require("../../src/ServerEventService.js");
const WrapperCCService = require("../../src/WrapperCCService.js");
const UploadService = require("../../src/UploadService.js");
const StopService = require("../../src/StopService.js");

// Defines a minimal service set
{
  const server = express();
  new PersistantDataService(server, "/build/_test_tmp");
  new ServerEventService(server, "/_test_event");
  new WrapperCCService(server, "/_test_cc_wrapper");
  new UploadService(server, "/_test_upload", "build/_test_upload", "input.html");
  new StopService(server);
  server.use("/build", express.static("build"));
  server.listen(8080);
}
EOF

killall node > /dev/null 2>&1
node ./build/_test_tmp/server.js &

# Upload test
sleep 2
/bin/rm -rf ./build/_test_upload/*
echo "Upload service is also fine." > ./build/_test_tmp/input.html
curl -s -i -X POST -H "Content-Type: multipart/form-data" -F "uploadFile=@./build/_test_tmp/input.html" http://localhost:8080/_test_upload > /dev/null

$BROWSER index.html
