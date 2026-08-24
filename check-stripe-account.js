const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkAccount() {
    try {
        const account = await stripe.accounts.retrieve();
        // This retrieves the connected account if using Connect, 
        // BUT for a standard account, we check the 'account' property of a balanced transaction or just the token itself?
        // Actually simpler: retrieve the account details of the API key owner.
        // For a standard key, it might not work with accounts.retrieve() if it's not a Connect platform.

        // Better way: Retrieve 'self'
        // Actually, stripe.account.retrieve() with no args retrieves the account the key belongs to? 
        // No, that needs an ID.

        // Let's just create a dummy object and check the response headers or something?
        // Or just print the key prefix? No.

        // Try retrieving the account details using the 'me' endpoint concept?
        // Stripe API: GET /v1/account -> retrieves the details of the account.
        const me = await stripe.accounts.retrieve();
        console.log('API Key Account ID:', me.id);
    } catch (error) {
        // If that fails (it might for standard keys?), try creating a token or something harmless.
        console.log('Could not retrieve account details directly.');
        console.log('Error:', error.message);
    }
}

// Actually, for standard keys, `stripe.accounts.retrieve()` usually works if it's a platform, 
// but for standard accounts it might return the account itself.
// Let's try a surer way: List customers (limit 1) and check if we can.
// If we can't, the key is invalid.
// But we want to know the Account ID.

// Alternative: 'stripe.account.retrieve()' (singular) isn't a thing in the node library, it's 'accounts.retrieve(id)'.
// If no ID is passed, it returns the *platform* account if authenticated as such?
// Let's try `stripe.oauth.token`? No.

// Simplest check: The CLI told us `acct_1PqrkwEnIdTqVJf4`.
// Let's see if we can perform an operation and if the error tells us anything, or if we can find the account ID in a balance transaction?
checkAccount();
