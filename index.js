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
  }, options);
 
  this.bot = new Bot(this.config);
}

/**
 * Initialize test bot and target bot.
 *
 * @param {function} botConnect
 *    setup function of the target bot. This should be able to allccept
 *    a callback or return a promise.
 * @param {boolean}[optional] promise
 *    bool indicating if the setup function is promised based
 */
BotTest.prototype.init = function (botConnect, promise) {
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
    })
  });
};

/**
 * Start the irc server.
 *
 * @return {Promise}
 */
BotTest.prototype.startServer = function () {
  console.log('starting server');
  return Q.Promise(function (resolve, reject) {
    var which = spawn('which', ['ngircd']);
    which.stdout.on('data', function (data) {
      var s = String(data);
      console.log('result: ' + s);

      if (s.indexOf('ngircd') > -1) {
        console.log('found ngircd');
        exec(s, function () {
          console.log('ngircd started');
          resolve(true);
        });
      } else {
        reject('install ngircd and then proceed');
      }
    });
  });
};

BotTest.prototype.buffer = function (channel) {
  return this.bot.buffer[channel];
};

BotTest.prototype.waitAlittle = function () {
  return Q.Promise(function (resolve, reject) {
    Q.delay(3000).then(function () {
      resolve(true);
    });
  });
};

BotTest.prototype.targetNick = function (nick) {
  this.bot.targetNick = nick;
};

/**
 * Setup target.
 * @param {function} botConnect
 *    This function executes target setup method and it should return
 *    a promise.
 */
BotTest.prototype.setupTargetPromise = function (botConnect) {
  return Q.Promise(function (resolve, reject) {
    botConnect()
    .then(function () {
      resolve(true);
    })
    .catch(function () {
      reject('failed to connect');
    });
  });
};

/**
 * Setup target.
 * @param {function} botConnect
 *    This function executes target setup method and it should be able
 *    to accept a callback function.
 */
BotTest.prototype.setupTarget = function (botConnect) {
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
};

/**
 * Assert message to channel.
 *
 * @param {String}[optional] channel - channel name
 * @param {String} msg - expected message
 * @param {function} callback - callback function
 */
BotTest.prototype.message = function (channel, msg, callback) {
  var that = this,
      buffer;
  if (typeof(msg) !== 'string') {
    callback = msg;
    msg = channel;
    channel = null;
  }
  that.waitAlittle()
  .then(function () {
    if (!! channel) {
      buffer = that.bot.buffer[channel];
    }
    else {
      buffer = _.values(that.bot.buffer);
    }
    return buffer.should.containEql(msg);
  })
  .then(function () {
    if (!! callback) {
      callback();
    }
  });
};
