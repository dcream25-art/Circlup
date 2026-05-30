// Stripe public key — tu la trouves dans ton dashboard Stripe
export const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY

// Prix de l'abonnement — tu le crées dans Stripe dashboard
export const STRIPE_PRICE_ID = process.env.REACT_APP_STRIPE_PRICE_ID

// Fonction pour rediriger vers Stripe Checkout
export const redirectToCheckout = async (userId, email) => {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email, priceId: STRIPE_PRICE_ID })
  })
  const { url } = await response.json()
  window.location.href = url
}
