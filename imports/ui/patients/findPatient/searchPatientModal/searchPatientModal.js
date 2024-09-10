import "./searchPatientModal.html";

import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { Session } from "meteor/session";
import { patientHelpers } from '/imports/helpers/patientHelpers';
import { localsHelpers } from "/imports/helpers/localsHelpers";
import { remotesHelpers } from "/imports/helpers/remotesHelpers";
import AppConfiguration from "/imports/utils/configuration";

Template.searchPatientModal.onCreated( function searchModalOnCreated(){
	this.patientMrn = new ReactiveVar("");
	this.patientId = new ReactiveVar("");
	this.isValue = new ReactiveVar("");
	this.codeValue = new ReactiveVar("");
});

Template.searchPatientModal.onRendered(function () {

	let identifierName = $('#identifier-value').find(':selected').text();
	let identifierValue = $('#identifier-value').find(':selected').val();
	Session.set('patientIdentifier',{
		name: identifierName,
		value: identifierValue
	})

	$('#findLastName').focus();

	const searchPatientModal = this.find('#searchPatientModal');

	$(searchPatientModal).on('shown.bs.modal', function (event) {
		Session.set('SearchPatientModalOpen', true)
		$('#findLastName').focus();
		let identifierName = $('#identifier-value').find(':selected').text();
		let identifierValue = $('#identifier-value').find(':selected').val();
		Session.set('patientIdentifier',{
			name: identifierName,
			value: identifierValue
		})
	});

	$(searchPatientModal).on('hidden.bs.modal', function (event) {
		Session.set('SearchPatientModalOpen', false);
		// form.reset();
	});
});

Template.searchPatientModal.helpers({
	isLastName() {
		return Session.get("isLastName");
	},
	isUnique() {
		// return (!!Template.instance().patientMrn.get() || !!Template.instance().patientId.get());
		return (!!Template.instance().patientMrn.get() || !!Template.instance().patientId.get() || !!Template.instance().codeValue.get());
	},
	isMrn() {
		return (!!Template.instance().patientMrn.get());
	},
	isId() {
		return (!!Template.instance().patientId.get());
	},
	canInputMrn() {
		const inputValid = !!Template.instance().patientId.get() || !!Session.get("isLastName")
		return !inputValid;
	},
	canInputId() {
		const inputValid = !!Template.instance().patientMrn.get() || !!Session.get("isLastName")
		return !inputValid;
	},
	patientFilters(type) {
		let patientFilters = Session.get('patientFilters');
		if(patientFilters && patientFilters[0]){
			return patientFilters[0]?.filters || []
		}
	},
	patientIdentifier(type) {
		let patientIdentifier = Session.get('patientIdentifier');
		if(patientIdentifier){
			return patientIdentifier
		}
	}
});

