import "./fhirModal.html";

import { Template } from "meteor/templating";
import { Session } from "meteor/session";

Template.fhirModal.onRendered(function() {
	const searchFhirModal = this.find('#fhirModal');
	const instance = this;
	const parentInstance = instance.view.parentView.templateInstance();

	$(searchFhirModal).on('hidden.bs.modal', function (event) {

		const selectElements = parentInstance.findAll('.inputFindPatient');
		selectElements.forEach(function(selectElement) {
			$(selectElement).val('Select an Option');
		});
	});

});

Template.fhirModal.helpers({
	fhirModalData() {
		return Session.get("fhirModalData");
	},
})
