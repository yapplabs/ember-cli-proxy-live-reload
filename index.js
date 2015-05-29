/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-proxy-live-reload',

  contentFor: function(type) {
    var liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;

    if (liveReloadPort && type === 'head') {
      var scriptSrc = process.env.EMBER_CLI_PROXY_LIVE_RELOAD_HOST;
      scriptSrc += process.env.EMBER_CLI_PROXY_LIVE_RELOAD_BASE_URL;
      scriptSrc += 'ember-cli-live-reload.js';
      return '<script src="' + scriptSrc + '" type="text/javascript"></script>';
    }
  },

  dynamicScript: function(request) {
    var liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;
    var scriptSrc = process.env.EMBER_CLI_PROXY_LIVE_RELOAD_HOST;
    scriptSrc += process.env.EMBER_CLI_PROXY_LIVE_RELOAD_BASE_URL;
    scriptSrc += 'livereload.js?snipver=1&host=';
    scriptSrc += process.env.EMBER_CLI_PROXY_LIVE_RELOAD_HOST.replace('https://', '').replace('http://', '');
    scriptSrc += '&port=' + process.env.EMBER_CLI_PROXY_LIVE_RELOAD_PROXY_PORT;

    return "(function() {\n " +
           "var src = '" + scriptSrc + "';\n " +
           "var script    = document.createElement('script');\n " +
           "script.type   = 'text/javascript';\n " +
           "script.src    = src;\n " +
           "document.getElementsByTagName('head')[0].appendChild(script);\n" +
           "}());";
  },

  serverMiddleware: function(config) {
    var self = this;
    var app = config.app;
    var options = config.options;
    var proxyOptions = options.proxyLiveReload || {};
    var portOffset = proxyOptions.portOffset || 100;
    if (!proxyOptions.host) {
      console.error('EMBER CLI PROXY LIVE RELOAD - Must specify host');
    }

    if (options.liveReload !== true) { return; }

    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT = options.liveReloadPort;
    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_BASEURL = options.baseURL; // default is '/'
    process.env.EMBER_CLI_PROXY_LIVE_RELOAD_PROXY_PORT = parseInt(options.liveReloadPort) + parseInt(portOffset);
    process.env.EMBER_CLI_PROXY_LIVE_RELOAD_HOST = proxyOptions.host;

    process.env.EMBER_CLI_PROXY_LIVE_RELOAD_BASE_URL = options.baseURL;

    var liveReloadUrl = options.baseURL + 'ember-cli-live-reload.js';
    app.use(liveReloadUrl, function(request, response, next) {
      response.contentType('text/javascript');
      response.send(self.dynamicScript());
    });
  }
};