Template.searchPatientModal.events({
	async "submit .search-patient-form"(event, instance) {
		event.preventDefault()
		let modalElement = $('#searchPatientModal');
		modalElement.modal('hide');

		const target = event.target;
		const lastName = target?.lastName?.value?.toLowerCase();
		const firstName = target?.firstName?.value?.toLowerCase();
		const birthday = target?.birthday?.value;
		const id = target?.patientId?.value;
		const codeValue = target?.encounter?.value;
		const identifier = target?.identifier?.value;
		if (!(lastName || firstName) && !codeValue) {
			return;
		}

		Session.set("isFindLoading", true);
		const isActive = Session.get("isActive");
		const authToken = Session.get("headers");
		const remote = remotesHelpers.getRemotes()[0];
		const local = localsHelpers.getLocals()[0];

		const coreUrl = () => {
			if (isActive === "remote") {
				return remote?.systems[0]?.coreUrl;
			} else {
				return local?.systems[0]?.coreUrl;
			}
		}
		let searchPatientQuery = "";
		const buildQuery = () => {
			if(codeValue){
				let patientIdentifier = Session.get('patientIdentifier');
				console.log(patientIdentifier)
				console.log(`Patient?identifier=${identifier}|${codeValue}`)
				return `Patient?identifier=${identifier}|${codeValue}`
			}
			if (id) {
				return `Patient?_id=${id}`;
			} else {
				if (lastName && firstName) {
				   if (!!birthday) {
					   searchPatientQuery = `family=${lastName}&given=${firstName}&birthdate=${birthday}`;
					   
					   return `Patient?${searchPatientQuery}`;
				   } else {
					   searchPatientQuery = `family=${lastName}&given=${firstName}`;
					   
					   return `Patient?${searchPatientQuery}`;
				   }
			   } else {
				   if (!!birthday) {
					   searchPatientQuery = `Patient?family=${lastName}&birthdate=${birthday}`;
					   
					   return `Patient?${searchPatientQuery}`;
				   } else {
					   searchPatientQuery = `family=${lastName}`;
					   
					   return `Patient?${searchPatientQuery}`;
				   }
			   }
			}
		}

		const res = await patientHelpers.getPatients(coreUrl(), buildQuery(), {
			Authorization: `Bearer ${authToken}`,
		})
		console.log("res", res)
		//only update table after verifying new data structure
		if(res?.countInPage){
			let titles = res?.gridHeaderData;
			Session.set('findPatientTableData', {
				titles,
			})
		}

		Session.set("isFindLoading", false)

		if (!res?.countInPage) {
			Session.set('displayPagination', false);
			Session.set("currentPage", '');
			modalElement.modal('show');
		} else {
			Session.set('displayPagination', true);
		}

		if (isActive === "remote") {
            if (res?.bundleId) {
                Session.set("remoteSavedData", {
                    cache: {
                        id: res?.queryId,
                        pageNumber: res?.pageNumber,
                        totalPages: res?.totalPages,
                        countInPage: res?.countInPage,
                    },
					query: searchPatientQuery
                })
            } else {
                Session.set("remoteSavedData", null)
				Session.set('displayPagination', false);
            }
		}  else {
            
            if (res?.bundleId) {
            Session.set("localSavedData", {
                patients: res?.resources,
                cache: {
                    id: res?.queryId,
                    pageNumber: res?.pageNumber,
                    totalPages: res?.totalPages,
                    countInPage: res?.countInPage,
                },
				query: searchPatientQuery,
            })
            } else {
                Session.set("localSavedData", null)
				Session.set('displayPagination', false);
            }
		}
		// add a condition that if return resources is limited (< totalPages) it will not call cache status
		let totalPages = AppConfiguration.TOTAL_Pages;
		if(res?.countInPage >= totalPages) {
			patientHelpers.getCachedPatientsStatus(coreUrl(), res?.queryId, {
				Authorization: `Bearer ${authToken}`,
			})
		} else {
			if(res?.countInPage){
				patientHelpers.getCachedPatientsByPageNumber(1)
			}
		}
		return false
	},
    'click .reset': function (event, instance) {
		event.preventDefault()
        Session.set("remoteSavedData", null)
        Session.set("localSavedData", null)
		Session.set("isLastName", false);
		instance.find('#findLastName').value = '';
		instance.find('#findFirstName').value = '';
		instance.find('[name="birthday"]').value = '';
		instance.find('#type').value = '';
		instance.codeValue.set("");
		// instance.find('#patient-mrn').value = '';
    },
	'input #findLastName'(event, instance) {
		const lastName = event.target.value;
		// Do something with the new value
		if (!!lastName) {
			Session.set("isLastName", true);
		} else {
			Session.set("isLastName", false);
		}
	},
	'input #patient-mrn'(event, instance) {
		const patientMrn = event.target.value;
		if (!!patientMrn) {
			instance.patientMrn.set(patientMrn);
		} else {
			instance.patientMrn.set("");
		}
	},
	'input #patient-id'(event, instance) {
		const patientId = event.target.value;
		if (!!patientId) {
			instance.patientId.set(patientId);
		} else {
			instance.patientId.set("");
		}
	},
	'input #findFirstName'(event, instance) {
		const firstName = event.target.value;
		
		if (!!firstName) {
			instance.isValue.set(firstName);
		} else {
			instance.isValue.set("");
		}
	},
	'input #type'(event, instance) {
		const codeValue = event.target.value;
		console.log('CodeValue', codeValue)
		if (!!codeValue) {
			instance.codeValue.set(codeValue);
		} else {
			instance.codeValue.set("");
		}
	},
	'input #birthday'(event, instance) {
		const birthDay = event.target.value;
		if (!!birthDay) {
			instance.isValue.set(birthDay);
		} else {
			instance.isValue.set("");
		}
	},
	'change #identifier-value'(event, instance) {
		let identifierName = $('#identifier-value').find(':selected').text();
		let identifierValue = $('#identifier-value').find(':selected').val();
		Session.set('patientIdentifier',{
			name: identifierName,
			value: identifierValue
		})
	}
});