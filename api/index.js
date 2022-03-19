const express = require('express');
const app = express();
const parkings = require('./parking.json');
const api = require("./api");
const log = require("./log");

app.use(express.json());

app.get('/parkings', (req,res) => {res.status(200).json(parkings)});
app.get("/picture", (req,res) => {api.get_picture(req,res)});
app.post("/save_media", (req,res) => {api.post_save_media(req,res)});
app.get("/get_medias", (req, res) => {api.get_medias(req, res)});
app.get("/get_icons", (req, res) => {api.get_icons(req, res)});

app.listen(8080, () => {log.info('Serveur à l\'écoute')});