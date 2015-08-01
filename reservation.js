/*jshint node:true*/
'use strict';

var ari = require('ari-client');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var DialPlan = require('./dialplans');
var bunyan = require('bunyan');
var clr = require('chalk');

var log = bunyan.createLogger({
	name: 'myapp',
	streams: [
		{
			level: 'debug',
			path: './reservation.log'  // log ERROR and above to a file
		}
	]
});

//TODO use timer in a convenient way
var timers = {};

var Channels = {};

var start = function Start() {

	ari.connect('http://localhost:8088', 'asterisk', 'asterisk', clientLoaded);

	var self = this;


	// Handler for client being loaded
	function clientLoaded(err, client) {
		if (err) {
			throw err;
		}
		client.on('StasisStart', stasisStart);
		client.on('StasisEnd', stasisEnd);

		// Handler for StasisStart event
		function stasisStart(event, channel) {
			console.log(clr.green('has entered the application : ', channel.caller.number, channel.id));
			log.info('%s has entered the application id= %s', channel.caller.number, channel.id);

			Channels[channel.id] = {};
			Channels[channel.id].state = '1';
			Channels[channel.id].CallerID = channel.caller.number;


			//log.debug(Channels);


			channel.on('ChannelDtmfReceived', dtmfReceived);

			channel.answer(function (err) {
				if (err) {
					console.log(err);
					log.error(err);
					throw err;
				}

				//TODO get name from dialplan
				self.emit('HospitalIntro', channel, client);

				//playIntroMenu(channel);
			});
		}

		// Handler for StasisEnd event
		function stasisEnd(event, channel) {
			console.log(clr.red('Channel has left the application :', channel.id));

			delete Channels[channel.id];
			// clean up listeners
			channel.removeListener('ChannelDtmfReceived', dtmfReceived);
			//cancelTimeout(channel);
		}

		// Main DTMF handler
		function dtmfReceived(event, channel) {
			//cancelTimeout(channel);
			var digit = parseInt(event.digit);
			var dialPlan = DialPlan('Hospital');

			console.log('Channel %s entered %d', channel.name, digit);

			// will be non-zero if valid
			var state = Channels[channel.id].state;
			var valid = ~dialPlan[state].validInput.indexOf(digit);

			if (valid) {

				handleDtmf(channel, digit);
			} else {
				console.log('Channel %s entered an invalid option!', channel.name);

				channel.play({media: 'sound:option-is-invalid'}, function (err, playback) {
					if (err) {
						console.log(err + "68");
						throw err;
					}

					playIntroMenu(channel);
				});
			}
		}



		// Cancel the timeout for the channel
		//function cancelTimeout(channel) {
		//	var timer = timers[channel.id];
		//
		//	if (timer) {
		//		clearTimeout(timer);
		//		delete timers[channel.id];
		//	}
		//}

		// Handler for channel pressing valid option
		function handleDtmf(channel, digit) {
			var parts = ['sound:you-entered', util.format('digits:%s', digit)];
			var done = 0;
			//Channels[channel.id].choices.push(digit);
			var playback = client.Playback();
			channel.play({media: 'sound:you-entered'}, playback, function (err) {
				// ignore errors
				if (err)
					console.log(err);
				channel.play({media: util.format('digits:%s', digit)}, function (err) {
					// ignore errors
					if (err)
						console.log(err);
					playIntroMenu(channel);
				});
			});
		}

		client.start('reservation');
	}
}
util.inherits(start, EventEmitter);
module.exports = start;
