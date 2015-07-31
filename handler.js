/**
 * Created by mohammad on 7/30/15.
 */
var Handler = require('./reservation.js');

var handler = new Handler();
handler.on('HospitalIntro', function (ChannelId) {
		console.log('HospitalIntro ' + ChannelId);
	}
);