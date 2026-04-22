const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const paymentService = require("../services/payment.service");
const handle_error = require("../utils/handle_error");

exports.webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];  ///assinatura do webhook para verificar a autenticidade da requisição
  let event;

  try { ///verifica se a requisiçao é realmente do stripe usando a assinatura e o segredo do webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(" Erro detalhado:", err.message); ////isso foi usado para debugar, pode ser removido
    
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try { 
    await paymentService.handleWebhook(event);
    res.json({ received: true });
  } catch (error) {
    handle_error(error, res);
  }
};

exports.createSession = async (req, res) => {
  try {
    const { items, currency } = req.body;  ///pega dados do carrinho
    const session = await paymentService.createCheckoutSession({ items, currency });
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    handle_error(error, res);
  }
};