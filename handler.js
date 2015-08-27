/*
 MyIvr
 Ivr with node-ari
 Copyright (C) 2015 mohammad.minooee email:mohammad.minooee@gmail.com

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License Version 3.
 See the LICENSE file at the top of the source tree.
 */
'use strict';

var Handler = require( './myIvr.js' ).start;
var Methods = require( './methods.js' );
var DialPlan = require( './dialplans' );
var Bunyan = require( 'bunyan' );
var Channels = require( './channels' );
var coreQuery = require( './coreQueries' );
var db = require( './reservationSchema' );

var handler = new Handler();

//TODO: ONE HANDLER TO ROLE THEM ALL ?
//Last Edit :2015-08-14T23:12

//use when playing menu that has implicit goto
handler.on( 'playMenu', function ( channel, client, input, isFirst ) {

		//TODO convenient log
		var ch = Channels.getChannel( channel.id );
		var dialPlan = DialPlan( ch.dialPlan );

		if ( isFirst ) {
			Methods.playMenu( channel, client, dialPlan[ch.state] )
		}
		else if ( input ) {
			if ( dialPlan[ch.state].allowSkip || ( !ch.isPlaying ) ) {
				var newState = dialPlan[ch.state].goTo[input];
				Channels.setChannelProperty( channel, 'state', newState );
			} // if skip not allowed ignore input
		}
	}
);
handler.on( '11', function ( channel, client, input, isFirst ) {

		//TODO convenient log
		var dialPlan = DialPlan( 'UniReservation' );
		Methods.playMenu( channel, client, dialPlan['11'] )
	}
);
handler.on( '12', function ( channel, client, input, isFirst ) {

		//TODO convenient log

		var dialPlan = DialPlan( 'UniReservation' );
		Methods.playMenu( channel, client, dialPlan['12'] )
	}
);

//TODO : test it !
//this handler is much like "playMenu" but the difference is that it does not accept input. if skip allowed, input must pass to next handler
handler.on( 'playFiles', function ( channel, client, input, isFirst ) {

		//TODO convenient log
		var ch = Channels.getChannel( channel.id );
		var dialPlan = DialPlan( ch.dialPlan );

		if ( isFirst ) {
			Methods.playMenu( channel, client, dialPlan[ch.state] )
		}

		if ( input ) {
			if ( dialPlan[ch.state].allowSkip || ( !ch.isPlaying ) ) {
				var newState = dialPlan[ch.state].next;

				//Passing input to next handler
				ch.passingInput[newState] = input;
				Channels.setChannelProperty( channel, 'state', newState );

			} // if skip not allowed ignore input
		}
	}
);

//TODO : COMPLETE THIS HANDLER GET NUMBER (X)
handler.on( 'getInput', function ( channel, client, input, isFirst ) {

		//TODO convenient log
		var ch = Channels.getChannel( channel.id );
		var dialPlan = DialPlan( ch.dialPlan );
		var len = dialPlan[ch.state].inputLength;

		if ( input ) {
			if ( input == '#' ) { //if user terminates input
				coreQuery.dynamicQueryHandler( ch.dialPlan, ch.state, ch.variables[ch.state] );
				Channels.setChannelProperty( channel, 'state', dialPlan[ch.state].next );
			}

			ch.variables[ch.state] += input;

			if ( ch.variables[ch.state].length == len ) {//if input has finished
				coreQuery.dynamicQueryHandler( ch.dialPlan, ch.state, ch.variables[ch.state] );
				Channels.setChannelProperty( channel, 'state', dialPlan[ch.state].next );
			}
		}
	}
);

