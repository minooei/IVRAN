/*
 MyIvr
 Ivr with node-ari
 Copyright (C) 2015 mohammad.minooee email:mohammad.minooee@gmail.com

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License Version 3.
 See the LICENSE file at the top of the source tree.
 */

'use strict';
var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var dbURI = 'mongodb://localhost/astDB';

//TODO MOVE TO STARTER MODULE
mongoose.connect( dbURI );
var db = mongoose.connection;

// CONNECTION EVENTS
// When successfully connected
db.on( 'connected', function () {
	console.log( 'Mongoose default connection open to ' + dbURI );
} );
// If the connection throws an error
db.on( 'error', function ( err ) {
	console.log( 'Mongoose default connection error: ' + err );
} );
// When the connection is disconnected
db.on( 'disconnected', function () {
	console.log( 'Mongoose default connection disconnected' );
} );

//process.on( 'SIGINT', function () {
//	mongoose.connection.close( function () {
//		console.log( 'Mongoose default connection disconnected through app termination' );
//		process.exit( 0 );
//	} );
//} );

var usersSchema = new Schema( {
	phoneNumber: String,
	userId: String,
	mobileNumber: String
} );

var requestsSchema = new Schema( {
	user: { type: ObjectId, ref: 'users' },
	responder: { type: ObjectId, ref: 'administrators' },
	type: String,
	request: String,
	file: Buffer,
	status: { type: String, default: 'waiting' },
	date: { type: Date, default: Date.now() }
} );

var administratorsSchema = new Schema( {
	userName: String,
	userId: Number,
	password: String,
	gender: Boolean,
	role: String,
	university: String,

	mobile: { type: String, trim: true },
	telephone: { type: String, trim: true },
	email: { type: String, lowercase: true, trim: true },

	free_times: [{
		date: String,
		fromHour: Number,
		toHour: Number,
		comment: String
	}]

} );

module.exports = {

	//mongoose.model(collectionName,schemaName);
	users: mongoose.model( 'users', usersSchema ),
	administrators: mongoose.model( 'administrators', administratorsSchema ),
	requests: mongoose.model( 'requests', requestsSchema )

};