import "./findPatient.html";
import '/imports/ui/common/fhirModal/fhirModal';
import './savePatientModal/savePatientModal';
import './searchPatientModal/searchPatientModal';

import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { Session } from "meteor/session";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Meteor } from "meteor/meteor";
import { alertHelpers } from "/imports/helpers/alertHelpers";
import { patientHelpers } from "/imports/helpers/patientHelpers";
import { systemHelpers } from "/imports/helpers/systemHelpers";


Template.findPatient.onCreated(function findPatientOnCreated() {
	this.headers = new ReactiveVar("");
	Session.set("isLastName", false);
});

Template.findPatient.onRendered(function findPatientOnRendered() {
	systemHelpers.getSystemSummary();
});

Template.findPatient.helpers({
	displayPagination() {
		return Session.get("displayPagination");
	},
	tableTitles() {
		return Session.get("findPatientTableData")?.titles?.filter(data => data.type !== 'data') || [];
	},
	tableData() {
		if(!Session.get("SearchPatientModalOpen")) {
			if(Session.get('isActive') === 'local'){
				return Session.get("localSavedData")?.patients || [];
			} else {
				return Session.get("remoteSavedData")?.patients || [];
			}
		}
	},
	getFieldData(index, fieldName) {
		let fullData = [];
		if(Session.get('isActive') === 'local'){
			fullData = Session.get("localSavedData")?.patients;
		} else {
			fullData = Session.get("remoteSavedData")?.patients;
		}
		if(fullData && fullData[index]){
			let currentField = fullData[index]?.entrySummary?.elements?.find(((element) => {
				return element?.name === fieldName;
			}));
			// add fallback values for new structure
			if(!currentField && fullData[index]?.patientMetaData){
				return fullData[index]?.patientMetaData[fieldName]
			}
			return currentField?.value;
		}
	},
	headers() {
		return Session.get("headers");
	},
	remoteSavedData() {
		return Session.get("remoteSavedData")?.patients;
	},
	localSavedData() {
		return Session.get("localSavedData")?.patients;
	},
	isFindLoading() {
		return Session.get("isFindLoading");
	},
	isActiveRemote() {
		return (Session.get("isActive") === "remote" && Session.get("remoteSavedData")?.patients);
	},
	isActiveLocal() {
		return (Session.get("isActive") === "local" && Session.get("localSavedData")?.patients);
	},
	searchPatientQuery() {
		if (Session.get("isActive") === "remote") {
			return Session.get("remoteSavedData")?.query;
		} else {
			return Session.get("localSavedData")?.query;
		}
	},
	getActiveLocalPatient() {
		return Session.get("currentPatientID") === this?.resource?.id;

	},
	getActiveRemotePatient() {
		return Session.get("currentPatientID") === this?.resource?.id;
	},
	totalPages() {
		// here we are getting total pages from env variable or default to 3 pages
		// fallback value added so if env variable not defined it's default value will be 10
		// let TOTAL_PAGES = AppConfiguration.TOTAL_Pages;
		let TOTAL_PAGES = 10;
		let totalPages = 2
		let statusPageCount = Session.get('patientsPageLimit') || 3;
		if(!Session.get('patientsPageLimit')){
			totalPages = 2;
		}
		if(statusPageCount > TOTAL_PAGES){
			totalPages = TOTAL_PAGES;
		} else {
			totalPages = statusPageCount;
		}

		let patients = [];
		if (Session.get("isActive") === "remote") {
			patients = Session.get("remoteSavedData")?.patients;
		} else {
			patients = Session.get("localSavedData")?.patients;
		}
		if(!patients?.length) {
			totalPages = 0
		}
		if(Session.get('currentPage') === 1 && patients?.length < 10){
			totalPages = 1
		}
		// below is the last page we get from cached results (example 11)
		let lastPage = Session.get('patientsPageLimit');
		let currentPage = Session.get('currentPage');
		if(totalPages > 0) {
			// default index is 0 + 1 = 1
			let addIndex = 1
			// only apply this logic if result are more than 5 pages
			if(currentPage > 5) {
				// if the remaining pages are more than 5 then just shift the current page in center in pagination
				if(lastPage - (currentPage) >= 5){
					if(Session.get('currentPage') > 5) {
						addIndex = Session.get('currentPage') - 5
					}
				} else {
					// otherwise do nothing as result are already < 10 (less than total display numbers in pagination)
					addIndex = lastPage - 9 > 0 ? lastPage - 9 : addIndex
				}
			}
			return Array.from({ length: totalPages }, (value, index) => {
				return index + addIndex
			});
		} else return []
	},
	selectedPage() {
		let page = Number(this);
		return Session.get('currentPage') === page ? 'active' : '';
	},
	totalPageNumbers() {
		return Session.get('patientsPageLimit') || 0
	},
	currentPage() {
		return Session.get('currentPage') || ''
	},
	PatientsIsCaching() {
		return Session.get('PatientsIsCaching') || ''
	},
})

