import "./adjustFiltersModal.html";

import { Template } from "meteor/templating";
import { Session } from "meteor/session";

Template.adjustFiltersModal.onRendered(function() {

});

Template.adjustFiltersModal.helpers({
	adjustFilterMessage() {
		return Session.get("adjustFilterMessage");
	},
})

Template.adjustFiltersModal.events({
	'click #expandResults'() {
		Session.set('adjustFilterDecision', 'expandResults')

	},
	'click #adjustResults'() {
		Session.set('adjustFilterDecision', 'adjustResults')
	},
	'click #acceptResults'() {
		Session.set('adjustFilterDecision', 'acceptResults')
	},
})
