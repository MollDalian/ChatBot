const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const chatProxyMiddleware = createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    onProxyRes: function (proxyRes, req, res) {
      if (req.url.includes('/chat?')) {
        proxyRes.headers['cache-control'] = 'no-cache, no-transform';
        proxyRes.headers['x-accel-buffering'] = 'no';
      }
    },
  });

  app.use('/chat', chatProxyMiddleware);
};
