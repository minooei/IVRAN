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

var start = function Start() {

	//todo change user pass
	ari.connect( 'http://localhost:8088', 'asterisk', 'asterisk', clientLoaded );
	//var ChannelsEventEmitter=new EventEmitter();
	var self = this;
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
			channelBundle.dialPlan = DialPlan( 'UniReservation' );


			//log.debug(Channels);
			console.log( clr.green( channelBundle.exten ) );

			channel.on( 'ChannelDtmfReceived', dtmfReceived );

			channel.answer( function ( err ) {
				if ( err ) {
					console.log( err );
					log.error( err );
					throw err;
				}
				//Emit first event in dialPlan
				self.emit( channelBundle.dialPlan['1'].handler, channel, client );

			} );
		}


		// Main DTMF handler
		function dtmfReceived( event, channel ) {
			//cancelTimeout(channel);
			var digit = parseInt( event.digit );
			console.log( 'Channel %s entered %d', channel.name, digit );

			var channelBundle = Channels.getChannel( channel.id );


			// will be non-zero if valid
			var state = channelBundle.state;
			var valid = ~channelBundle.dialPlan[state].validInput.indexOf( digit );

			//TODO CHANGE STATE ONLY IN HANDLER

			if ( valid ) {
				//changing state if necessary
				//todo define different inputTypes
				if ( channelBundle.dialPlan[state].inputType === 'menuSelect' ) {
					state = state + event.digit;
					channelBundle.setChannelProperty( channel.id, 'state', state );
				}


				//emit proper event
				self.emit( Channels[channel.id].dialPlan[state].handler, channel, client );

			} else {
				console.log( 'Channel %s entered an invalid option!', channel.name );

				//todo emit invalid press handler of dialPlan
				//for now ignoring invalid input
			}
		}

		self.on( 'ChannelPropertyChanged', function ( channel, client ) {

				//TODO convenient log
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
