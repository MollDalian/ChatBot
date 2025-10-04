const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const proxyMiddleware = createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    ws: true,
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers['cache-control'] = 'no-cache, no-transform';
      proxyRes.headers['x-accel-buffering'] = 'no';
    },
    logLevel: 'debug',
  });

  app.use((req, res, next) => {
    if (req.path.startsWith('/chat') || req.path.startsWith('/chats') || req.path.startsWith('/load_chat')) {
      return proxyMiddleware(req, res, next);
    }
    next();
  });
};
