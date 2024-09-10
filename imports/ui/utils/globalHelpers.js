/***** Global UI Helpers which can be used in any template *****/

import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { localsHelpers } from "/imports/helpers/localsHelpers";

//global versionId helper for whole application usage
Template.registerHelper('versionId', function () {
    return Session.get("versionId");
});

//global isAdmin helper for whole application usage
Template.registerHelper('isAdmin', function () {
    return Session.get("userRole") === "Admin";
});


//global isLogin helper for whole application usage
Template.registerHelper('isLogin', function () {
    return Session.get("isLogin");
});

//global userInfo helper for whole application usage
Template.registerHelper('userInfo', function () {
    return Session.get("userInfo");
});


//get any session singular values just by name param
Template.registerHelper('getSessionValue', function (name) {
    return Session.get(`${name}`) || '';
});


//get active resource type for whole application
Template.registerHelper('activeResourceType', function () {
    return Session.get("activeResourceType");
});

//get resource style based on given resourceType params
Template.registerHelper('getResourceStyle', function (activeResourceType) {
    return (Session.get("activeResourceType") === activeResourceType) ? "background: #c0c7d4;" : null;
});

//get resource style based on given resourceType params
Template.registerHelper('getPatientSummary', function (type) {
    let patient;
    if(type === 'local'){
        patient = Session.get('activeLocalPatient')
    } else {
        patient = Session.get('activeRemotePatient')
    }
    if(patient){
        return patient.patientSummary;
    }
});

//get allowed abilities based on selected and dest system
Template.registerHelper('isSaveDestSystemAllowed', function () {
    let isActive = Session.get('isActive');
    let destSystem = isActive === 'local' ? Session.get('remotes') : Session.get('locals');
    if(destSystem){
        return !destSystem[0]?.systems[0]?.abilities?.includes('SAVE');
    }

});

//get opposite patient details for displaying in resource modals (save)
Template.registerHelper('oppositePatientDetail', function (key) {
    let patientDetails;
    if(Session.get('isActive') === 'local'){
        patientDetails = Session.get('activeRemotePatient');
    } else {
        patientDetails = Session.get('activeLocalPatient');
    }
    return patientDetails && patientDetails[key]
});


//Pagination global helpers for patients
Template.registerHelper('nextPage', function () {
    let lastPage = Session.get('patientsPageLimit');
    let nextPage = Session.get('currentPage') + 1;
    // if limit reached just return last page as next page
    if(lastPage === Session.get('currentPage')) {
        nextPage = lastPage
    }
    return nextPage > 0 ? nextPage : 1;
});
Template.registerHelper('multiNext', function () {
    let nextPage = Session.get('patientsPageLimit');
    return nextPage || Session.get('currentPage') + 2;
});

//Pagination global helpers for patients
Template.registerHelper('previousPage', function () {
    let previousPage = Session.get('currentPage') - 1;
    return previousPage > 0 ? previousPage : 1;
});

Template.registerHelper('multiPrevious', function () {
    return 1;
});

Template.registerHelper('morePages', function () {
    return Session.get('patientsPageLimit') > 10;
});

//Pagination global helpers for resources
Template.registerHelper('nextResourcePage', function () {
    let lastPage = Session.get('documentsPageLimit');
    let nextPage = Session.get('currentPage') + 1;
    // if limit reached just return last page as next page
    if(lastPage === Session.get('currentPage')) {
        nextPage = lastPage
    }
    return nextPage > 0 ? nextPage : 1;
});
Template.registerHelper('multiNextResource', function () {
    let nextPage = Session.get('documentsPageLimit');
    return nextPage || Session.get('currentPage') + 2;
});

Template.registerHelper('previousResourcePage', function () {
    let previousPage = Session.get('currentPage') - 1;
    return previousPage > 0 ? previousPage : 1;
});

Template.registerHelper('moreResourcePages', function () {
    return Session.get('documentsPageLimit') > 10;
});

Template.registerHelper('localPracticeName', function () {
    return localsHelpers?.getLocals()[0]?.displayName;
});

Template.registerHelper('notificationCount', function () {
    return Session.get('notificationCount') || 0;
});