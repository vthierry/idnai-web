
const WebServer = require('WebServer');
const arp = require('node-arp');

/** Implements a secured form service over a WebServer service.
 * - The form is defined on the client side using a form of the form:
 * ```
 * <form action='$web-service-address/$route' method='post' enctype='multipart/form-data'>
 *   Select the [unique] file to upload: <input type='file' name='$uploadFileName'/>
 *   <input … other fields … />
 *   <input type='submit' value='Submit'/>
 * </form>
 * ```
 * @param {WebServer} server The given server.
 * @param {string} [route="/upload"] The service route.
 * @param {string} [directory=""] The directory, if defined, storing the form content in JSON and the uploaded files.
 * - Data is stored using the ISO string current date and time as prefix.
 * @param {classback} [handler=null] A `handler(form)` if defined, called with from content in JSON format, including uploaded file-name.
 * @param {string} [mac=""] The MAC address allowed to upload. The empty string if no restrictions.
 * @class
 */
class UploadService {
  constructor(server, route ="/upload", directory = "./upload", mac = "") {
    request.app.use(express.urlencoded({ extended: true }));
    server.on(route, "POST", () => {
      let request = server.getRequest().ip;
      let now = new Date().toISOString()
      let serveUpload = () => {
	let uploadFileName = + "-" + (
	  let uploadFilePath = directory + "/" + uploadFileName;

	if (request.body.files) {
	  try {
	    let uploadFile = request.files.uploadFile;
	    if (uploadFile == undefined)
	      server.answer(false, "Unnamed <input type='file' name='uploadFileName'/> field, the 'uploadFileName' value is required");
	    uploadFile.mv(uploadFilePath, function(err) {
	      if (err)
		server.answer(false, "Upload error '" + err + "'");
	      else
		server.answer(true, "File uploaded");
	    });
	  } catch (err) {
	    server.answer(false, "Upload error '" + err + "'");
	  }
	}
      };



      
      // Implements the MAC address security check, if required.
      if (mac != "") {
	apr.getMac(server.getRequest().ip, (err, mac) => {
	  if (mac != this.mac) {
	    server.answer(false, "This IP is not allowed to upload, bad MAC address");
	  } else {
	    this.serve(server);
	  }
	});
      } else
	this.serve(server);
    });
  }
  // Implements the form request service



module.exports = UploadService;
