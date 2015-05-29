# ember-cli-proxy-live-reload

When using nginx to terminate SSL and reverse proxy appropriate requests to ember-cli, ember-cli's live-reload will not work out of the box.

This addon implements a proxy configuration for livereload.js and provides a generator for the corresponding nginx conf.

## nginx conf

Generate with `generator command here once it exists`

Our standard nginx config proxies the script to ember-cli.

When that script is requested, ember-cli will serve up the script in the `dynamicScript` method below, which in turn loads the livereload.js script.

Some nginx config proxies that to ember-cli's live-reload server running in this project on port 37500:

  server {
    listen 80;
    listen 443 ssl;

    server_name something.yourapphost.dev;

    # ...

    location ~ ^/apps/livereload.js {
      rewrite  ^/apps/(livereload.js)  /$1 break;
      proxy_pass http://localhost:37500;
    }

    # ...
  }

livereload.js is requested with query params that cause it to make a
secure websocket connection to cloudfront-standin-app.yapp.dev and on
a port 100 greater than 37500 (37600). nginx config terminates SLL
and proxies that to ember-cli's live-reload server:

  server {
    listen 37600 ssl;
    server_name something.yourapphost.dev;

    location / {
      proxy_pass http://localhost:37500;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
  }
