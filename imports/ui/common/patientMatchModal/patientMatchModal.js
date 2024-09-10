import "./patientMatchModal.html";
import { Session } from "meteor/session";
import { logHelpers } from "/imports/helpers/logHelpers";
Template.patientMatchModal.onCreated(function() {
    Session.set('patientOverRideConfirmed', false);
})

Template.patientMatchModal.helpers({
    values: () => Session.get("matchFailedValues"),
    patientMatchModalTitle() {
        let sourcePatient, destPatient;
        if(Session.get("isActive") === "local"){
            sourcePatient = Session.get('activeLocalPatient');
            destPatient = Session.get('activeRemotePatient');
        } else {
            sourcePatient = Session.get('activeRemotePatient');
            destPatient = Session.get('activeLocalPatient');
        }
        let activeResourceType = Session.get('activeResourceType');
        return `Please Override if ${destPatient?.patientName} is to receive ${sourcePatient?.patientName}'s ${activeResourceType}`
    },
    separator (index)  {
        let matchFailedValues = Session.get("matchFailedValues");
        if(index > 0 && index < matchFailedValues?.length - 2){
            if (index % 2 === 1) {
                return '<hr>'
            }
        }
    }
})

Template.patientMatchModal.events({
    'click .cancel-match-modal' (event) {
        Session.set('patientOverRideConfirmed', false);
        $('#patientMatchModal').modal('hide');
    },
    'click .override-changes' (event) {
        Session.set('patientOverRideConfirmed', true);
        logHelpers.logAction("override", "User overrides the patient details which do not match");
        $('#patientMatchModal').modal('hide');
    }
})