const fs = require("fs");

function write_file(name, text) {
    fs.writeFileSync('./logs/'+name, text, { flag: "a+" }, err => {console.log("Failed to log a message");});
}

function write_log(prefix, message) {
    const date_ob = new Date();

    const date = date_ob.getFullYear() + "-" + ("0" + (date_ob.getMonth() + 1)).slice(-2) + "-" +  ("0" + date_ob.getDate()).slice(-2);
    
    const time = ("0" + date_ob.getHours()).slice(-2) + ":" + ("0" + date_ob.getMinutes()).slice(-2) + ":" + ("0" + date_ob.getSeconds()).slice(-2);

    const time_prefix = "[" + date + " " + time + "]";

    const message_log = prefix + ":" + time_prefix + ": " + message;
    
    console.log(message_log);
    write_file(date + ".log", message_log + "\n");
}

function info(message) {
    write_log("INFO", message);
}

function warning(message) {
    write_log("WARNING", message);
}

function error(message) {
    write_log("ERROR", message);
}

function debug(message) {
    write_log("DEBUG", message);
}

module.exports = {info, warning, error, debug};