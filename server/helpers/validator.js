module.exports.username = new RegExp(/^[a-zA-Z0-9\s]{3,20}$/);
module.exports.password = new RegExp(/^(?=.*[a-zA-Z])(?=.*\d).{8,32}$/);
module.exports.email = new RegExp(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/);
