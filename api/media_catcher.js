const fs = require('fs');
const log = require("./log");
let date_obj = new Date();

//@TODO modifier pour ajouter dans un fichier de config
const base_path = "C:/servers/media_manager/pictures/";

function is_file_before(file_name, day, hour, minutes, seconds) {
    log.debug("Entering is_file_before for file " + file_name);
    const split_day = file_name.split(".")[0].split("_");
    const file_day = split_day[0];
    const split_time = split_day[1].split("-");
    const file_hour = split_time[0];
    const file_minutes = split_time[1];
    const file_seconds = split_time[2];

    return (file_day < day) || (file_day == day && file_hour < hour) || (file_day == day && file_hour == hour && file_minutes < minutes) || (file_day == day && file_hour == hour && file_minutes == minutes && file_seconds < seconds);

}

function get_medias(amount, year, month, day, hour, minutes, seconds) {
    log.debug("Entering get_medias");
    var cur_year = year;
    var cur_month = ("0" + month).slice(-2);
    var result = [];
    var cur_path;
    var is_first_check = true
    var content;
    while(result.length < amount) {
        //Check if the month value is correct
        if(cur_month < 1) {
            log.debug("Month out of range : " + cur_month);
            cur_month = 12;
            cur_year--;
        }
        else {
            cur_path = base_path + cur_year + "/" + ("0" + cur_month).slice(-2);
            //Check if the folder corresponding to the date exists
            if(fs.existsSync(cur_path)) {
                log.debug("The folder " + cur_path + " exists");
                content = fs.readdirSync(cur_path);
                log.debug("Content of the folder : " + content);
                //Test if the folder is empty
                if(content.length > 0) {
                    //We need to exclude all files which have a date previous than the arguments of the function
                    for(file in content) {
                        if(result.length >= amount) break;
                        if(is_first_check) {
                            log.debug("First check");
                            log.debug("Path of the current file : " + content[file]);
                            
                            if(is_file_before(content[file], day, hour, minutes, seconds)) {
                                log.debug("Adding file to result");
                                result.push({path: cur_path + "/" + content[file], name: cur_year + "-" + ("0" + cur_month).slice(-2) + "-" + content[file]});
                            }
                        }
                        else {
                            log.debug("Adding file to result");
                            result.push({path: cur_path + "/" + content[file], name: cur_year + "-" + ("0" + cur_month).slice(-2) + "-" + content[file]});
                        }
                    }
                }
            }
        }
        cur_month--;
        is_first_check = false;
    }

    return result;
}

module.exports = {get_medias};