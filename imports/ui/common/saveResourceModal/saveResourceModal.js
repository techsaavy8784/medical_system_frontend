import './saveResourceModal.html';

import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { localsHelpers } from "/imports/helpers/localsHelpers";


Template.saveResourceModal.onCreated(function resourceOnCreated(){
    Session.set("showDocSaveModal", false);
    Session.set("showDocFhirModal", false);
    Session.set("showXMLModal", false);
});

Template.saveResourceModal.onRendered( function () {
    const modalElement = this.find('#saveResourceModal');

    const instance = this;
    const parentInstance = instance.view.parentView.templateInstance();
    $(modalElement).on('hidden.bs.modal', function (event) {
        const selectElements = parentInstance.findAll('.inputFindDoc');
        selectElements.forEach(function(selectElement) {
            $(selectElement).val('Select an Option');
        });

        Session.set("showDocSaveModal", false);
        Session.set("showDocFhirModal", false);
        Session.set("showXMLModal", false);

        Session.set("emptyPdfData", false);
        Session.set("emptyXmlData", false);
    });
});

Template.saveResourceModal.helpers({
    showDocSaveModal() {
        return Session.get("showDocSaveModal");
    },
    saveDocModalData() {
        return Session.get("saveDocModalData");
    },
    showDocFhirModal() {
        return Session.get("showDocFhirModal");
    },
    showXMLModal() {
        return Session.get("showXMLModal");
    },
    fhirDocModalData() {
        return Session.get("fhirDocModalData");
    },
    docXMLModalData() {
        return Session.get("docXMLModalData");
    },
    patientMrn() {
        return Session.get("currentPatientID")
    },
    patientID() {
        return Session.get("currentPatientID")
    }
});

Template.saveResourceModal.events({
    async 'click .save-doc-data'(event, instance) {
        event.preventDefault();
        const canSave = Session.get("showDocSaveModal");

        let destSystemURL = localsHelpers.getdestSystemURL();

        const url = destSystemURL + "Patient";
        const patientId = Session.get("currentPatientID");
        const patientName = Session.get("currentPatientName");
        const activeResourceType = Session.get("activeResourceType");
        const destSystemId = localsHelpers.getdestSystemId();
        const srcResource = Session.get("selectedDoc")?.resource;
        const srcResourceId = Session.get("selectedDoc")?.resource.id;
        const body = {
            "resourceType": activeResourceType,
            "destPatientId": patientId,
            "destPatientName": patientName,
            "destSystemId": destSystemId,
            "srcSystemId": localsHelpers.getSrcSystemId(),
            "srcResourceId": srcResourceId,
            "SrcResource": srcResource
        }
        console.log("payload", body);
        const authToken = Session.get("headers");
        if (canSave) {
            console.log("save button is clicked.");
            Meteor.call('savePatientResource', url, body, {Authorization: `Bearer ${authToken}`}, (error, result) => {
                if (error) {
                    console.log("error", error);
                    const errorInfo = error?.reason.response?.data
                    alert("ERROR !" + errorInfo.resourceType + "\n" + errorInfo.issue[0]?.details?.text);
                } else {
                    console.log("result: ", result)
                    const localName = localsHelpers.getLocals()[0]?.displayName
                    alert(`Resource successfully imported to your ${localName}`)
                }
            });
        }
    }
})
