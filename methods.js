/*
 MyIvr
 Copyright (C) 2015  mohammad.minooee<mohammad.minooee@gmail.com>

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License Version 3.
 See the LICENSE file at the top of the source tree.
 */

//where ever  playing a file set channel.isPlaying true

var Channels = require( './channels' );

module.exports = (function () {
	var _return = {};

	//LAST EDIT : 2015-08-07T18:36

	_return.playMenu = function ( channel, client, menu, allowSkip ) {
		var ch = Channels.getChannel( channel.id );

		if ( typeof allowSkip === 'undefined' ) {
			allowSkip = 1;
		}
		var state = {
			currentSound: menu.sounds[0],
			currentPlayback: undefined,
			done: false
		};
		if ( allowSkip ) {
			channel.on( 'ChannelDtmfReceived', cancelMenu );
			channel.on( 'StasisEnd', cancelMenu );
		}

		ch.isPlaying = true;
		queueUpSound();

		// Cancel the menu, as the user did something
		function cancelMenu() {
			state.done = true;
			if ( state.currentPlayback ) {
				state.currentPlayback.stop( function ( err ) {
				} );
			}

			// remove listeners as future calls to playIntroMenu will create new ones
			channel.removeListener( 'ChannelDtmfReceived', cancelMenu );
			channel.removeListener( 'StasisEnd', cancelMenu );
		}

		// Start up the next sound and handle whatever happens
		function queueUpSound() {
			if ( !state.done ) {
				var playback = client.Playback();
				state.currentPlayback = playback;

				channel.play( { media: state.currentSound }, playback, function ( err ) {
					if ( err )
						log.error( err + " m54" );
					// ignore errors
				} );
				playback.once( 'PlaybackFinished', function ( event, playback ) {
					queueUpSound();
				} );

				var nextSoundIndex = menu.sounds.indexOf( state.currentSound ) + 1;
				state.currentSound = menu.sounds[nextSoundIndex];
				if ( !state.currentSound ) {
					state.done = true;
				}
			} else {
				ch.isPlaying = false;
				//todo consider changing state right here
			}

		}
	};

	return _return;
})();