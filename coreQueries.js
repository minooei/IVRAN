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
var EventEmitter = require( 'events' ).EventEmitter;

var mongoose = require( 'mongoose' );
var dbEvent = new EventEmitter;
var DialPlan = require( './dialplans' );

//dbEvent.on( );

module.exports = {

	dynamicQueryHandler: function ( dp, state, data ) {
		var dialPlan = DialPlan[dp];
		try {
			dbEvent.emit( dialPlan[state].query, data );
		} catch ( e ) {
		}

	}

};