import "./viewPatient.html";

import { Template } from "meteor/templating";
import { Session } from "meteor/session";

Template.viewPatient.onRendered(function() {
	const searchviewPatient = this.find('#viewPatient');
	const instance = this;
	const parentInstance = instance.view.parentView.templateInstance();

	$(searchviewPatient).on('hidden.bs.modal', function (event) {

		const selectElements = parentInstance.findAll('.inputFindPatient');
		selectElements.forEach(function(selectElement) {
			$(selectElement).val('Select an Option');
		});
	});

});

Template.viewPatient.helpers({
	viewPatientData() {
		let viewPatientData = Session.get("viewPatientData");
		if(viewPatientData){
			return Object.keys(viewPatientData).map(key => {
				return {
					name: key,
					value: viewPatientData[key] ? viewPatientData[key] : '-'
				}
			})
		}
		return []
	},
})
