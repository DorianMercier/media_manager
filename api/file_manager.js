const fs = require("fs");
const multer = require('multer');
const log = require("./log");
const crypto = require("crypto");

function get_sha256(file) {
  const fileBuffer = fs.readFileSync(file);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);

  return hashSum.digest("hex");
}

function get_folder(req) {
    const dir = "./pictures/" + req.body.year + "/" + ( "0" + req.body.month).slice(-2);

    if(!fs.existsSync(dir)) {
      log.info("Creating the folder " + dir);
      fs.mkdirSync(dir, {recursive: true});
    }

    return dir;
}

function get_file_name(req, original_name) {
  const split = original_name.split(".");
  const ext = "." + split[split.length - 1];
  var hour = req.body.hour;
  var minute = req.body.minute;
  var second = req.body.second;
  var day = req.body.day;

  const base_path = get_folder(req);
  
  while(fs.existsSync(base_path +  "/" + ("0" + day).slice(-2) + "_" + ("0" + hour).slice(-2) + "-" + ("0" + minute).slice(-2) + "-"  + ("0" + second).slice(-2) + ext)) {
    //log.debug("Variable base_path : " + base_path +  "/" + ("0" + day).slice(-2) + "_" + ("0" + hour).slice(-2) + "-" + ("0" + minute).slice(-2) + "-"  + ("0" + second).slice(-2) + ext);
    if(second >= 59) {
        second = 0;
        if(minute >= 59) {
          minute = 0;
          if(hour >= 23) {
            hour = 0;
            day++;
          }
          else {
            hour++;
          }
        }
        else {
          minute = 0;
        }
    }
    else {
      second++;
    }
  }

  return ("0" + day).slice(-2) + "_" + ("0" + hour).slice(-2) + "-" + ("0" + minute).slice(-2) + "-" + ("0" + second).slice(-2) + ext;
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