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

	dynamicQueryHandler:function (channel, dp, state, data) {
		var dialPlan = DialPlan( channel.dialPlan );
		try {
			dbEvent.emit( dialPlan[ state ].query, channel, data );
		} catch ( e ) {
		}

	}

};

dbEvent.on( 'newUser', function (ch, data) {
	db.users.findOne( { phoneNumber:ch.callerId }, function (err, u) {
		if ( err ) {
			console.log( err );
		}
		if ( u ) {
			ch.variables.userId = u._id;
			console.log( u._id );
			return;
		}
		var user = new db.users( { phoneNumber:ch.callerId } );
		user.save( function (err) {
				if ( err ) {
					console.log( err );
				}
				ch.variables.userId = user._id;
			}
		);
	} );
} );
dbEvent.on( 'saveUserMobile', function (ch, data) {
	db.users.findById( ch.variables.userId, function (err, user) {
		if ( err ) {
			console.log( err );
		}
		if ( user ) {
			user.mobileNumber = data;
			user.save( function (err) {
				if ( err ) {
					console.log( err );
				}
			} );
		}
	} );

} );

dbEvent.on( 'saveRequest', function (ch, data) {
	var type = 'text', reqFile, request;

	if ( ch.variables.recordFileId ) {
		type = 'file';
		reqFile = ch.variables.recordFileId;
	} else {
		//var date = new JDate( [1394, ch.variables.month, ch.variables.day] )._d;
		//date.setHours( ch.variables.hour );
		//request = date.getTime();
		request = '1394-' + ch.variables.month + '-' + ch.variables.day + '-' + ch.variables.hour;
	}
	new db.requests( {
		user:ch.variables.userId,
		responder:ch.variables.teacherId,
		type:type,
		requestTime:request,
		file:reqFile
	} ).save( function (err) {
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
		} );

} );
dbEvent.on( 'selectTeacher', function (ch, data) {
	db.administrators.findOne( { internal:data }, function (err, teacher) {
		if ( err ) {
			console.log( err );
		}
		if ( teacher ) {
			ch.variables.teacherId = teacher._id;
		}
	} );
} );