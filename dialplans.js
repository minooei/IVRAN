/**
 * Created by mohammad on 7/29/15.
 */
var DialPlans = {};
DialPlans.UniReservation = {};

//TODO DEFINE GOTO AND NEXT FOR EACH STATE AND ALLOWSKIP{TRUE FALSE}

//Last Edit :2015-08-06T00:07

DialPlans.UniReservation['1'] = {
	handler: 'playMenu',
	inputType: 'goTo',
	goTo: { '1': '11', '2': '12', '3': 'playFiles' },
	validInput: [1, 2, 3],
	allowSkip: 1,
	sounds: ['sound:press-1', 'sound:or', 'sound:press-2']
};
DialPlans.UniReservation['11'] = {
	handler: '11',
	inputType: 'digit',
	validInput: [1, 2],
	next: '12',
	sounds: ['sound:you-entered', 'digits:1']
};
DialPlans.UniReservation['12'] = {
	handler: '12',
	inputType: 'digit',
	validInput: [1, 2],
	sounds: ['sound:you-entered', 'digits:2']
};
DialPlans.UniReservation['playFiles'] = {
	handler: 'playFiles',
	inputType: 'digit',
	validInput: [1, 2],
	sounds: ['sound:you-entered', 'digits:2']
};
function getDialPlan( name ) {
	return DialPlans[name];
}

module.exports = getDialPlan;