const fs = require("fs");
const fm = require("./file_manager");
const log = require("./log");
const multer = require('multer');
const mc = require("./media_catcher");
const zip = require("express-zip");
const sharp = require("sharp");

//@TODO A modifier pour inclure dans un fichier de configurations
const pictures_path = "C:/servers/media_manager/pictures/";

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
    error_icon_not_found: {
      message: "Icon not found"
    }
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

  return res.status(200).zip(file_paths);
}

function get_icons(req, res) {
  log.info("Receiving GET /get_icons request");

  if(!req.is("application/json")) return res.status(400).json(JSON.stringify(error_bodies.error_format_json));
  
  const body = req.body;

  const file_paths = mc.get_medias(body.amount, body.year, body.month, body.day, body.hour, body.minutes, body.seconds);

  const path_resizing = pictures_path + "buffer_icons/";
  var input_file;
  var output_file;
  const size = body.size;
  log.debug("Taille demandée : " + size);

  for(file in file_paths) {
    input_file = file_paths[file].path;
    output_file = path_resizing + file_paths[file].name;
    if(!fs.existsSync(output_file)) {
      fs.writeFileSync(output_file, "", { flag: "w" }, err => {log.error("Failed to create the file " + output_file + ". " + err);});

      sharp(input_file).resize({height: size, width: size}).toFile(output_file)
        .then(function (newFileInfo) {
          log.info("Adding the icon " + output_file + " to the buffer");
          log.info(newFileInfo);
        })
        .catch(function(err) {
          log.error("Error occured when generating the icon " + output_file + " for the picture " + input_file);
          log.error(err);
        }); 
      }
      file_paths[file].path = output_file;
  }

  return res.status(200).zip(file_paths);
}

function get_icon(req, res) {
  log.info("Receiving GET /get_icon request");

  console.log("body received:");
  console.log(req.body);
  // console.log(req);

  if(!req.is("application/json")) return res.status(400).json(JSON.stringify(error_bodies.error_format_json));
  
  const body = req.body;

  body.year

  const file_path = mc.get_media(body.year, body.month, body.day, body.hour, body.minute, body.second);

  if(file_path.name == null) return res.status(404).json(error_bodies.error_icon_not_found);

  const path_resizing = pictures_path + "buffer_icons/";
  var input_file;
  var output_file;
  const size = body.size;
  log.debug("Taille demandée : " + size);

  input_file = file_path.path;
  output_file = path_resizing + file_path.name;
  if(!fs.existsSync(output_file)) {
    fs.writeFileSync(output_file, "", { flag: "w" }, err => {log.error("Failed to create the file " + output_file + ". " + err);});

    return sharp(input_file).resize({height: size, width: size}).toFile(output_file)
    .then(function (newFileInfo) {
      log.info("Adding the icon " + output_file + " to the buffer");
      log.info(newFileInfo);
      log.debug("Sending the file " + output_file);
      return res.status(200).sendFile(output_file);
    })
    .catch(function(err) {
      log.error("Error occured when generating the icon " + output_file + " for the picture " + input_file);
      log.error(err);
      return res.statuc(500);
    }); 
  }
  else {
    log.debug("Sending the file " + output_file);
    return res.status(200).sendFile(output_file);
  }
}

function get_index(res) {
  log.info("Receiving GET /get_index request");
  var res_obj = [];
  const date_obj = new Date();
  const cur_year = date_obj.getFullYear();


  const base_path = "./pictures/";

  for(year=1970; year <= cur_year; year++) {
    if(fs.existsSync(base_path + year)) {
      for(month=1; month <= 12; month++) {
        stringMonth = ("0" + month).slice(-2);
        if(fs.existsSync(base_path + year + "/" + stringMonth)) {
          const content = fs.readdirSync(base_path + year + "/" + stringMonth);
          for(file in content) {
            const file_name = content[file];
            const split_day = file_name.split(".")[0].split("_");
            const file_day = split_day[0];
            const split_time = split_day[1].split("-");
            const file_hour = split_time[0];
            const file_minutes = split_time[1];
            const file_seconds = split_time[2];

            res_obj.push({
              year: year,
              month: month,
              day: Number(file_day),
              hour: Number(file_hour),
              minute: Number(file_minutes),
              second: Number(file_seconds)
            });
          }
        }
      }
    }
  }


  return res.status(200).json(res_obj);

}

module.exports = {get_picture, post_save_media, get_medias, get_icons, get_index, get_icon};