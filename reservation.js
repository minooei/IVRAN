/*jshint node:true*/
'use strict';

var ari = require( 'ari-client' );
var util = require( 'util' );
var EventEmitter = require( 'events' ).EventEmitter;
var DialPlan = require( './dialplans' );
var bunyan = require( 'bunyan' );
var clr = require( 'chalk' );
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

//TODO use timer in a convenient way
var timers = {};


//Last Edit :2015-08-07T23:14

//calls from handler to register events before connect to asterisk
var start = function Start() {

	//todo change user pass
	ari.connect( 'http://localhost:8088', 'asterisk', 'asterisk', clientLoaded );

	var self = this;
	//SHARING EventEmitter BETWEEN MODULES
	Channels.setEventEmitter( self );


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

			var channelBundle = Channels.newChannel( channel.id );
			channelBundle.state = '1';
			channelBundle.CallerID = channel.caller.number;
			channelBundle.exten = channel.dialplan.exten;

			//TODO get channel variable to select proper dialPlan
			//channelBundle.dialPlan = DialPlan( 'UniReservation' );
			channelBundle.dialPlan = 'UniReservation'; //saving the name of dialPlan is enough ?

			//log.debug(Channels);
			console.log( clr.green( channelBundle.exten ) );

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
			console.log( clr.blue( 'Channel %s entered %d', channel.name, event.digit ) );

			var channelBundle = Channels.getChannel( channel.id );
			var dialPlan = DialPlan( channelBundle.dialPlan );


			// will be non-zero if valid
			var state = channelBundle.state;
			var valid = ~dialPlan[state].validInput.indexOf( event.digit );


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

		//emit proper handler for new state. Although this handler could moved to
		//handler.js but because client is needed to pass, this handler stays here !
		//its not so bad :)
		self.on( 'onstateChanged', function ( channel ) {

				//TODO convenient log

				var channelBundle = Channels.getChannel( channel.id );
				var dialPlan = DialPlan( channelBundle.dialPlan );

				//Emit HANDLER FOR NEW STATE
				self.emit( dialPlan[channelBundle.state].handler, channel, client );

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
			console.log( clr.red( 'Channel has left the application :', channel.id ) );

			Channels.deleteChannel( channel.id );
			// clean up listeners
			channel.removeListener( 'ChannelDtmfReceived', dtmfReceived );
			//cancelTimeout(channel);
		}

		client.start( 'reservation' );
	}
};
util.inherits( start, EventEmitter );
module.exports = start;
