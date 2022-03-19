const fs = require("fs");
const fm = require("./file_manager");
const log = require("./log");
const multer = require('multer');
const mc = require("./media_catcher");
const zip = require("express-zip");

function check_time(time) {
    let is_positive = true;

    for(v in time) {
        const num = Number(v);
        is_positive = is_positive && Number.isInteger(num) && num >= 0
    }

    return is_positive && Number(time[0]) >= 1970 && Number(time[1]) <= 12 && Number(time[1]) > 0 && Number(time[2]) <= 31 && Number(time[2]) > 0 && Number(time[3]) < 24 && Number(time[4]) < 60 && Number(time[5]) < 60;
}

const error_bodies = {
    error_format_json: {
        message: "request format must be application/json"
    },
    error_picture_not_found: {
        message: "the picture requested does not exist"
    },
    error_wrong_request_format: {
        message: "Syntax error in the request format"
    },
    error_format_image: {
        message: "request format must be image/*"
    },
}

function get_picture(req, res) {
    if(!req.is("application/json")) return res.status(400).json(JSON.stringify(error_bodies.error_format_json));

    const name = req.body.name;

    if(name == null) return res.status(412).json(JSON.stringify(error_bodies.error_wrong_request_format));

    if (fs.existsSync("./pictures/"+name)) res.status(200).download("./pictures/"+name);
    else return res.status(404).json(JSON.stringify(error_bodies.error_picture_not_found));

}

function post_save_media(req, res) {
    
    log.info("Receiving POST /save_media request");
  
    const ret = fm.upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        log.error("Multer error while uploading the file");
        log.error(err);
        return 1;
        
      } else if (err) {
        log.error("Unknown error while uploading the file");
        return 2;
      }
    });
  
    switch(ret) {
      case 1:
        return res.status(500).json("{'message': 'Multer error while uploading the file'}");
      case 2:
        return res.status(500).json("{'message': 'Unknown error while uploading the file'}");
      default:
        log.info("File successfully uploaded");
        return res.status(200).json("{'message': 'File successfully uploaded'}");
    }
}

function get_medias(req, res) {
  log.info("Receiving GET /get_medias request");
  if(!req.is("application/json")) return res.status(400).json(JSON.stringify(error_bodies.error_format_json));
  const body = req.body;
  const file_paths = mc.get_medias(body.amount, body.year, body.month, body.day, body.hour, body.minutes, body.seconds);

  log.debug(file_paths);
  console.log(file_paths);

  return res.status(200).zip(file_paths);


}

module.exports = {get_picture, post_save_media, get_medias};