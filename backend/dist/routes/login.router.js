"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const login_controller_1 = require("../controllers/login.controller");
const authRouter = (0, express_1.Router)();
authRouter.post('/', login_controller_1.login);
authRouter.get('/verify', login_controller_1.verifyToken);
exports.default = authRouter;
