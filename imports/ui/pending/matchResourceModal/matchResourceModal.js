import "./matchResourceModal.html";

import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { localsHelpers } from "/imports/helpers/localsHelpers";

Template.matchResourceModal.onCreated(function() {
	let url = localsHelpers.getSourceSystemURL() + "SaveQueue/Patient"
	// let url = Session.get("pendingDataURL");
	const authToken = Session.get("headers");
	Meteor.call('getNewData', url, {Authorization: `Bearer ${authToken}`}, (error, result) => {
		if(error){
			console.log('error getting saveQueuePatients', error)
		} else {
			console.log(result.data)
			Session.set('matchingPatientsData', result.data)
		}
	})

})
Template.matchResourceModal.onRendered(function() {
	const matchResourceModal = this.find('#matchResourceModal');
	const instance = this;
	const parentInstance = instance.view.parentView.templateInstance();

	$(matchResourceModal).on('hidden.bs.modal', function (event) {

		// const selectElements = parentInstance.findAll('.inputFindPatient');
		// selectElements.forEach(function(selectElement) {
		// 	$(selectElement).val('Select an Option');
		// });

		event.preventDefault();
	});

})

Template.matchResourceModal.helpers({
	patientMrn() {
		return Session.get("patientMrn");
	},
	fhirModalData() {
		return Session.get("selectedUpdateXML");
	},
	matchingPatientsData() {
		let allPatientsData = Session.get("matchingPatientsData");
		let patientName = Session.get("selectedUpdateInfo")?.subject?.display;
		let patientFirstName = patientName?.split(" ")[0];
		console.log('patient frist Name', patientFirstName)
		allPatientsData = allPatientsData?.filter((data => {
			return data?.patientName?.toLowerCase().includes(patientFirstName?.toLowerCase());
		}))
		return allPatientsData
	},
	selectedPendingResourceName() {
		return Session.get("selectedUpdateInfo")?.resourceType;
	},
})

Template.matchResourceModal.events({
	async 'click .btn-save-patient'(event, instance) {
        event.preventDefault();
		const inputMrn = instance.find('#patientMRN')?.value;
		console.log('input MRN', inputMrn);

		let localURL = Session.get('localURL');
		//default value is localURL
		let destSystemURL = localURL;

		const url = destSystemURL + "Patient";
		const destSystemId = localsHelpers.getSourceSystemID();
		const srcResource = Session.get("selectedUpdateInfo");

		const body = {
			"ResourceType": "Patient",
			"DestPatientId": inputMrn,
			"destSystemId": destSystemId,
			"SrcResource": srcResource
		}
		console.group('Search Patient Modal');
		let destSystemName = destSystemId === `640ba5e3bd4105586a6dda74` ? `remote`: `local`
        console.log('desSystemId', destSystemId, destSystemName);
		console.log("url", url);
		console.log("payload", body);
		console.groupEnd();

		const authToken = Session.get("headers");

		console.log("save button is clicked.");
		// new VERTISOFT-POST header added on custom request
		Meteor.call('savePatientResource', url, body, {
			Authorization: `Bearer ${authToken}`,
			'VERTISOFT-POST': true
		}, (error, result) => {
			if (error) {
				console.log("error", error);
				if (error.reason?.statusCode === "406" || error.reason?.code === "ECONNRESET") {
					alert("Your session has expired, please login");
					Session.set("isLogin", false)
					Session.set("isFindLoading", false)

					FlowRouter.go("/login");
					return ;
				}
				const errorInfo = error?.reason?.response?.data
				alert(errorInfo?.issue[0]?.details?.text)
			} else {
				console.log("result: ", result)
				if (result?.statusCode === 201) {
					const localName = localsHelpers.getLocals()[0]?.displayName
					alert(`Patient successfully imported to ${localName}`)
				} else if (result?.statusCode === 401) {
					alert("Your session has expired, please login");
					FlowRouter.go("/login")
				}
			}
		});
    },
	'click .accept-resource-update' () {
		console.log('I am running');
		Session.set('matchingPatientInfo', this?.resourceData?.resource)
		Session.set('selectedUpdateXML', this?.resourceData?.resource?.text?.div)
		$('#matchResourceModal').modal('hide');
		$('#acceptResourceModal').modal('show');
	},
});

