module.exports =

//
// https://github.com/mklabs/140-opts
//
// ... That was fun ...
//
// Basic option parser, copy-pasting this to not rely on another deps.
//


function(a){return a.map(function(c,d){return{n:c.match(/^--?(.+)/),v:a[d+1]||!0}}).reduce(function(a,b){b.n&&(a[b.n[1]]=b.v);return a},{})}
