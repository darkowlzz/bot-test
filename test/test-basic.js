var BotTest = require('../'),
    Bot     = require('mybot'),
    should  = require('should'),
    Q       = require('q');

var config1 = {
  nick: 'realbot',
  server: '127.0.0.1',
  channels: ['#test']
};


describe('test bot', function() {
  var realbot, testbot;

  before(function (done) {
    this.timeout(55000);

    console.log('creating bots');
    testbot = new BotTest();
    realbot = new Bot(config1);

    return Q.try(function () {
      console.log('init bottest');
      return testbot.init(realbot.connectAll.bind(realbot), true);
    })
    .then(function () {
      done();
    })
    .catch(function (err) {
      done(err);
    });
  });

  describe('test message listening', function () {
    it('should work without channel name', function (done) {
      this.timeout(15000);
      realbot.say(realbot.channels[0], 'hello world');
      testbot.message('hello world', function () { done(); });
    });

    it('should work with channel name', function (done) {
      this.timeout(15000);
      realbot.say(realbot.channels[0], 'foo bar');
      testbot.message('#test', 'foo bar', function () { done(); });
    });
  });

  after(function () {
    realbot.kill();
    testbot.bot.kill();
  });
});
