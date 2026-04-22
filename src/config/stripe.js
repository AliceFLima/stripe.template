const Stripe = require('stripe');
const prisma = require('./prisma'); 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
});

module.exports = {
  stripe,
  prisma,
};