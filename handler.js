/**
 * Created by mohammad on 7/30/15.
 */
var Handler = require('./reservation.js');
var ari = require('ari-client');
var DialPlan = require('./dialplans');
var bunyan = require('bunyan');
var clr = require('chalk');

var handler = new Handler();

handler.on('HospitalIntro', function (Channel, client) {
		console.log('HospitalIntro ' + Channel.id);
		var dialPlan = DialPlan('Hospital');
		playMenu(Channel, client, dialPlan['1'])
	}
);

function playMenu(channel, client, menu) {
	//LAST EDIT : 2015-07-31T23:58

	var state = {
		currentSound: menu.sounds[0],
		currentPlayback: undefined,
		done: false
	};

	channel.on('ChannelDtmfReceived', cancelMenu);
	channel.on('StasisEnd', cancelMenu);
	queueUpSound();

	// Cancel the menu, as the user did something
	function cancelMenu() {
		state.done = true;
		if (state.currentPlayback) {
			state.currentPlayback.stop(function (err) {
				//if (err)
				//	log.error(err + "h35");
				// ignore errors
			});
		}

		// remove listeners as future calls to playIntroMenu will create new ones
		channel.removeListener('ChannelDtmfReceived', cancelMenu);
		channel.removeListener('StasisEnd', cancelMenu);
	}

	// Start up the next sound and handle whatever happens
	function queueUpSound() {
		if (!state.done) {

			// have we played all sounds in the menu?
			//if (!state.currentSound) {
			//var timer = setTimeout(stillThere, 10 * 1000);
			//timers[channel.id] = timer;
			//} else {
			var playback = client.Playback();
			state.currentPlayback = playback;

			channel.play({media: state.currentSound}, playback, function (err) {
				if (err)
					log.error(err + "h62");
				// ignore errors
			});
			playback.once('PlaybackFinished', function (event, playback) {
				queueUpSound();
			});

			var nextSoundIndex = menu.sounds.indexOf(state.currentSound) + 1;
			state.currentSound = menu.sounds[nextSoundIndex];
			//}
		}
	}

	// plays are-you-still-there and restarts the menu
	//function stillThere() {
	//	console.log('Channel %s stopped paying attention...', channel.name);
	//
	//	channel.play({media: 'sound:are-you-still-there'}, function (err) {
	//		if (err) {
	//			console.log(err);
	//			throw err;
	//		}
	//
	//		playIntroMenu(channel);
	//	});
	//}
}