/**
 * Created by mohammad on 7/29/15.
 */
var DialPlans = {};
DialPlans.Hospital = {};

DialPlans.Hospital['1'] = {
	handler: 'HospitalIntro',
	inputType: 'digit',
	validInput: [1, 2],
	sounds: ['sound:press-1', 'sound:or', 'sound:press-2']
};


function getDialPlan(name) {
	return DialPlans[name];
}

module.exports = getDialPlan;