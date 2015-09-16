/*
 MyIvr
 Ivr with node-ari
 Copyright (C) 2015 mohammad.minooee email:mohammad.minooee@gmail.com

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

'use strict';

//states for call

DialPlans.UniReservation['first'] = {
	handler: 'dbQuery',
	query: 'newUser',
	next: 'playInternal'
};

DialPlans.UniReservation['playInternal'] = {
	handler: 'playFiles',
	validInput: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#'],
	allowSkip: true,
	next: 'getInternal',
	sounds: ['sound:fa/internal']
};
DialPlans.UniReservation['getInternal'] = {
	handler: 'getInput',
	variable: 'internal',
	next: 'mainMenu',
	inputLength: 3,
	query: 'selectTeacher',
	validInput: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#']
};

DialPlans.UniReservation['mainMenu'] = {
	handler: 'playMenu',
	goTo: { '1': 'playFiles1', '2': 'playFiles2111', '3': 'playFiles3' },
	validInput: ['1', '2', '3'],
	allowSkip: true,
	sounds: ['sound:fa/main']
};

DialPlans.UniReservation['playFiles1'] = {
	handler: 'playFiles',
	allowSkip: true,
	validInput: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#'],
	next: 'playFreeTime',
	sounds: ['sound:fa/week']
};
DialPlans.UniReservation['playFreeTime'] = {
	handler: 'playFreeTime',
	validInput: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#'],
	allowSkip: true,
	query: 'getFreeTime',
	next: 'mainMenu',
	sounds: []
};

DialPlans.UniReservation['playFiles2111'] = {
	handler: 'playFiles',
	allowSkip: true,
	validInput: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#'],
	next: 'getMobile',
	sounds: ['sound:fa/mobile']
};
DialPlans.UniReservation['getMobile'] = {
	handler: 'getInput',
	variable: 'mobile',
	inputLength: 11,
	next: 'playFiles2',
	query: 'saveUserMobile',
	validInput: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#']
};
DialPlans.UniReservation['playFiles2'] = {
	handler: 'playFiles',
	validInput: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#'],
	next: 'getMonth',
	allowSkip: true,
	sounds: ['sound:fa/month']
};
DialPlans.UniReservation['getMonth'] = {
	handler: 'getInput',
	validInput: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#'],
	inputLength: 2,
	variable: 'month',
	next: 'playFiles21'
};
DialPlans.UniReservation['playFiles21'] = {
	handler: 'playFiles',
	validInput: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#'],
	allowSkip: true,
	next: 'getDay',
	sounds: ['sound:fa/day']
};
DialPlans.UniReservation['getDay'] = {
	handler: 'getInput',
	validInput: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#'],
	inputLength: 2,
	variable: 'day',
	next: 'playFiles211'
};
DialPlans.UniReservation['playFiles211'] = {
	handler: 'playFiles',
	allowSkip: true,
	validInput: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#'],
	next: 'getHour',
	sounds: ['sound:fa/hour']
};
DialPlans.UniReservation['getHour'] = {
	handler: 'getInput',
	validInput: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#'],
	inputLength: 2,
	variable: 'hour',
//	query: 'saveRequest',
	next: 'saveRequest'
};

DialPlans.UniReservation['playFiles3'] = {
	handler: 'playFiles',
	validInput: ['#'],
	allowSkip: true,
	next: 'recordVoice',
	sounds: ['sound:fa/message']
};
DialPlans.UniReservation['recordVoice'] = {
	handler: 'recordVoice',
	validInput: ['#'],
	next: 'saveRequest',
	fileName: 'req'
};
DialPlans.UniReservation['saveRequest'] = {
	handler: 'dbQuery',
	query: 'saveRequest',
	next: 'sendEmail'
};
DialPlans.UniReservation['sendEmail'] = {
	handler: 'sendEmail',
	next: 'mainMenu'
};

function getDialPlan( name ) {
	return DialPlans[name];
}

module.exports = getDialPlan;