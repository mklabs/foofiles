#!/usr/bin/env node

// template generator
var Generator = require('../../lib/generator');
process.openStdin().pipe(new Generator(module)).pipe(process.stdout);

