/**
 * Created by mohammad on 7/30/15.
 */
'use strict';

var Handler = require( './reservation.js' );
var Methods = require( './methods.js' );
var DialPlan = require( './dialplans' );
var Bunyan = require( 'bunyan' );
var Color = require( 'chalk' );
var Channels = require( './channels' );

var handler = new Handler();


//TODO: ONE HANDLER TO ROLE THEM ALL
//Last Edit :2015-08-06T00:05
//TODO: TWO MAIN HANDLER : PLAY file , GET NUMBER (X)


//use when playing menu that has implicit goto
handler.on( 'playMenu', function ( channel, client, input ) {

		//TODO convenient log
		var ch = Channels.getChannel( channel.id );
		var dialPlan = DialPlan( ch.dialPlan );

		if ( input ) {
			if ( dialPlan[ch.state].allowSkip || ( !ch.isPlaying ) ) {
				var newState = dialPlan[ch.state].goTo[input];
				Channels.setChannelProperty( channel, 'state', newState );
			} // if skip not allowed ignore input
		} else {
			Methods.playMenu( channel, client, dialPlan[ch.state], dialPlan[ch.state].allowSkip )
		}
	}
);
handler.on( '11', function ( channel, client, input ) {

		//TODO convenient log
		// TODO HOW TO CHANGE STATE ?
		var dialPlan = DialPlan( 'UniReservation' );
		Methods.playMenu( channel, client, dialPlan['11'] )
	}
);
handler.on( '12', function ( channel, client, input ) {

		//TODO convenient log

		var dialPlan = DialPlan( 'UniReservation' );
		Methods.playMenu( channel, client, dialPlan['12'] )
	}
);


//TODO : COMPLETE THIS HANDLER
//this handler is like playMenu but the difference is that it does not accept input. if skip allowed input must pass to next handler
handler.on( 'playFiles', function ( channel, client, input ) {

		//TODO convenient log
		var ch = Channels.getChannel( channel.id );
		var dialPlan = DialPlan( ch.dialPlan );


		//Emit HANDLER FOR NEW STATE
		handler.emit( dialPlan['12'].handler, channel, client );
		//Methods.playMenu( channel, client, dialPlan['12'] )
	}
);



