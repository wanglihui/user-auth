/**
 * Created by think on 2014/8/31.
 */
var UserMin = require('../../lib').UserMin;

function User(){
    UserMin.call(this);
}

User.prototype = new UserMin();

User.loadUser = function(id, callback) {
    if (id) {
        var user = new User();
        user.id = id;
        user.username = 'test';
        user.pwd = 'test';
        callback(null, user);
    } else {
        var err = new Error("id is empty!");
        callback(err);
    }
}

User.authentication = function(username, pwd, callback) {
    if (username == 'test' && pwd == 'test') {
        var user = new User();
        user.username = 'test';
        user.pwd = 'test';
        user.id = 1;
        callback(null, user);
    } else {
        callback(null, null);
    }
}

module.exports = User;