module.exports = BotTest;

var spawn  = require('child_process').spawn,
    exec   = require('child_process').exec,
    Q      = require('q'),
    _      = require('underscore'),
    should = require('should'),
    Bot    = require('mybot');


/**
 * BotTest class
 *
 * @param (object)[optional] options - test bot configuration.
 */
function BotTest(options) {
  this.config = _.extend({
    nick: 'testbot',
    server: '127.0.0.1',
    channels: ['#test'],
    plugins: ['plugins/irctest-join.js', 'plugins/irctest-part.js',
              'plugins/irctest-message.js']
  }, options);
 
  this.bot = new Bot(this.config);
}

BotTest.prototype = {

  /**
   * Initialize test bot and target bot.
   *
   * @param {function} botConnect
   *    setup function of the target bot. This should be able to allccept
   *    a callback or return a promise.
   * @param {boolean}[optional] promise
   *    bool indicating if the setup function is promised based
   */
  init: function (botConnect, promise) {
    var that = this;
    return Q.Promise(function (resolve, reject) {
      that.startServer()
      .then(function() {
        return that.bot.connectAll();
      })
      .then(function() {
        if (!! promise) {
          return that.setupTargetPromise(botConnect);
        } else {
          return that.setupTarget(botConnect);
        }
      })
      .then(function() {
        resolve(true);
      })
      .catch(function(e) {
        reject('failed to init');
      });
    });
  },

  /**
   * Start the irc server.
   *
   * @return {Promise}
   */
  startServer: function () {
    var that = this;
    that.log('starting server');
    return Q.Promise(function (resolve, reject) {
      var which = spawn('which', ['ngircd']);
      which.stdout.on('data', function (data) {
        var s = String(data);
        that.log('result: ' + s);

        if (s.indexOf('ngircd') > -1) {
          that.log('found ngircd');
          exec(s, function () {
            that.log('ngircd started');
            resolve(true);
          });
        } else {
          reject('install ngircd and then proceed');
        }
      });
    });
  },

  buffer: function (channel) {
    return this.bot.buffer[channel];
  },

  targetNick: function (nick) {
    this.bot.targetNick = nick;
  },

  /**
   * Setup target.
   * @param {function} botConnect
   *    This function executes target setup method and it should return
   *    a promise.
   */
  setupTargetPromise: function (botConnect) {
    return Q.Promise(function (resolve, reject) {
      botConnect()
      .then(function () {
        resolve(true);
      })
      .catch(function () {
        reject('failed to connect');
      });
    });
  },

  /**
   * Setup target.
   * @param {function} botConnect
   *    This function executes target setup method and it should be able
   *    to accept a callback function.
   */
  setupTarget: function (botConnect) {
    return Q.Promise(function (resolve, reject) {
      try {
        botConnect(function () {
          resolve(true);
        });
      }
      catch (e) {
        reject(e);
      }
    });
  },

  /**
   * Logging method.
   *
   * @param {string} message - A string identifier
   * @param {array|string} args - An array of data to be printed
   */
  log: function (message, args) {
    if (this.debug) {
      console.log(message, args);
    }
  }
}
