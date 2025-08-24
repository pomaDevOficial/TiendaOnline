"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apidni_controller_1 = require("../controllers/apidni.controller");
const RouterDni = (0, express_1.Router)();
// Definición de ruta con parámetro de DNI
RouterDni.get('/:dni', apidni_controller_1.consultarDNI);
exports.default = RouterDni;
