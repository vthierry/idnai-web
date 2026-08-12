const express = require("express");
const process = require("process");
const fs = require("fs");
const fileUpload = require("express-fileupload");

/** Implements a file upload of the server
 *
 * - A POST service is attached to the given route.
 * 
 * - When an upload post is sent on the given route for a file of name `$filename.$extension`
 *   - The file is stored with the path `$uploadPath=$upload_directory/$now-$filename.$extension` on the server
 *     - where `$now` stands for the file creation number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
 *
 * - On success the original page (via the header referer value) is reloaded, adding a `upload-path=$file-path` parameter to the query. 
 * 
 * - On the client side it has to be implemented via a construct of the form:
 * ```
 * <form action='$upload-service-url' method='post' encType='multipart/form-data'>
 *  <input type='file' name='uploadFile'/> <input type='submit'/>
 * </form>
 * ```
 * where the `name='uploadFile'` reference is mandatory.
 * 
 * - On the client side a construct of the form:
 * ```   
 *   let uploadPath = new URLSearchParams(window.location.search).get("upload-path");
 *   if (uploadPath != undefined)
 *     console.log("The file ``" + uploadPath + "´´ has been uploaded");
 * ```
 * can be used to detect if the file has been properly loaded.
 *
 * @param {express} server The express server mechanism.
 * @param {string} route  The service route.
 * @param {string} upload_directory The directory storing the uploaded files.
 * @param {string} upload_link If defined a link of path `$upload_directory/$upload_link` is created towards the last uploaded file.
 * @param {callback} [callback=function(uploadPath){}] The callback called after uploading.
 * @class
 */
const UploadService = function(server, route = "/upload", upload_directory = "./upload", upload_link, callback = function(value) {}) {
  server.use(fileUpload({
    createParentPath: true,
    safeFileNames: true,
    preserveExtension: true,
    limits: {
      fileSize: 50 * 1024 * 1024
    },
    abortOnLimit: true
  }));

  server.post(route, function(request, response) {
    if (!request.files || Object.keys(request.files).length === 0) {
      return response.status(400).send("No file uploaded.");
    }
    try {
      let uploadFile = request.files.uploadFile;
      if (uploadFile == undefined)
        return response.status(500).send("undefined <input type='file' name='uploadFile'/> field");
      let uploadFileName = Date.now() + "-" + uploadFile.name;
      let uploadFilePath = upload_directory + "/" + uploadFileName;
      uploadFile.mv(uploadFilePath, function(err) {
        if (err)
          return response.status(500).send(err);
        if (upload_link != undefined) {
          let uploadLinkPath = upload_directory + "/" + upload_link;
          try {
            fs.unlinkSync(uploadLinkPath);
          } catch (err) {}
          fs.symlinkSync(uploadFileName, uploadLinkPath);
        }
        callback(uploadFilePath);
        if (request.headers.referer != undefined)
          response.send("<script>location.replace('" + request.headers.referer.replace(new RegExp("\\?upload-path=.*"), "") + "?upload-path=" + encodeURIComponent(uploadFilePath) + "');</script>");
        else
          return response.send("File uploaded");
      });
    } catch (err) {
      return response.status(500).send(err);
    }
  });
};

module.exports = UploadService;
