var should = require('should'),
    _      = require('underscore');

exports.name   = 'irctest-part';
exports.type   = 'event';
exports.events = ['part'];
exports.help   = 'irctest-part:\n' +
                 'Listens to part events and logs them in part event buffer.';

exports.part = function (channel, nick, reason) {
  var self = this;
  self.irctestPart = {};
  self.irctestPart[channel] = {}; 
  self.irctestPart[channel].nick = nick;
  self.irctestPart[channel].reason = reason;

  self.log(exports.name, [channel, nick, reason]);

  self.testPart = function (options) {
    var expect = _.extend({
      channel: null,
         nick: null,
       reason: null,
     callback: null
    }, options);

    self.waitAlittle()
    .then(function () {
      if (!! expect.nick) {
        self.irctestPart[expect.channel].nick.should.equal(expect.nick);
      }
      if (!! expect.reason) {
        self.irctestPart[expect.channel].reason.should.equal(expect.reason);
      }
    })
    .then(function () {
      if (!! expect.callback) {
        expect.callback();
      }
    });
  }
};