Template.findPatient.events({
	'change .inputFindPatient'(event, instance) {
		// Get select element
		const select = event.target;
		// Get selected value
		const value = select.value;
		console.log("value", value);
		let { patient } = this;
		console.log("click---", patient);
		Session.set("selectedPatientInfo", patient);
		Session.set("patientMrn", patient.id);
		Session.set("fhirModalData", patient.text.div);
		// Handle based on entry and value

		if(value === 'View FHIR') {
			const data = JSON.stringify(patient, null, 2)
			Session.set("fhirModalData", data);
			console.log('Viewing details for:', patient);

			$('#fhirModal').modal('show');
		} else if(value === 'Save Patient') {
			console.log('Viewing details for:', patient);

			$('#savePatientModal').modal('show');
		} else if (value === 'Show Resource') {
			$('#showResourceModal').modal('show');
		}
		else if (value === 'See Related Documents') {
			//now call the setActivePatient
			setActivePatient(patient);
		}
		else if (value === 'View Patient') {
			Session.set('viewPatientData', this?.patientMetaData)
			$('#viewPatient').modal('show');
		}
	},
	'change input[name="select-patient"], click .textRawPatient' (event, instance) {
		//below is the patient on which user clicked
		let { patient } = this;
		//TODO: if data is finalized than improve below click exclude condition
		if(event.target.tagName === 'SELECT'){
			return;
		}

		//now call the setActivePatient
		setActivePatient(patient);
	},

	'click .btn-show-search-modal' (event, instance) {
		$('#searchPatientModal').modal('show');
	},

	async 'click .goToPage' (event, instance) {
		let pageNumberElement = event?.target?.nextElementSibling;
		let pageNumberValue = pageNumberElement?.value;
		if(!pageNumberValue){
			return
		}
		let pageNumber = Number(pageNumberValue);
		patientHelpers.getCachedPatientsByPageNumber(pageNumber)
	},
	async 'click .page-item' (event, instance) {
		let pageNumber = Number(event?.target?.dataset?.value);
		patientHelpers.getCachedPatientsByPageNumber(pageNumber)
	},
	'keyup .custom-page-number' (event, instance) {
		if (event.keyCode === 13) {
			$(event?.target?.previousElementSibling).trigger('click')
		}
	}
});

function setActivePatient (patient) {
	console.group('SetActivePatientCall');
	console.group('serverCall');
	let coreURL = Session.get("coreURL");
	const url = Session.get("coreURL") + "ActivePatient";
	let body = {
		resourceType : "Patient",
		destSystemId: coreURL,
		srcResource: patient
	}
	console.log('calling method vs url', url)
	console.log('and body is', body)
	console.groupEnd()

	//get the user Active token from session
	const authToken = Session.get("headers");
	try {
		alertHelpers.showLoading();
		Meteor.call('setActivePatient', url, body, {Authorization: `Bearer ${authToken}`}, (error, result) => {
			alertHelpers.stopLoading();

			if (error) {
				console.log("error", error);
				const errorInfo = error?.reason?.response?.data
				alert("ERROR !" + errorInfo?.resourceType + "\n" + errorInfo?.issue[0]?.details?.text)
			} else {
				console.log("result: ", result)
				let { patientMRN, patientId, patientSummary, patientName, patientDOB} = result?.data;
				let activePatient = result?.data;
				let summaryRecord = {
					data: activePatient,
					patientId,
					patientName: patientName,
					patientDOB,
					patientMRN,
					patientSummary: patientSummary?.replaceAll(';', " -")
				}
				Session.set('currentPatientInfo', summaryRecord);

				//save both (remote/local) Session values to display both at once
				if(Session.get('isActive') === 'local'){
					patientHelpers.setActiveLocalPatient(summaryRecord);
				} else {
					patientHelpers.setActiveRemotePatient(summaryRecord);
				}
				const route = `/current-patient/${patientId}`
				FlowRouter.go(route);
			}

		});
	} catch (error) {
		console.log(error)
		alertHelpers.supportAlert();
	}
	console.groupEnd();
}
