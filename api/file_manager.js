const fs = require("fs");
const multer = require('multer');
const log = require("./log");

function get_folder(req) {
    const dir = "./pictures/" + req.body.year + "/" + req.body.month;

    if(!fs.existsSync(dir)) {
      log.info("Creating the folder " + dir);
      fs.mkdirSync(dir, {recursive: true});
    }

    return dir;
}

function get_file_name(req, original_name) {
  const split = original_name.split(".");
  const ext = "." + split[split.length - 1];

  return req.body.day + "_" + req.body.hour + "-" + req.body.minute + "-" + req.body.second + ext;
}


const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, get_folder(req));
    },
    filename: function (req, file, callback) {
      callback(null, get_file_name(req, file.originalname));
    }
  });

const upload = multer({ storage : storage}).single("file");

module.exports = {upload};