import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { remotesHelpers } from "/imports/helpers/remotesHelpers";
import { localsHelpers } from "/imports/helpers/localsHelpers";
import { alertHelpers } from "/imports/helpers/alertHelpers";

/***** all common helpers related to resources will be added here *****/

//param modalType ('Save' | 'Search')
//param resetForm (true | false)
export const resourceHelpers = {
    openActiveResourceModal(modalType, resetForm) {
        let activeResourceType = Session.get("activeResourceType");
        //if activeResourceType not selected alert about it
        if(!activeResourceType){
            alert('Please Select Resource Type');
            return;
        }
        // console.log(activeResourceType)
        // console.log(`#${activeResourceType}${modalType}Modal`)
        $(`#${activeResourceType}${modalType}Modal`).modal("show");
        if(resetForm) {
            Meteor.setTimeout(() => {
                const modalElement = $.find(`#${activeResourceType}${modalType}Modal`);
                    $(modalElement).find('form').trigger('reset');
            }, 0)
        }
    },

    resourceDetails(key) {
        let resource = Session.get("activeResourceType")?.resource;
        if(resource){
            return resource[key];
        }

    },

    async getCachedDocuments(coreUrl, queryId, pageNumber, pageSize, headers) {
        // example query/66194f68c1d1e625887664d7/CachedPatientPage
        let docsCachePageURL = Session.get("documentsCachePageURL");
        // add fallback value too until testing complete for all use cases
        let cachedDocumentsFullURL = `${coreUrl}${docsCachePageURL}?page=${pageNumber}&limit=${pageSize}`;
        console.log('test', cachedDocumentsFullURL)
        return new Promise(function (resolver, reject) {
            console.log("cached-documentURL", cachedDocumentsFullURL);
            Meteor.call(
                "getCachedResults",
                cachedDocumentsFullURL,
                headers,
                (error, result) => {
                    if (error) {
                        console.log("errorFinding", error)
                        if (error.error?.response?.statusCode === 401) {
                            alert("Your session has expired, please login");
                            Session.set("isLogin", false)
                            Session.set("isFindLoading", false)

                            FlowRouter.go("/login");
                        }
                        Session.set("isFindLoading", false)
                        reject(error)
                        // return error;
                    } else {
                        console.log("success: ", result)
                        if (Session.get("isActive") === "remote") {
                            if (result?.status === 200 && result?.message === " No resources found") {

                                resolver(result)
                            } else {
                                resolver(result)
                            }
                        } else {
                            if (result?.statusCode === 404) {
                                resolver(result)

                            } else {
                                resolver(result)
                            }
                        }
                        Session.set("isFindLoading", false)
                    }
                }
            )
        }).catch((error) => {
            console.log("errorFinding", error)
        })
    },

    async getCachedDocumentsStatus(coreUrl, queryId, headers) {
        Session.set('DocumentsIsCaching', true);
        let documentsCacheStatusUrl = Session.get("documentsCacheStatusUrl");
        console.log('Cache status URL', `${coreUrl}${documentsCacheStatusUrl}`)
            await Meteor.call(
                "getCachedResults",
                `${coreUrl}${documentsCacheStatusUrl}`,
                headers,
                (error, result) => {
                    console.log('STATUSS', result?.data?.status)
                    Session.set('docsPageLimit', result?.data?.pageCount || 3)
                    if(error || result?.data?.status === 'finished' || result?.data?.status !== 'caching'){
                        Session.set('DocumentsIsCaching', false);
                        if(!Session.get('currentPage')){
                            resourceHelpers.getCachedDocumentsByPageNumber(1)
                        }
                    } else {
                        Session.set('docsPageLimit', result?.data?.pageCount || 3)
                        console.log('cached documents result', result)
                        console.log('cached documents status', result?.data?.status)
                        console.log('STATUS NOT FINISHED so initiating interval function')
                        initiateInterval();
                    }
                    if(error){
                        console.log('error in getting cached documents status', error)
                    }
                }
            )

        function initiateInterval() {
            let interValRequestTime = 1500 // 1.5 second
            Session.set('DocumentsIsCaching', true);
            let documentsCacheStatusUrl = Session.get("documentsCacheStatusUrl");
            console.log('Cache status URL', `${coreUrl}${documentsCacheStatusUrl}`)
            let statusInterval = Meteor.setInterval(() => {
                Meteor.call(
                    "getCachedResults",
                    `${coreUrl}${documentsCacheStatusUrl}`,
                    headers,
                    (error, result) => {
                        Session.set('docsPageLimit', result?.data?.pageCount || 3)
                        if(error || result?.data?.status === 'finished' || result?.data?.status !== 'caching'){
                            Meteor.clearInterval(statusInterval)
                            Session.set('DocumentsIsCaching', false);
                            if(!Session.get('currentPage')){
                                resourceHelpers.getCachedDocumentsByPageNumber(1)
                            }
                        }
                        if(error){
                            console.log('error in getting cached documents status', error)
                        } else {
                            Session.set('docsPageLimit', result?.data?.pageCount || 3)
                            console.log('cached documents result', result)
                            console.log('cached documents status', result?.data?.status)
                        }
                    }
                )
            }, interValRequestTime)
        }
    },

    async matchPatientDetails(){
        return new Promise(function (resolver, reject) {
            let matchedFailed = false;
            let matchFailedValues = [];
            //Extra Checks added as per ticket #186882040
            let activeRemotePatient = Session.get('activeRemotePatient');
            let activeLocalPatient = Session.get('activeLocalPatient');
            if(!(activeLocalPatient && activeRemotePatient)){
                return;
            }
            //local and remote patient name check
            if(activeLocalPatient?.patientName !== activeRemotePatient?.patientName){
                matchedFailed = true;
                matchFailedValues.push(
                    { text: `Save to Patient Name is :  ${activeLocalPatient?.patientName}`},
                    { text: `Source Patient Name is :  ${activeRemotePatient?.patientName}`}
                );
            }

            //local and remote patient DOB check
            if(activeLocalPatient?.patientDOB !== activeRemotePatient?.patientDOB){
                matchedFailed = true;
                matchFailedValues.push(
                    { text: `Save to Patient DOB is :  ${activeLocalPatient?.patientDOB}`},
                    { text: `Source Patient DOB is :  ${activeRemotePatient?.patientDOB}`}
                );
            }

            if(matchedFailed){
                Session.set('matchFailedValues', matchFailedValues)
                $('#patientMatchModal').modal('show');
                let backgroundCheckInterval = Meteor.setInterval(()=> {
                    if(!($('#patientMatchModal').is(':visible'))){
                        let decision = Session.get('patientOverRideConfirmed');
                        decision ? resolver(true) : resolver(false);
                        clearInterval(backgroundCheckInterval)
                    }
                }, 1000)
            } else {
                resolver(true)
            }
        })
    },

    async adjustFiltersConfirmation(message){
        return new Promise(function (resolver, reject) {
            let matchedFailed = false;
            Session.set("adjustFilterMessage", message);
            //local and remote patient DOB check

            if(message){
                $('#adjustFiltersModal').modal('show');
                let backgroundCheckInterval = Meteor.setInterval(()=> {
                    if(!($('#adjustFiltersModal').is(':visible'))){
                        let decision = Session.get('adjustFilterDecision');
                        resolver(decision)
                        clearInterval(backgroundCheckInterval)
                    }
                }, 1000)
            } else {
                resolver(true)
            }
        })
    },

    getCacheNames () {
        return {
            DocumentReference: 'vsDocRefs',
            DiagnosticReport: 'vsDiagRepts',
            Observation: 'vsObservations',
            Condition: 'vsConditions',
            Immunization: 'vsImmunizations',
            QuestionnaireResponse: 'vsQuestionnaireResponses',
            Procedures: 'vsProcedures',
        }
    },

    async getCachedDocumentsByPageNumber (pageNumber) {
    // if it's same page do nothing
    if(pageNumber === Session.get('currentPage')){
        return false;
    } else if(isNaN(pageNumber) || pageNumber < 0 || pageNumber > Session.get('documentsPageLimit')){
        alert('Please Enter Correct Page Number')
        return false;
    }
    let queryId;
    if (Session.get("isActive") === "remote") {
        queryId = Session.get('getPatientDocs').cache.id;
    } else {
        queryId = Session.get('getLocalPatientDocs').cache.id;
    }
    const authToken = Session.get("headers");
    const remote = remotesHelpers.getRemotes()[0];
    const local = localsHelpers.getLocals()[0];
    const isActive = Session.get("isActive");
    const coreUrl = () => {

        if (isActive === "remote") {
            return remote?.systems[0]?.coreUrl;
        } else {
            return local?.systems[0]?.coreUrl;
        }
    }
    let res = await resourceHelpers.getCachedDocuments(coreUrl(), queryId, pageNumber, 10, {
        Authorization: `Bearer ${authToken}`,
    })
    console.log("res of cached Documents different from original API response????", res)
    if(!res){
        Session.set("executeFinding", true);
        alertHelpers.supportAlert();
        return
    }

    Session.set("isFindLoading", false)

    if (!res?.countInPage) {
        Session.set('emptyDocResult', true)
    } else {
        Session.set('emptyDocResult', false)
    }

    let activeResourceName = Session.get("activeResourceType");
    let currentCacheType = resourceHelpers.getCacheNames()[activeResourceName];

    if (isActive === "remote") {

        if (res?.data[currentCacheType]?.length) {
            let remoteSaveData = Session.get('getPatientDocs');
            remoteSaveData.documents = res?.data[currentCacheType];
            remoteSaveData.cache.pageNumber = pageNumber;
            // update page css active class locally
            Session.set("currentPage", pageNumber);
            Session.set("getPatientDocs", remoteSaveData);
            Session.set("executeFinding", true);
        } else {
            Session.set("getPatientDocs", null)
            Session.set('displayPagination', false);
            Session.set("executeFinding", true);
        }
    }  else {
        if (res?.data[currentCacheType]?.length) {
            let localSavedData = Session.get('getLocalPatientDocs');
            localSavedData.documents = res?.data[currentCacheType];
            localSavedData.cache.pageNumber = pageNumber;
            // update page css active class locally
            Session.set("currentPage", pageNumber);
            Session.set("getLocalPatientDocs", localSavedData);
            Session.set("executeFinding", true);
        } else {
            Session.set("getLocalPatientDocs", null)
            Session.set('displayPagination', false);
            Session.set("executeFinding", true);
        }
    }
}
};