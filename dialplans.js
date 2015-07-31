/**
 * Created by mohammad on 7/29/15.
 */
var DialPlans = [];
DialPlans.Hospital = [];

DialPlans.Hospital['1'] = {
	handler: 'HospitalIntro',
	inputType: 'digit',
	validInput: [1, 2, 3, 4]
};


function getDialPlan(name) {
	return DialPlans[name];
}

module.exports = getDialPlan;