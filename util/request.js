
var path = require('path'),
  http = require('http'),
  util = require('util'),
  parse = require('url').parse,
  Stream = require('stream').Stream;

//
// A simple pass through wrapper to node's http.get. Support proxy connection as
// long as proxy is setup accordingly in environment variables (uppercased or
// lowercased http_proxy or https_proxy)
//
//      request('www.google.fr/').pipe(process.stdout);
//
// Takes a single string url argument and returns an Outgoing stream. The http
// response from http.get is piped to this Outgoing destination.
//

// proxy dance
var proxy = process.env.http_proxy || process.env.HTTP_PROXY ||
    process.env.https_proxy || process.env.HTTPS_PROXY;

proxy = proxy ? parse(proxy) : '';

module.exports = function request(url, cb) {
  if(!cb) cb = function() {};

  var options = parse(url);
  options.path = (options.protocol || proxy.protocol) + '//' + join(options.host, options.path);
  options.protocol = proxy.protocol;
  options.host = proxy.hostname;
  options.port = proxy.port;

  var stream = new Outgoing;
  http.get(options, function(res) {
    res.pipe(stream);
  }).on('error', stream.emit.bind(stream, 'error'));
  return stream;
};

function join() {
  var args = Array.prototype.slice.call(arguments);
  return path.join.apply(path, args).replace(/\\/g, '/');
}

// outgoing stream

function Outgoing() {
  this.readable = this.writable = true;
  Stream.call(this);
}

util.inherits(Outgoing, Stream);

// stream api

Outgoing.prototype.write = function(chunk) {
  this.emit('data', chunk);
};

Outgoing.prototype.end = function(chunk) {};
