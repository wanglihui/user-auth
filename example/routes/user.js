//var AuthManager = require('../../lib').AuthManager;

var express = require('express');
var router = express.Router();

console.info(router);

router.get('/list',  function(req, res) {
    res.send('respond with a resource');
})

module.exports = router;