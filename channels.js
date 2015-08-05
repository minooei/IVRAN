/**
 * Created by mohammad on 8/3/15.
 */
var EventEmitter = require( 'events' ).EventEmitter;
var util = require( 'util' );

var eventEmitter;
var Channels = {};

module.exports = {

	getEventEmitter: function () {
		return eventEmitter;
	},
	setEventEmitter: function ( em ) {
		eventEmitter = em;
	},
	getChannel: function ( id ) {
		return Channels[id];
	},

	setChannelProperty: function ( id, key, value ) {
		Channels[id][key] = value;
		if ( key == 'state' ) {
			//emit state change handler
			//eventEmitter.emit
		}

	},

	newChannel: function ( id ) {
		Channels[id] = {};
		return Channels[id];
	},

	deleteChannel: function ( id ) {
		delete    Channels[id];
	}
};