import './CareTeamSaveModal.html';

import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { localsHelpers } from "/imports/helpers/localsHelpers";


Template.CareTeamSaveModal.onCreated(function resourceOnCreated(){
    Session.set("showDocSaveModal", false);
    Session.set("showDocFhirModal", false);
    Session.set("showXMLModal", false);
});

Template.CareTeamSaveModal.onRendered( function () {
    const modalElement = this.find('#CareTeamSaveModal');

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

Template.CareTeamSaveModal.helpers({
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

Template.CareTeamSaveModal.events({
    async 'click .save-doc-data'(event, instance) {
        event.preventDefault();
        const canSave = Session.get("showDocSaveModal");

        let destSystemURL = localsHelpers.getdestSystemURL();
        const activeResourceType = Session.get("activeResourceType");

        const url = destSystemURL + activeResourceType;
        const patientId = Session.get("currentPatientID");
        const patientName = Session.get("currentPatientName");
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
        console.group(Session.get("activeResourceType"))
        let destSystemName = destSystemId === `640ba5e3bd4105586a6dda74` ? `remote`: `local`
        console.log('desSystemId', destSystemId, destSystemName)
        console.log('URL', url)
        console.log("payload", body);
        console.groupEnd();
        const authToken = Session.get("headers");
        if (canSave) {
            console.log("save button is clicked.");
            Meteor.call('saveDocumentResource', url, body, {Authorization: `Bearer ${authToken}`}, (error, result) => {
                if (error) {
                    console.log("error", error);
                    console.log("ERROR !" + error?.reason?.message);
                } else {
                    console.log("result: ", result)
                    const localName = localsHelpers.getLocals()[0]?.displayName
                    alert(`Resource successfully imported to your ${localName}`)
                }
            });
        }
    }
})
