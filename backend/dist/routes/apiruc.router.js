"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiruc_controller_1 = require("../controllers/apiruc.controller");
const routerRUC = (0, express_1.Router)();
// Definición de ruta con parámetro de RUC
routerRUC.get('/:ruc', apiruc_controller_1.consultarRUC);
exports.default = routerRUC;
