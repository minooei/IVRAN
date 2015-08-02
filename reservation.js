/*jshint node:true*/
'use strict';

var ari = require( 'ari-client' );
var util = require( 'util' );
var EventEmitter = require( 'events' ).EventEmitter;
var DialPlan = require( './dialplans' );
var bunyan = require( 'bunyan' );
var clr = require( 'chalk' );

var log = bunyan.createLogger( {
	name: 'myapp',
	streams: [
		{
			level: 'debug',
			path: './reservation.log'  // log ERROR and above to a file
		}
	]
} );

//TODO use timer in a convenient way
var timers = {};

//todo :should be define as global  ?
var Channels = {};
//Last Edit :2015-08-03T00:20
var start = function Start() {

	//todo change user pass
	ari.connect( 'http://localhost:8088', 'asterisk', 'asterisk', clientLoaded );

	var self = this;


	// Handler for client being loaded
	function clientLoaded( err, client ) {
		if ( err ) {
			console.log( clr.red( err ) );
			log.error( err );
			throw err;
		}
		client.on( 'StasisStart', stasisStart );
		client.on( 'StasisEnd', stasisEnd );

		// Handler for StasisStart event
		function stasisStart( event, channel ) {
			console.log( clr.green( 'has entered the application : ', channel.caller.number, channel.id ) );
			log.info( '%s has entered the application id= %s', channel.caller.number, channel.id );

			Channels[channel.id] = {};
			Channels[channel.id].state = '1';
			Channels[channel.id].CallerID = channel.caller.number;
			Channels[channel.id].exten = channel.dialplan.exten;

			//TODO get channel variable to select proper dialPlan
			Channels[channel.id].dialPlan = DialPlan( 'UniReservation' );

			//log.debug(Channels);
			console.log( clr.green( Channels[channel.id].exten ) );

			channel.on( 'ChannelDtmfReceived', dtmfReceived );

			channel.answer( function ( err ) {
				if ( err ) {
					console.log( err );
					log.error( err );
					throw err;
				}
				//Emit first event in dialPlan
				self.emit( Channels[channel.id].dialPlan['1'].handler, channel, client );

			} );
		}


		// Main DTMF handler
		function dtmfReceived( event, channel ) {
			//cancelTimeout(channel);
			var digit = parseInt( event.digit );
			console.log( 'Channel %s entered %d', channel.name, digit );

			// will be non-zero if valid
			var state = Channels[channel.id].state;
			var valid = ~Channels[channel.id].dialPlan[state].validInput.indexOf( digit );

			if ( valid ) {
				//changing state if necessary
				//todo define different inputTypes
				if ( Channels[channel.id].dialPlan[state].inputType === 'menuSelect' ) {
					state = state + event.digit;
					Channels[channel.id].state = state;
				}


				//emit proper event
				self.emit( Channels[channel.id].dialPlan[state].handler, channel, client );

			} else {
				console.log( 'Channel %s entered an invalid option!', channel.name );

				//todo emit invalid press handler of dialPlan
				//for now ignoring invalid input
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

		// Handler for StasisEnd event
		function stasisEnd( event, channel ) {
			console.log( clr.red( 'Channel has left the application :', channel.id ) );

			delete Channels[channel.id];
			// clean up listeners
			channel.removeListener( 'ChannelDtmfReceived', dtmfReceived );
			//cancelTimeout(channel);
		}

		client.start( 'reservation' );
	}
};
util.inherits( start, EventEmitter );
module.exports = start;
