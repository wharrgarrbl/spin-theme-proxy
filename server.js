const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const path = require('path');

const app = express();

app.use('/spin-theme.css', express.static(path.join(__dirname, 'spin-theme.css')));
app.use('/theme-toggle.js', express.static(path.join(__dirname, 'theme-toggle.js')));

app.use('/', createProxyMiddleware({
  target: 'https://spin.taltech.ee',
  changeOrigin: true,
  selfHandleResponse: true,
  on: {
    proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
      res.removeHeader('content-security-policy');
      res.removeHeader('content-security-policy-report-only');

      const contentType = proxyRes.headers['content-type'] || '';
      if (contentType.includes('text/html')) {
        const html = responseBuffer.toString('utf8');
        return html.replace(
          '</head>',
          '<link rel="stylesheet" href="/spin-theme.css">\n<script src="/theme-toggle.js"></script>\n</head>'
        );
      }
      return responseBuffer;
    }),
  },
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Spin proxy running on port ${PORT}`));
