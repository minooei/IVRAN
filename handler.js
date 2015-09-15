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
var JDate = require( 'jalali-date' );

var nodemailer = require( 'nodemailer' );

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport( {
	service: 'Gmail',
	auth: {
		user: 'mohammad.minooee@gmail.com',
		pass: 'lplnhakh1'
	}
} );

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols

var Grid = require( 'gridfs-stream' ), fs = require( 'fs' );
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
				if ( newState )
					Channels.setChannelProperty( channel, 'state', newState );
			} // if skip not allowed ignore input
		}
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

				//Passing input to next handler
				var newState = dialPlan[ch.state].next;
				ch.passingInput[newState] = input;
				if ( newState )
					Channels.setChannelProperty( channel, 'state', newState );

			} // if skip not allowed ignore input
		}
	}
);

handler.on( 'playFreeTime', function ( channel, client, input, isFirst ) {

		//TODO convenient log
		var ch = Channels.getChannel( channel.id );
		var dialPlan = DialPlan( ch.dialPlan );

		function sortTimes( a, b ) {

			if ( a.dayNumber < b.dayNumber || a.dayNumber == 6 )
				return -1;
			else if ( a.dayNumber == b.dayNumber )
				return 0;
			else return 1;
		}

		if ( isFirst ) {
			coreQuery.dynamicQueryHandler( ch, ch.variables.teacherId, function ( result ) {
					for ( var i = 0; i < result.length; i++ ) {
						var today = new JDate();
						var left = [5, 4, 3, 2, 1, 0, 6];
						var day = 86400000;
						if ( result[i].date ) {
							var s = result[i].date.split( '/' );
							var date = new JDate( [s[0], s[1], s[2]] );
							if ( !result[i].weekly ) {
								var t = today.getTime();
								var r = date.getTime();
								if ( r < t || r > t + day * left[today.getDay()] ) {
									continue;
								}
							}
							result[i].dayNumber = date.getDay();

							//if ( result[i].dayNumber == 7 )
							//	result[i].dayNumber = 0;
						}
					}
					result.sort( sortTimes );
					//console.log( result )
					dialPlan[ch.state].sounds = [];
					for ( var i = 0; i < result.length; i++ ) {
						var dName = Methods.getDayName( result[i].dayNumber );
						dialPlan[ch.state].sounds.push( 'sound:fa/' + dName );
						dialPlan[ch.state].sounds.push( 'sound:fa/' + result[i].fromHour.toString() );
						dialPlan[ch.state].sounds.push( 'sound:fa/' + 'to' );
						dialPlan[ch.state].sounds.push( 'sound:fa/' + result[i].toHour.toString() );
					}
					Methods.playMenu( channel, client, dialPlan[ch.state] )
				}
			);
		}
		if ( input ) {
			if ( dialPlan[ch.state].allowSkip || ( !ch.isPlaying ) ) {

				//Passing input to next handler
				var newState = dialPlan[ch.state].next;
				if ( newState )
					Channels.setChannelProperty( channel, 'state', newState );

			} // if skip not allowed ignore input
		}
	}
)
;

//TODO : COMPLETE THIS HANDLER GET NUMBER (X)
handler.on( 'getInput', function ( channel, client, input, isFirst ) {

		//TODO convenient log
		console.log( 'start handler for getInput ' + channel.id );
		var ch = Channels.getChannel( channel.id );
		var dialPlan = DialPlan( ch.dialPlan );
		var len = dialPlan[ch.state].inputLength;
		if ( isFirst )
			ch.variables[ch.state] = '';
		if ( input ) {
			if ( input == '#' ) { //if user terminates input
				try {
					ch.variables[dialPlan[ch.state].variable] = ch.variables[ch.state];
				} catch ( e ) {
				}
				coreQuery.dynamicQueryHandler( ch, ch.variables[ch.state], function () {
					if ( dialPlan[ch.state].next )
						Channels.setChannelProperty( channel, 'state', dialPlan[ch.state].next );
				} );
				return;
			}

			ch.variables[ch.state] += input;
			console.log( ch.variables[ch.state] );

			if ( ch.variables[ch.state].length == len ) {//if input has finished
				try {
					ch.variables[dialPlan[ch.state].variable] = ch.variables[ch.state];
				} catch ( e ) {
				}
				//var data={};
				//data[dialPlan[ch.state].variable ]= ch.variables[ch.state];
				coreQuery.dynamicQueryHandler( ch, ch.variables[ch.state], function () {
					if ( dialPlan[ch.state].next )
						Channels.setChannelProperty( channel, 'state', dialPlan[ch.state].next );
				} );
			}
		}
	}
);

handler.on( 'dbQuery', function ( channel, client, input, isFirst ) {

		var ch = Channels.getChannel( channel.id );
		var dialPlan = DialPlan( ch.dialPlan );

		//TODO convenient log
		console.log( 'start handler for dbQuery ' + channel.id );

		coreQuery.dynamicQueryHandler( ch, ch.variables[ch.state], function () {
			if ( dialPlan[ch.state].next )
				Channels.setChannelProperty( channel, 'state', dialPlan[ch.state].next );
		} );
	}
);

handler.on( 'recordVoice', function ( channel, client, input, isFirst ) {

		//TODO convenient log
		var ch = Channels.getChannel( channel.id );
		var dialPlan = DialPlan( ch.dialPlan );
		dialPlan[ch.state].fileName = channel.id.toString().split( '.' )[0];
		if ( isFirst ) {
			Methods.recordVoice( channel, client, dialPlan[ch.state] )
		}

	}
);
handler.on( 'sendEmail', function ( channel, client, input, isFirst ) {

		//TODO convenient log
		var ch = Channels.getChannel( channel.id );
		var dialPlan = DialPlan( ch.dialPlan );
		var mailOptions = {
			from: 'mohammad.minooee@gmail.com', // sender address
			to: 'minooee.mohammad@yahoo.com', // list of receivers
			subject: 'new request ✔', // Subject line
			text: 'Hello world ✔', // plaintext body
			html: '<b>Hello world ✔</b>' // html body
		};
		if ( isFirst ) {
			transporter.sendMail( mailOptions, function ( error, info ) {
				if ( error ) {
					console.log( error );
				} else {
					console.log( 'Message sent: ' + info.response );
				}
				if ( dialPlan[ch.state].next )
					Channels.setChannelProperty( channel, 'state', dialPlan[ch.state].next );
			} );
		}

	}
);