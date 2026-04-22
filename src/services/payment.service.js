const stripe = require("../config/stripe").stripe;
const prisma = require("../config/stripe").prisma;

////formataçao dos dados:
async function createCheckoutSession({ items, currency }) {
  const line_items = items.map(item => ({
    price_data: {
      currency: currency || "brl",
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100)  ////o stripe usa os valores em centavos
    },
    quantity: item.quantity
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],   ///metodo de pagamento, pode ser alterado
    mode: "payment", ///para pagamentos unicos
    line_items,
    success_url: `${process.env.FRONTEND_URL}/success`,   ///pagina de sucesso
    cancel_url: `${process.env.FRONTEND_URL}/cancel`    ///pagina de cancelamento
  });

  const totalAmount = line_items.reduce((sum, i) => sum + (i.price_data.unit_amount * i.quantity), 0); ///valor final da compra

  await prisma.payment.create({
    data: {
      stripeSessionId: session.id,
      amount: totalAmount,
      currency: currency || "brl",
      status: "pending"   ///status coomeça como pendente, pode ser atualizado depois
    }
  });

  return session;
}

async function handleWebhook(event) {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const emailDoCliente = session.customer_details?.email;  ///email fornecido na compra
    
    await prisma.payment.update({
      where: { stripeSessionId: session.id },
      data: { 
        stripePaymentId: session.payment_intent, 
        status: "paid" ,   ///atualiza para paid se foi pago
        customerEmail: emailDoCliente
      }
    });
  }
}

module.exports = { createCheckoutSession, handleWebhook };