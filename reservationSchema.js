/*
 MyIvr
 Ivr with node-ari
 Copyright (C) 2015 mohammad.minooee email:mohammad.minooee@gmail.com

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License Version 3.
 See the LICENSE file at the top of the source tree.
 */

var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var usersSchema = new Schema( {
	phoneNumber: String

} );
var requestsSchema = new Schema( {
	user: { type: ObjectId, ref: 'users' },
	responder: { type: ObjectId, ref: 'administrators' },
	request: String,
	status: { type: String, default: 'waiting' },
	date: { type: Date, default: Date.now }

} );

//do we need call records?
//var callRecordsSchema = new Schema( {
//	user: { type: ObjectId, ref: 'users' },
//	phoneNumber: String,
//	date: { type: Date, default: Date.now }
//} );

var administratorsSchema = new Schema( {
	userName: String,
	userId: Number,
	password: String,
	gender: Boolean,
	role: String,
	university: String,

	mobile: { type: String, trim: true },
	telephone: { type: String, trim: true },
	email: { type: String, lowercase: true, trim: true }

	//free_times: [{
	//	date: Date,
	//	times: [{
	//		day_of_week: {
	//			type: String,
	//			enum: {
	//				values: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
	//				message: 'enum validator failed for path day_of_week with value `{VALUE}`'
	//			}
	//		},
	//		from: String,
	//		to: String
	//	}]
	//}],
} );

module.exports = (function () {
	var _return = {};
	//mongoose.model(collectionName,schemaName);
	_return.users = mongoose.model( 'users', usersSchema );
	_return.administrators = mongoose.model( 'administrators', administratorsSchema );
	_return.requests = mongoose.model( 'requests', requestsSchema );
	return _return;
})();