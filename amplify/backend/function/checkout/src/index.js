/*
 * This function creates a Stripe Checkout session and returns the session ID
 * for use with Stripe.js (specifically the redirectToCheckout method).
 *
 * @see https://stripe.com/docs/payments/checkout/one-time
 *
 * NOTE: You need to make the following environment variable available to this function:
 * STRIPE_SECRET_KEY (can be found at https://dashboard.stripe.com/apikeys)
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-03-02',
  maxNetworkRetries: 2,
});

const products = [
  {
    name: 'Bananas',
    description: 'Yummy yellow fruit',
    sku: 'sku_GBJ2Ep8246qeeT',
    price: 400,
    image:
      'https://images.unsplash.com/photo-1574226516831-e1dff420e562?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=225&q=80',
    attribution: 'Photo by Priscilla Du Preez on Unsplash',
    currency: 'USD',
  },
  {
    name: 'Tangerines',
    sku: 'sku_GBJ2WWfMaGNC2Z',
    price: 100,
    image:
      'https://images.unsplash.com/photo-1482012792084-a0c3725f289f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=225&q=80',
    attribution: 'Photo by Jonathan Pielmayer on Unsplash',
    currency: 'USD',
  },
];

function buildCheckoutLineItems(inventorySrc, cartItems) {
  const lineItems = [];

  for (const sku in cartItems) {
    const cartItem = cartItems[sku];
    const inventoryItem = inventorySrc.find(
      (currentProduct) => currentProduct.sku === sku
    );
    if (!inventoryItem) throw new Error('Product not found!');
    const product_data = {
      name: inventoryItem.name,
    };
    if (inventoryItem.description)
      product_data.description = inventoryItem.description;
    if (inventoryItem.image) product_data.images = [inventoryItem.image];
    const item = {
      price_data: {
        currency: inventoryItem.currency,
        unit_amount: inventoryItem.price,
        product_data,
      },
      quantity: cartItem.quantity,
    };
    lineItems.push(item);
  }

  return lineItems;
}

exports.handler = async (event) => {
  const cartItems = JSON.parse(event.body);
  try {
    const lineItems = buildCheckoutLineItems(products, cartItems);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000',
      line_items: [
        ...lineItems,
        {
          price_data: {
            currency: 'USD',
            product_data: {
              name: 'Shipping fee',
              description: 'Handling and shipping fee for global delivery',
            },
            unit_amount: 350,
          },
          quantity: 1,
        },
      ],
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // You should restrict this in your production application.
      },
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*', // You should restrict this in your production application.
      },
      body: `[Error]: ${error.message}`,
    };
  }
};
