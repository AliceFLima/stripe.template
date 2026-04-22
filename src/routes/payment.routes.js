const express = require("express");
const router = express.Router();
const controller = require("../controllers/payment.controller");

router.post("/create-checkout-session", controller.createSession);

module.exports = router;