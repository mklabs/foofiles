#!/usr/bin/env node

var fs = require('fs'),
  path = require('path'),
  join = path.join;

// template generator


var Generator = require('../generator');
process.openStdin().pipe(new Generator(module)).pipe(process.stdout);

