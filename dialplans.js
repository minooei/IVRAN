/*
 MyIvr
 Copyright (C) 2015  mohammad.minooee<mohammad.minooee@gmail.com>

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License Version 3.
 See the LICENSE file at the top of the source tree.
 */
var DialPlans = {};
DialPlans.UniReservation = {};

//TODO DEFINE GOTO AND NEXT FOR EACH STATE AND ALLOWSKIP{TRUE FALSE}
//TODO MOVE DIALPLAN TO DB
//edit: I have delete inputType property as it was useless.
//Last Edit :2015-08-14T23:01

DialPlans.UniReservation['first'] = {
	handler: 'playMenu',
	goTo: { '1': '11', '2': '12', '3': 'playFiles' },
	validInput: ['1', '2', '3'],
	allowSkip: true,
	sounds: ['sound:press-1', 'sound:or', 'sound:press-2']
};
DialPlans.UniReservation['11'] = {
	handler: '11',
	validInput: ['1', '2'],
	next: '12',
	sounds: ['sound:you-entered', 'digits:1']
};
DialPlans.UniReservation['12'] = {
	handler: '12',
	validInput: ['1', '2'],
	sounds: ['sound:you-entered', 'digits:2']
};
DialPlans.UniReservation['playFiles'] = {
	handler: 'playFiles',
	validInput: ['1', '2'],
	sounds: ['sound:you-entered', 'digits:2']
};
DialPlans.UniReservation['getMobile'] = {
	handler: 'getInput',
	inputLength: 11,
	validInput: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#'],
	sounds: ['sound:you-entered', 'digits:2']
};
function getDialPlan( name ) {
	return DialPlans[name];
}

module.exports = getDialPlan;