const serve = require('koa-static');
const Koa = require('koa');

const { PORT = '8080' } = process.env;

new Koa().use(serve('dist')).listen(PORT);

console.log(`Server listening on port ${PORT}`);
