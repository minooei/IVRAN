/*
 MyIvr
 Ivr with node-ari
 Copyright (C) 2015 mohammad.minooee email:mohammad.minooee@gmail.com

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License Version 3.
 See the LICENSE file at the top of the source tree.
 */

//where ever  playing a file set channel.isPlaying true

'use strict';
var Channels = require( './channels' );
var Grid = require( 'gridfs-stream' ), fs = require( 'fs' );
var DialPlan = require( './dialplans' );
var schema = require( './reservationSchema' );

var d = new Date();
var weekday = new Array( 7 );
weekday[0] = "sunday";
weekday[1] = "monday";
weekday[2] = "tuesday";
weekday[3] = "wednesday";
weekday[4] = "thursday";
weekday[5] = "friday";
weekday[6] = "saturday";

var n = weekday[d.getDay()];

module.exports = {

	//LAST EDIT : 2015-08-07T18:36

	playMenu: function ( channel, client, menu ) {
		var ch = Channels.getChannel( channel.id );
		var allowSkip = menu.allowSkip;

		if ( typeof allowSkip === 'undefined' ) {
			allowSkip = 1;
		}
		var state = {
			currentSound: menu.sounds[0],
			currentPlayback: undefined,
			done: false,
			finished: false,
			canceled: false
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
			state.canceled = true;
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

				try {//FIXME ERROR ON HANGUP !
					channel.play( { media: state.currentSound }, playback, function ( err ) {
						if ( err )
							log.error( err + " m54" );
						// ignore errors
					} );
				} catch ( e ) {
					console.log( e )
				}
				playback.once( 'PlaybackFinished', function ( event, playback ) {
					queueUpSound();
				} );

				var nextSoundIndex = menu.sounds.indexOf( state.currentSound ) + 1;
				state.currentSound = menu.sounds[nextSoundIndex];
				if ( !state.currentSound ) {
					state.done = true;
					state.finished = true;
				}
			} else {
				ch.isPlaying = false;
				if ( state.finished && !state.canceled ) {
					var dialPlan = DialPlan( ch.dialPlan );
					try {
						var newState = dialPlan[ch.state].next;
						Channels.setChannelProperty( channel, 'state', newState );
					} catch ( e ) {
					}
				}
				//todo consider changing state right here.strange behavior though !
			}

		}
	},
	recordVoice: function ( channel, client, menu ) {
		var recording = client.LiveRecording( client, { name: menu.fileName } );
		channel.on( "ChannelDtmfReceived", onDtmf );
		function onDtmf() {
			channel.removeListener( 'ChannelDtmfReceived', onDtmf );
			recording.stop( { recordingName: menu.fileName }, function ( err ) {
				if ( err ) {
					console.log( err + '114' )
				} else {
					var gfs = Grid( schema.dbConnection.db );
					var writestream = gfs.createWriteStream( {
						filename: menu.fileName + '.wav',
						mode: 'w',
						chunkSize: 1024
					} );
					fs.createReadStream( '/var/spool/asterisk/recording/' + menu.fileName + '.wav' ).pipe( writestream );
					writestream.on( 'close', function ( file ) {
						// do something with `file`
						var ch = Channels.getChannel( channel.id );
						ch.variables['recordFileId'] = file._id;
						console.log( file.filename + ' Written To DB' );
						var dialPlan = DialPlan( ch.dialPlan );
						Channels.setChannelProperty( channel, 'state', dialPlan[ch.state].next );
					} );
				}
			} );
		}

		channel.record( { name: menu.fileName, format: 'wav', beep: true, ifExists: 'overwrite' }, recording,
			function ( err, liveRecording ) {
				if ( err ) {
					console.log( err );
				}
			}
		);

	}

};