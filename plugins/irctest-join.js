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
};

exports.main = function (bot) {
  bot.testJoin = function (options) {
    var expect = _.extend({
      channel: null,
         nick: null,
     callback: null
    }, options);

    bot.waitAlittle()
    .then(function () {
      bot.irctestJoin[expect.channel].should.equal(expect.nick);
    })
    .then(function () {
      if (!! expect.callback) {
        expect.callback();
      }
    });
  };
};
