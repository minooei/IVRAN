/*
 MyIvr
 Ivr with node-ari
 Copyright (C) 2015 mohammad.minooee email:mohammad.minooee@gmail.com

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License Version 3.
 See the LICENSE file at the top of the source tree.
 */


/*jshint node:true*/
'use strict';

var ari = require( 'ari-client' );
var util = require( 'util' );
var EventEmitter = require( 'events' ).EventEmitter;
var DialPlan = require( './dialplans' );
var bunyan = require( 'bunyan' );
var Channels = require( './channels' );
var log = bunyan.createLogger( {
	name: 'myapp',
	streams: [
		{
			level: 'debug',
			path: './reservation.log'  // log ERROR and above to a file
		}
	]
} );
var db = require( './reservationSchema' );
var Handler = require( './handler.js' );
//TODO use timer in a convenient way
var timers = {};

//Last Edit :2015-08-14T23:12

//calls from handler to register events before connect to asterisk
var start = function Start() {

	//todo change user pass
	ari.connect( 'http://localhost:8088', 'asterisk', 'asterisk', clientLoaded );

	var self = this;
	//SHARING EventEmitter BETWEEN MODULES
	Channels.setEventEmitter( self );

	// Handler for client being loaded
	function clientLoaded( err, client ) {
		console.log( 'connected to asterisk' );
		if ( err ) {
			console.log( err );
			log.error( err );
			throw err;
		}
		client.on( 'StasisStart', stasisStart );
		client.on( 'StasisEnd', stasisEnd );

		// Handler for StasisStart event
		function stasisStart( event, channel ) {
			console.log( 'has entered the application : ', channel.caller.number, channel.id );
			log.info( '%s has entered the application id= %s', channel.caller.number, channel.id );

			var channelBundle = Channels.newChannel( channel.id );
			channelBundle.state = 'first';
			channelBundle.callerId = channel.caller.number;
			channelBundle.exten = channel.dialplan.exten;
			channelBundle.variables = {};
			channelBundle.passingInput = {};

			//TODO get channel variable to use proper dialPlan
			channelBundle.dialPlan = 'UniReservation';

			channel.on( 'ChannelDtmfReceived', dtmfReceived );

			channel.answer( function ( err ) {
				if ( err ) {
					console.log( err );
					log.error( err );
					throw err;
				}
				// onstateChanged listener is responsible for call convenient handler
				self.emit( 'onstateChanged', channel );
			} );
		}

		// Main DTMF handler
		function dtmfReceived( event, channel ) {
			//cancelTimeout(channel);
			//var digit = parseInt( event.digit );
			console.log( 'Channel %s entered %d', channel.name, event.digit );

			var channelBundle = Channels.getChannel( channel.id );
			var dialPlan = DialPlan( channelBundle.dialPlan );

			// will be non-zero if valid
			var state = channelBundle.state;

			try {
				var valid = ~dialPlan[state].validInput.indexOf( event.digit );
			} catch ( e ) {
				console.log( 'm101:' + e )
			}

			if ( valid ) {
				//PASS VALID INPUT TO HANDLER
				//emit proper handler
				self.emit( dialPlan[state].handler, channel, client, event.digit );
			} else {
				console.log( 'Channel %s entered an invalid option!', channel.name );
				//todo emit invalid press handler of dialPlan
				//for now just ignoring invalid input
			}
		}

		//emit proper handler for new state.
		//emitting handler must be done only here.
		// Although this handler could moved to handler.js
		//but because client is needed to pass, this handler stays here !
		//its not so bad :)
		self.on( 'onstateChanged', function ( channel ) {
				//TODO convenient log

				var ch = Channels.getChannel( channel.id );
				var dialPlan = DialPlan( ch.dialPlan );

				//passing input from prev state if exist
				if ( ch.passingInput[ch.state] ) {
					try {
						var valid = ~dialPlan[ch.state].validInput.indexOf( ch.passingInput[ch.state] );
						if ( ch.passingInput[ch.state] == '#' )
							valid = 0;
						if ( valid ) {
							var input = ch.passingInput[ch.state].toString();
							console.log( 'sending input ' + input );
							delete  ch.passingInput[ch.state];
						}
					} catch ( e ) {
						console.log( e )
					}
				}
				console.log( 'emit new state' + '  ' + channel.id + '  ' + ch.state );
				//Emit HANDLER FOR NEW STATE
				self.emit( dialPlan[ch.state].handler, channel, client, input, true );

			}
		);

		// Cancel the timeout for the channel
		//function cancelTimeout(channel) {
		//	var timer = timers[channel.id];
		//
		//	if (timer) {
		//		clearTimeout(timer);
		//		delete timers[channel.id];
		//	}
		//}

		// Handler for StasisEnd event
		function stasisEnd( event, channel ) {
			console.log( 'Channel has left the application :', channel.id );

			Channels.deleteChannel( channel.id );
			// clean up listeners
			channel.removeListener( 'ChannelDtmfReceived', dtmfReceived );
			//cancelTimeout(channel);
		}

		client.start( 'myIvr' );
	}
};
util.inherits( start, EventEmitter );
module.exports = { start: start };
