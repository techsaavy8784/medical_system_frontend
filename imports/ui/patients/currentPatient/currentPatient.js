import './currentPatient.html';
import '/imports/ui/common/sidebar/sidebar';
import '/imports/ui/common/pdfModal/pdfModal';
import '/imports/ui/common/saveResourceModal/saveResourceModal';
import '/imports/ui/common/searchResourceModal/SearchResourceModal';

import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { resourceHelpers } from "/imports/helpers/resourceHelpers";
import { logHelpers } from "/imports/helpers/logHelpers";


const showPdfModal = async (data) => {
    console.log("emptyPdfData", Session.get("emptyPdfData"));
    if (Session.get("isFindingDoc")) return
    let pdfUrl = "";
    const authToken = Session.get("headers");
    const coreURL = Session.get("coreURL");

    if(data?.metaData?.pdfImage){
        pdfUrl = `${coreURL}${data?.metaData?.pdfImage}`
    } else {
        Session.set("emptyPdfData", true);
        $('#docPdfModal').modal('show');
        return;
    }
    Session.set("isFindingDoc", true);

    console.log("pdfUrl", pdfUrl);

    const requestOption  = { Authorization: `Bearer ${authToken}` };

      return new Promise(function (resolver, reject) {
        Meteor.call(
            "getPdfXml",
            pdfUrl,
            requestOption,
            (error, result) => {
                if (error) {
                    console.log("getPdfError", error);
                    reject(error);
                } else if (result?.statusCode === 200) {
                    console.log("getPdf", result);

                    const base64Data = atob(result?.data?.binary?.data);

                        const uint8Array = new Uint8Array(base64Data.length);
                        for (let i = 0; i < base64Data.length; i++) {
                            uint8Array[i] = base64Data.charCodeAt(i);
                        }
                        const blob = new Blob([uint8Array], { type: 'application/pdf' });
                        const pdfDataUrl = URL.createObjectURL(blob);
                        Session.set("pdfDataUrl", pdfDataUrl);
                        Session.set("isFindingDoc", false);
                        Session.set("emptyPdfData", false);
                        $('#docPdfModal').modal('show');
                } else {
                    Session.set("isFindingDoc", false);
                    Session.set("emptyPdfData", true);
                    $('#docPdfModal').modal('show');
                }
            }
        )
    }).catch((error) => {

    });
}

const showXmlModal = async (data) => {
    
    let xmlUrl = "";
    const authToken = Session.get("headers");

    if(data && data?.entrySummary?.elements){
        let XMLElement = data?.entrySummary?.elements?.find(((element) => {
            return element?.name === "xmlImage";
        }));
        xmlUrl = XMLElement?.url
    } else {
        Session.set("emptyXmlData", true);
        $('#saveResourceModal').modal('show');
        return;
    }
    Session.set("isFindingDoc", true);
            
    console.log("xmlUrl", xmlUrl);
    
    const requestOption  = { Authorization: `Bearer ${authToken}` };

      return new Promise(function (resolver, reject) {
        Meteor.call(
            "getPdfXml",
            xmlUrl,
            requestOption,
            (error, result) => {
                if (error) {
                    console.log("getXmlError", error);
                    reject(error);
                } else if (result?.statusCode === 200) {
                    console.log("getXml", result);
                    
                    const base64Data = result?.data?.rawResource?.data;
                    if (base64Data) {
                      const decodedData = atob(base64Data);
                      const parser = new DOMParser();
                      const xmlData = parser.parseFromString(decodedData, "application/xml");
                      const xmlString = new XMLSerializer().serializeToString(xmlData);
                      const xmlStringify = JSON.stringify(xmlString, null, 2)
                      console.log("xmlData", xmlStringify);
                      Session.set("docXMLModalData", xmlStringify);
                      Session.set("isFindingDoc", false);
                      Session.set("showXMLModal", true);
                      $('#saveResourceModal').modal('show');
                      return xmlStringify
                    }
                } else {
                    Session.set("isFindingDoc", false);
                    Session.set("emptyXmlData", true);
                    $('#saveResourceModal').modal('show');
                }
            }
        )
    }).catch((error) => {

    });

}

