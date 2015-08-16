/**
 * Created by mohammad on 8/3/15.
 */
var EventEmitter = require( 'events' ).EventEmitter;
var util = require( 'util' );
//Last Edit :2015-08-06T00:06
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

	setChannelProperty: function ( channel, key, value ) {
		//todo validating value
		Channels[channel.id][key] = value;
		eventEmitter.emit( 'on' + key + 'Changed', channel );
	},

	newChannel: function ( id ) {
		Channels[id] = {};
		return Channels[id];
	},

	deleteChannel: function ( id ) {
		delete Channels[id];
	}
};