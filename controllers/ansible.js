var Ansible = require('node-ansible');




exports.ping = function(host) {
	console.log("host="+host)
	var ping_command = new Ansible.AdHoc().hosts(host).module('ping');
	var promise = ping_command.exec();
	promise.then(function(result) {
  		console.log(result.output);
  		console.log(result.code);
  		return result;
	})
};

exports.pingAll = function(req, res) {
	var promise = ping_command.exec();
	promise.then(function(result) {
  		console.log(result.output);
  		console.log(result.code);
  		return result;
	})

};

exports.createNote = function(req, res) {
 
 };

exports.findAll = function(req, res) {
 
};

exports.findOne = function(req, res) {
 
};

exports.getUpdate = function(req, res) {
 
};

exports.postUpdate = function(req, res) {
 
};


exports.delete = function(req, res) {

};

