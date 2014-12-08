var should = require('should'),
    _      = require('underscore');

exports.name   = 'irctest-message';
exports.type   = 'event';
exports.events = ['message'];
exports.help   = 'irctest-message:\n' +
                 'Listens to message events and logs them in message event buffer.';

exports.message = function (nick, channel, msg) {
  var self = this;
  self.irctestMessage = {};
  self.irctestMessage[channel] = msg;

  self.log(exports.name, [nick, channel, msg]);
};

exports.main = function (bot) {
  bot.testMessage = function (options) {
    var expect = _.extend({
      channel: null,
          msg: null,
     callback: null
    }, options);
    var buffer;

    bot.waitAlittle()
    .then(function () {
      if (!! expect.channel) {
        buffer = bot.irctestMessage[expect.channel];
      } else {
        buffer = _.values(bot.irctestMessage);
      }
      buffer.should.containEql(expect.msg);
    })
    .then(function () {
      if (!! expect.callback) {
        expect.callback();
      }
    });
  };
};

