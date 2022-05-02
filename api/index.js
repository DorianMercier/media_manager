const express = require('express');
const app = express();
const parkings = require('./parking.json');
const api = require("./api");
const log = require("./log");
const https = require("https");
const http = require("http");
const fs = require("fs");

const privateKey = fs.readFileSync("../tls_certificate/MyKey.key");
const certificate = fs.readFileSync("../tls_certificate/MyCertificate.crt");

const credentials = {key: privateKey, cert: certificate};

app.use(express.json());

app.get('/parkings', (req,res) => {res.status(200).json(parkings)});
app.get("/picture", (req,res) => {api.get_picture(req,res)});
app.post("/save_media", (req,res) => {api.post_save_media(req,res)});
app.get("/get_medias", (req, res) => {api.get_medias(req, res)});
app.get("/get_icons", (req, res) => {api.get_icons(req, res)});
app.get("/get_icon", (req, res) => {api.get_icon(req, res)});
app.get("/get_index", (req, res) => {api.get_index(res)});

const httpsServer = https.createServer(credentials, app);
const httpServer = http.createServer(app);

httpsServer.listen(8443);
httpServer.listen(8080);

// app.listen(8080, () => {log.info('Serveur à l\'écoute')});