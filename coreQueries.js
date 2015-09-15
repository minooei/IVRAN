/**
 * Created by mohammad on 8/25/15.
 */
/*
 MyIvr
 Ivr with node-ari
 Copyright (C) 2015 mohammad.minooee email:mohammad.minooee@gmail.com

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License Version 3.
 See the LICENSE file at the top of the source tree.
 */
'use strict';
var EventEmitter = require( 'events' ).EventEmitter;
var JDate = require( 'jalali-date' );

var mongoose = require( 'mongoose' );
var db = require( './reservationSchema' );

var dbEvent = new EventEmitter;
var DialPlan = require( './dialplans' );

module.exports = {

	dynamicQueryHandler: function ( channel, data, callback ) {
		var dialPlan = DialPlan( channel.dialPlan );
		var state = channel.state;
		if ( dialPlan[state].query ) {
			dbEvent.emit( dialPlan[state].query, channel, data, callback );
		} else {
			callback();
		}
	}

};
//TODO PASSING CALL BACK FUNCTION HERE
dbEvent.on( 'newUser', function ( ch, data, callback ) {
	db.users.findOne( { phoneNumber: ch.callerId }, function ( err, u ) {
		if ( err ) {
			console.log( err );
		}
		if ( u ) {
			ch.variables.userId = u._id;
			console.log( u._id );
			if ( typeof callback === "function" ) {
				callback( u );
			}
			return;
		}
		var user = new db.users( { phoneNumber: ch.callerId } );
		user.save( function ( err, u ) {
				if ( err ) {
					console.log( err );
				}
				ch.variables.userId = user._id;
				if ( typeof callback === "function" ) {
					callback( u );
				}
			}
		);
	} );
} );
dbEvent.on( 'saveUserMobile', function ( ch, data, callback ) {
	db.users.findById( ch.variables.userId, function ( err, user ) {
		if ( err ) {
			console.log( err );
		}
		if ( user ) {
			user.mobileNumber = data;
			user.save( function ( err ) {
				if ( err ) {
					console.log( err );
				}
			} );
		}
		if ( typeof callback === "function" ) {
			callback( user );
		}
	} );

} );

dbEvent.on( 'saveRequest', function ( ch, data, callback ) {
	var type = 'text', reqFile, request;

	if ( ch.variables.recordFileId ) {
		type = 'file';
		reqFile = ch.variables.recordFileId;
	} else {
		//var date = new JDate( [1394, ch.variables.month, ch.variables.day] )._d;
		//date.setHours( ch.variables.hour );
		//request = date.getTime();
		request = '1394-' + ch.variables.month + '-' + ch.variables.day + ':' + ch.variables.hour;
	}
	new db.requests( {
		user: ch.variables.userId,
		responder: ch.variables.teacherId,
		type: type,
		requestTime: request,
		file: reqFile
	} ).save( function ( err, req ) {
			if ( err ) {
				console.log( err );
			}
			try {
				delete    ch.variables.month;
				delete    ch.variables.day;
				delete    ch.variables.hour;
				delete    ch.variables.recordFileId;
			} catch ( e ) {
			}
			if ( typeof callback === "function" ) {
				callback( req );
			}
		} );

} );
dbEvent.on( 'selectTeacher', function ( ch, data, callback ) {
	db.administrators.findOne( { internal: data }, function ( err, teacher ) {
		if ( err ) {
			console.log( err );
		}
		if ( teacher ) {
			ch.variables.teacherId = teacher._id;
		}
		if ( typeof callback === "function" ) {
			callback( teacher );
		}
	} );
} );

dbEvent.on( 'getFreeTime', function ( ch, teacherId, callback ) {
	db.administrators.findById( teacherId, function ( err, data ) {
		if ( err ) {
			console.log( 'db error: ' + err );
			if ( typeof callback === "function" ) {
				callback( data );
			}
			return;
		}
		if ( data ) {
			if ( typeof callback === "function" ) {
				callback( data.free_times );
			}
		}
	} );
} );