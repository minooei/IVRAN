/**
 * Created by mohammad on 7/29/15.
 */
var DialPlans = {};
DialPlans.UniReservation = {};

//Last Edit :2015-08-03T00:20

DialPlans.UniReservation['1'] = {
	handler: 'UniReservationIntro',
	inputType: 'menuSelect',
	validInput: [1, 2],
	sounds: ['sound:press-1', 'sound:or', 'sound:press-2']
};
DialPlans.UniReservation['11'] = {
	handler: '11',
	inputType: 'digit',
	validInput: [1, 2],
	sounds: ['sound:you-entered', 'digits:1']
};
DialPlans.UniReservation['12'] = {
	handler: '12',
	inputType: 'digit',
	validInput: [1, 2],
	sounds: ['sound:you-entered', 'digits:2']
};

function getDialPlan( name ) {
	return DialPlans[name];
}

module.exports = getDialPlan;