Template.currentPatient.onCreated(function currentPatientOnCreated() {
    Session.set("isFindingDoc", false);
    Session.set("filterCount", "10");
});

Template.currentPatient.onRendered( function (){
    Session.set("executeFinding", false);
    //if patient not selected just return to find patients templates
    if(!Session.get('currentPatientSelected')){
        FlowRouter.redirect('/find-patient');
    }
});

Template.currentPatient.helpers({
    getFieldData(index, fieldName) {
        let fullData = [];
        if(Session.get('isActive') === 'local'){
            fullData = Session.get("getLocalPatientDocs")?.documents;
        } else {
            fullData = Session.get("getPatientDocs")?.documents;
        }
        if(fullData && fullData[index]){
            if(fullData[index]?.metaData){
                return fullData[index]?.metaData[fieldName]
            }
        }
    },
    tableTitles() {
        if(Session.get('isActive') === 'local'){
            return Session.get("getLocalPatientDocs")?.headerData.filter(data => data.type !== 'data') || [];
        } else {
            return Session.get("getPatientDocs")?.headerData.filter(data => data.type !== 'data') || [];
        }
    },
    destSystemName() {
        if(Session.get('isActive') === 'local'){
            return 'Remote EMR';
        }
        return 'My EMR';

    },
    currentPatientSelected() {
        return Session.get("currentPatientSelected");
    },
    isFindingDoc() {
        return Session.get("isFindingDoc");
    },
    currentPatientDocs() {
        if(Session.get('isActive') === 'local'){
            return Session.get("getLocalPatientDocs")?.documents;
        } else {
            return Session.get("getPatientDocs")?.documents;
        }
    },
    emptySearchDocs() {
        return !Session.get("emptyDocResult");
        // if(Session.get('isActive') === 'local'){
        //     return !Session.get("getLocalPatientDocs")?.documents?.length;
        // } else {
        //     return !Session.get("getPatientDocs")?.documents?.length;
        // }
    },
    resourceId() {
        return Template.instance().data.resourceId;
    },
    startDate() {
        return Session.get("startDate");
    },
    endDate() {
        return Session.get("endDate");
    },
    searchResult() {
        // return Session.get("searchResult");
        return Session.get("executeFinding");
    },
    executeFinding() {
        return Session.get("executeFinding");
    },
    isUpdatedResourceType() {
        return true
        // let activeResourceType = Session.get('activeResourceType');
        // let updatedResourceTypes = ['DocumentReference', 'DiagnosticReport'];
        // return updatedResourceTypes.includes(activeResourceType);
    },
    getTextDiv() {
        let activeResourceName = Session.get('activeResourceName');
        console.log(activeResourceName)
        if(this[activeResourceName]){
            return this[activeResourceName].text?.div;
        }
    },
    totalPages() {
        // here we are getting total pages from env variable or default to 3 pages
        // fallback value added so if env variable not defined it's default value will be 10
        // let TOTAL_PAGES = AppConfiguration.TOTAL_Pages;
        let TOTAL_PAGES = 10;
        let totalPages = 2
        let statusPageCount = Session.get('documentsPageLimit') || 3;
        if(!Session.get('documentsPageLimit')){
            totalPages = 2;
        }
        if(statusPageCount > TOTAL_PAGES){
            totalPages = TOTAL_PAGES;
        } else {
            totalPages = statusPageCount;
        }

        let patients = [];
        if (Session.get("isActive") === "remote") {
            patients = Session.get("getPatientDocs")?.documents;
        } else {
            patients = Session.get("localSavedData")?.documents;
        }
        if(!patients?.length) {
            totalPages = 0
        }
        if(Session.get('currentPage') === 1 && patients?.length < 10){
            totalPages = 1
        }
        // below is the last page we get from cached results (example 11)
        let lastPage = Session.get('documentsPageLimit');
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
    displayPagination() {
        return Session.get("displayPagination");
    },
    selectedPage() {
        let page = Number(this);
        return Session.get('currentPage') === page ? 'active' : '';
    },
    totalPageNumbers() {
        return Session.get('documentsPageLimit') || 0
    },
    currentPage() {
        return Session.get('currentPage') || ''
    },
    PatientsIsCaching() {
        return Session.get('DocumentsIsCaching') || ''
    },

});

Template.currentPatient.events({
    async 'click #textRawDoc' (event, instance) {
        //TODO: if data is finalized than improve below click exclude condition
        if(event.target.tagName === 'SELECT'){
            return;
        }
        await showPdfModal(this);
    },
    async 'change .inputFindDoc'(event, instance) {
        // Get select element
        const select = event.target;
        // Get selected value
        const value = select?.value;
		console.log("value", value);
        console.log("selectedDoc", this);
        // TODO: update it ASAP (when data sources available for major types)
        let resourceType = 'documentReference';
        if(Object.keys(this).includes('documentReference')){
            resourceType = 'documentReference';
        } else if(Object.keys(this).includes('diagnosticReport')){
            resourceType = 'diagnosticReport';
        } else {
            resourceType = Session.get('activeResourceName')
        }
        console.log('THIS.......', this)
        console.log('resourceType.......', resourceType)
        let resourceName = alternativeNames(resourceType)
        console.log('resourceName', resourceName)
        Session.set("selectedDoc", {
            resource: this[resourceName]
        });
        // Handle based on entry and value
        if(value === 'FHIR') {
            logHelpers.logAction("FHIR", "User Viewed the FHIR Resource");
			const data = JSON.stringify(this, null, 2);

			Session.set("fhirDocModalData", data);
            Session.set("showDocFhirModal", true);
			console.log('Viewing details for:', this);
			
		  $('#saveResourceModal').modal('show');
        } else if(value === 'save-resource') {
            logHelpers.logAction("Save-Resource", "User Click on 'Save Resource'");
            // check that opposite system patient selected/exists or not
            let patientDetails;
            if(Session.get('isActive') === 'local'){
                patientDetails = Session.get('activeRemotePatient');
            } else {
                patientDetails = Session.get('activeLocalPatient');
            }
            if(!patientDetails){
                alert('Please Select the patient for local system');
                return;
            }

            //Extra Checks added as per ticket #186882040
            const res = await resourceHelpers.matchPatientDetails();
            if(!res){
                return;
            }
			Session.set("showDocSaveModal", true);
            // Session.set("saveDocModalData", this.text.div);
			Session.set("saveDocModalData", Session.get('selectedDoc')?.resource.div);
            resourceHelpers.openActiveResourceModal('Save');
        } else if (value === "Show PDF") {
            logHelpers.logAction("Show-PDF", "User Viewed the PDF Resource");
            showPdfModal(this);
        } else if (value === "Show XML") {
            logHelpers.logAction("Show-XML", "User Viewed the XML Resource");
          showXmlModal(this);
        
        }
        
    
    },
    'click .btn-show-search-doc-modal' (event, instance) {
        // systemHelpers.getSystemSummary();
        resourceHelpers.openActiveResourceModal('Search');
        // $("#SearchResourceModal").modal("show");
    },
    async 'click .goToPage' (event, instance) {
        let pageNumberElement = event?.target?.nextElementSibling;
        let pageNumberValue = pageNumberElement?.value;
        if(!pageNumberValue){
            return
        }
        let pageNumber = Number(pageNumberValue);
        resourceHelpers.getCachedDocumentsByPageNumber(pageNumber)
    },
    async 'click .page-item' (event, instance) {
        let pageNumber = Number(event?.target?.dataset?.value);
        resourceHelpers.getCachedDocumentsByPageNumber(pageNumber)
    },
    'keyup .custom-page-number' (event, instance) {
        if (event.keyCode === 13) {
            $(event?.target?.previousElementSibling).trigger('click')
        }
    }
});

const alternativeNames = function(resourceType) {
    if(resourceType === "documentReference") {
        return 'docRef';
    } else if(resourceType === "diagnosticReport") {
        return 'diagRept';
    }
    else {
        return resourceType;
    }
}
