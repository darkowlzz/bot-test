var should = require('should'),
    _      = require('underscore');

exports.name   = 'irctest-join';
exports.type   = 'event';
exports.events = ['join'];
exports.help   = 'irctest-join:\n' +
                 'Listens to join events and logs them in join event buffer.';

exports.join = function (channel, nick) {
  var self = this;
  self.irctestJoin = {};
  self.irctestJoin[channel] = nick;

  self.log(exports.name, [channel, nick]);

  self.testJoin = function (options) {
    var expect = _.extend({
      channel: null,
         nick: null,
     callback: null
    }, options);

    self.waitAlittle()
    .then(function () {
      self.irctestJoin[expect.channel].should.equal(expect.nick);
    })
    .then(function () {
      if (!! expect.callback) {
        expect.callback();
      }
    });
  }
};
