/**
 * Created by mohammad on 7/30/15.
 */
'use strict';

var Handler = require( './reservation.js' );
var Methods = require( './methods.js' );
var DialPlan = require( './dialplans' );
var Bunyan = require( 'bunyan' );
var Color = require( 'chalk' );

var handler = new Handler();

//Last Edit :2015-08-03T00:20


handler.on( 'UniReservationIntro', function ( channel, client ) {

		//TODO convenient log

		var dialPlan = DialPlan( 'UniReservation' );
		Methods.playMenu( channel, client, dialPlan['1'] )
	}
);
handler.on( '11', function ( channel, client ) {

		//TODO convenient log

		var dialPlan = DialPlan( 'UniReservation' );
		Methods.playMenu( channel, client, dialPlan['11'] )
	}
);
handler.on( '12', function ( channel, client ) {

		//TODO convenient log

		var dialPlan = DialPlan( 'UniReservation' );
		Methods.playMenu( channel, client, dialPlan['12'] )
	}
);



