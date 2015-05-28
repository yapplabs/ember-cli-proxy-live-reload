# ember-cli-proxy-live-reload

When using nginx to terminate SSL and reverse proxy appropriate requests to ember-cli, ember-cli's live-reload will not work out of the box.

A configuration that gets live-reload working is implemented by this
addon plus nginx rules. This addon includes a script tag in index.html
as defined by the `contentFor` method below. Our standard nginx config
proxies the script to ember-cli.

When that script is requested, ember-cli will serve up the script in
the `dynamicScript` method below, which in turn loads the livereload.js
script.

Some nginx config proxies that to ember-cli's live-reload server running
in this project on port 37530:

  server {
    listen 80;
    listen 443 ssl;

    server_name cloudfront-standin-app.yapp.dev;

    # ...

    location ~ ^/apps/livereload.js {
      rewrite  ^/apps/(livereload.js)  /$1 break;
      proxy_pass http://localhost:37530;
    }

    # ...
  }

livereload.js is requested with query params that cause it to make a
secure websocket connection to cloudfront-standin-app.yapp.dev and on
a port 100 greater than 37530 (37630). nginx config terminates SLL
and proxies that to ember-cli's live-reload server:

  server {
    listen 37630 ssl;
    server_name cloudfront-standin-app.yapp.dev;

    location / {
      proxy_pass http://localhost:37530;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
  }

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
