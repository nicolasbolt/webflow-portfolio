# Lighthouse Widget Setup for Cloudflare Pages

## Environment Variable Setup

To make the Lighthouse Widget work on Cloudflare Pages, you need to set up an environment variable for your Google PageSpeed Insights API key.

### Steps:

1. **Get a Google PageSpeed Insights API Key:**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the PageSpeed Insights API
   - Create credentials (API Key)
   - Optionally, restrict the API key to your domain for security

2. **Set up the Environment Variable in Cloudflare Pages:**
   - Go to your Cloudflare Pages dashboard
   - Select your project
   - Go to Settings → Environment variables
   - Add a new environment variable:
     - **Variable name:** `GOOGLE_PAGESPEED_API_KEY`
     - **Value:** Your Google PageSpeed Insights API key
   - Make sure to set it for both "Production" and "Preview" environments

3. **Redeploy your site:**
   - After adding the environment variable, trigger a new deployment
   - The widget should now work with the server-side API key

## Security Benefits

- ✅ API key is not exposed in client-side code
- ✅ API key is securely stored in Cloudflare's environment
- ✅ API calls are proxied through Cloudflare Pages Functions
- ✅ You can set domain restrictions on your Google API key

## File Structure

```
webflow-portfolio/
├── functions/
│   └── api/
│       └── lighthouse.js  # Cloudflare Pages Function
├── js/
│   └── lighthouse-widget.js  # Updated widget JS
└── css/
    └── lighthouse-widget.css  # Widget styles
```

## How it Works

1. User enters a URL in the widget
2. Widget makes a POST request to `/api/lighthouse` (Cloudflare Pages Function)
3. Cloudflare function calls Google PageSpeed Insights API with the server-side API key
4. Results are returned to the widget and displayed to the user

## Cloudflare Pages Setup Checklist

### Required (Minimum Setup):
- ✅ Add environment variable `GOOGLE_PAGESPEED_API_KEY` in Pages settings
- ✅ Redeploy your site after adding the environment variable

### Automatic (No Action Needed):
- ✅ Cloudflare Pages automatically detects and deploys functions in `/functions` directory
- ✅ HTTPS is automatically enabled
- ✅ CDN and caching are automatically configured

### Optional Configurations:
- 🔧 Custom domain (if you want to use your own domain)
- 🔧 Build settings (only if you have a build process)
- 🔧 Security headers (recommended for production)

## Troubleshooting

- Make sure the environment variable name is exactly `GOOGLE_PAGESPEED_API_KEY`
- Check the Cloudflare Pages Functions logs if the widget isn't working
- Verify your Google API key has the PageSpeed Insights API enabled
- Ensure you've redeployed after adding the environment variable
- Functions are automatically enabled - no additional setup needed in Cloudflare console