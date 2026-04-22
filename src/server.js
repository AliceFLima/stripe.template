require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes/payment.routes");
const controller = require("./controllers/payment.controller");

const app = express();

app.use(cors()); ///para o front fazer requisiçoes para o back--- isso deve ser usado só para teste

app.post("/api/payments/webhook", express.raw({ type: "application/json" }), controller.webhook);

app.use(express.json());
app.use("/api/payments", routes);

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT); ////usado em testes
});