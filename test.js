const { artinama, corona } = require('./lib/functions');

(async() => {
    const result = await corona()
    console.log(result)
})();