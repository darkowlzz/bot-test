var BotTest = require('../'),
    Bot     = require('mybot'),
    should  = require('should'),
    Q       = require('q');

var config1 = {
  nick: 'realbot',
  server: '127.0.0.1',
  channels: ['#test']
};

var DEBUG = false;


describe('test bot', function() {
  var realbot, testbot;

  before(function (done) {
    this.timeout(55000);

    console.log('creating bots');
    testbot = new BotTest({debug: DEBUG});
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
      this.timeout(25000);
      realbot.say(realbot.channels[0], 'hello world');
      testbot.bot.testMessage({msg: 'hello world',
                               callback: function () { done(); }});
    });

    it('should work with channel name', function (done) {
      this.timeout(15000);
      realbot.say(realbot.channels[0], 'foo bar');
      testbot.bot.testMessage({channel: '#test', msg: 'foo bar',
                               callback: function () { done(); }});
    });

    it('message should not be empty', function (done) {
      this.timeout(15000);
      testbot.bot.say(realbot.channels[0], realbot.nick + ': hi');
      testbot.bot.testMessageExists({channel: '#test',
                                     callback: function () { done(); }});
    });
  });

  describe('test join listening', function () {
    it('should listen to join event', function (done) {
      this.timeout(15000);
      realbot.part('#test', 'gtg');
      realbot.join('#test');
      testbot.bot.testJoin({channel: '#test', nick: realbot.nick,
                            callback: function () { done(); }});
    });
  });

  describe('test part listening', function () {
    it('should listen to part event', function (done) {
      this.timeout(15000);
      realbot.part('#test', 'timeout');
      testbot.bot.testPart({channel: '#test', nick: realbot.nick,
                            reason: 'timeout',
                            callback: function () { done(); }});
    });
  });

  after(function () {
    realbot.kill();
    testbot.bot.kill();
  });
});
