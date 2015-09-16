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
var bunyan = require( 'bunyan' );

var log = bunyan.createLogger( {
	name: 'myapp',
	streams: [
		{
			level: 'debug',
			path: './reservation.log'  // log ERROR and above to a file
		}
	]
} );

var weekday = new Array( 7 );
weekday[0] = "sunday";
weekday[1] = "monday";
weekday[2] = "tuesday";
weekday[3] = "wednesday";
weekday[4] = "thursday";
weekday[5] = "friday";
weekday[6] = "saturday";

module.exports = {

	getDayName: function ( num ) {
		return weekday[num];
	},
	playMenu: function ( channel, client, menu ) {
		var ch = Channels.getChannel( channel.id );
		var allowSkip = menu.allowSkip;

		//first state of sounds list
		var state = {
			currentSound: menu.sounds[0],
			currentIndex: 0,
			currentPlayback: undefined,
			done: false,
			finished: false,
			canceled: false
		};
		if ( allowSkip ) {
			//whether dtmf received or stasis end cancel menu will invoked
			channel.on( 'ChannelDtmfReceived', cancelMenu );
			channel.on( 'StasisEnd', cancelMenu );
		}

		ch.isPlaying = true;
		queueUpSound();

		// Cancel the menu, as the user did something
		function cancelMenu( event, channel ) {
			try {
				var valid = ~menu.validInput.indexOf( event.digit );
				if ( !valid )
					return;
			} catch ( e ) {
				return;
			}
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
						if ( err ) {
							log.error( " m85:" + err + " m54" );
							console.log( " m86:" + err )
						}
						// ignore errors
					} );
				} catch ( e ) {
					console.log( " m91:" + e )
				}
				playback.once( 'PlaybackFinished', function ( event, playback ) {
					queueUpSound();
				} );

				//prepare for playing next sound
				state.currentIndex++;
				state.currentSound = menu.sounds[state.currentIndex];
				//finish when sounds list ends
				if ( !state.currentSound ) {
					state.done = true;
					state.finished = true;
				}
			} else {
				ch.isPlaying = false;
				if ( state.finished && !state.canceled ) {
					var dialPlan = DialPlan( ch.dialPlan );
					try {
						var newState = dialPlan[ch.state].next; //getting next state
						if ( newState )
							Channels.setChannelProperty( channel, 'state', newState );//changing state
					} catch ( e ) {
						console.log( " m112:" + e )
					}
				}
				//todo consider changing state right here.strange behavior though !
			}

		}
	},
	recordVoice: function ( channel, client, menu ) {
		var recording = client.LiveRecording( client, { name: menu.fileName } ); //recording file name
		channel.on( "ChannelDtmfReceived", onDtmf );
		//stop recording on dtmf received
		function onDtmf( event, channel ) {
			try {
				var valid = ~menu.validInput.indexOf( event.digit ); //if dtmf is valid input
				if ( !valid )
					return;
			} catch ( e ) {
				//return;
			}
			//remove dtmf received listener
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
					fs.createReadStream( '/var/spool/asterisk/recording/' + menu.fileName + '.wav' ).pipe( writestream ); // reading from file and write to DB
					writestream.on( 'close', function ( file ) {
						var ch = Channels.getChannel( channel.id );
						ch.variables['recordFileId'] = file._id;
						console.log( file.filename + ' Written To DB' );
						var dialPlan = DialPlan( ch.dialPlan );
						var newState = dialPlan[ch.state].next;
						if ( newState )
							Channels.setChannelProperty( channel, 'state', newState );//changing state
					} );
				}
			} );
		}

		//start recording
		channel.record( { name: menu.fileName, format: 'wav', beep: true, ifExists: 'overwrite' }, recording,
			function ( err, liveRecording ) {
				if ( err ) {
					console.log( err );
				}
			}
		);

	}

};