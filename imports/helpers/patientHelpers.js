/***** all patients related helpers can be added here *****/

import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { remotesHelpers } from "/imports/helpers/remotesHelpers";
import { localsHelpers } from "/imports/helpers/localsHelpers";
import { alertHelpers } from "/imports/helpers/alertHelpers";

export const patientHelpers = {
    async getPatients(coreUrl, query, headers) {
        return new Promise(function (resolver, reject) {
            console.log("find-patientURL", `${coreUrl}${query}`);
            Meteor.call(
                "patientTestQuery",
                `${coreUrl}${query}`,
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
                        Session.set('patientsPageLimit', 3)
                        Session.set('currentPage', '');
                        console.log("success: ", result)
                        // get patient cache page url from response dynamically
                        Session.set("patientsCachePageURL", result?.header?.cachePageUrl);
                        Session.set("patientsCacheStatusUrl", result?.header?.cacheStatusUrl);
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

    //http://universalcharts.com:30300/{{ssdCernerSystem}}/query/660e106afd270ff776f45f63/CachedPatientPage?page=x&limit=y
    async getCachedPatients(coreUrl, queryId, pageNumber, pageSize, headers) {
        // example query/66194f68c1d1e625887664d7/CachedPatientPage
        let cachePatientURL = Session.get("patientsCachePageURL");
        // add fallback value too until testing complete for all use cases
        cachePatientURL = cachePatientURL || `query/${queryId}/CachedPatientPage`
        let cachedPatientsFullURL = `${coreUrl}${cachePatientURL}?page=${pageNumber}&limit=${pageSize}`;
        console.log('test', cachedPatientsFullURL)
        return new Promise(function (resolver, reject) {
            console.log("cached-patientURL", cachedPatientsFullURL);
            Meteor.call(
                "getCachedResults",
                cachedPatientsFullURL,
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

    // http://universalcharts.com:30300/system/640ba5e3bd4105586a6dda74/query/660432647fed539c6de22750/CacheStatus
    async getCachedPatientsStatus(coreUrl, queryId, headers) {
        let interValRequestTime = 1500 // 1 second
        // stop infinite loop or unknown reason, initiate counter to 10
        let counter = 1
        Session.set('PatientsIsCaching', true);
        let patientsCacheStatusUrl = Session.get("patientsCacheStatusUrl");
        patientsCacheStatusUrl = patientsCacheStatusUrl || `query/${queryId}/CachedPatientPage`;
        console.log('Cache status URL', `${coreUrl}query/${queryId}/CacheStatus/`)
        let statusInterval = Meteor.setInterval(() => {
            Meteor.call(
                "getCachedResults",
                `${coreUrl}${patientsCacheStatusUrl}`,
                headers,
                (error, result) => {
                    counter++
                    // TODO removing the below condition just to test on production with pageCount 0
                    Session.set('patientsPageLimit', result?.data?.pageCount || 3)
                    if(error || counter > 20 || result?.data?.status === 'finished' || result?.data?.status !== 'caching'){
                        Meteor.clearInterval(statusInterval)
                        Session.set('PatientsIsCaching', false);
                        if(!Session.get('currentPage')){
                            let searchQuery;
                            if (Session.get("isActive") === "remote") {
                                searchQuery = Session.get("remoteSavedData")?.query;
                            } else {
                                searchQuery = Session.get("localSavedData")?.query;
                            }
                            if(searchQuery === 'family=smart'){
                                patientHelpers.getCachedPatientsByPageNumber(3)
                            } else {
                                patientHelpers.getCachedPatientsByPageNumber(1)
                            }

                        }
                    }
                    if(error){
                        console.log('error in getting cached patients status', error)
                    } else {
                        Session.set('patientsPageLimit', result?.data?.pageCount || 3)
                        console.log('cached patients status', result)
                        console.log('cached patients status', result?.data?.status)
                    }
                }
            )
        }, interValRequestTime)
    },

    //this helper will reset current user info when user
    //switch between local and remote
    setCurrentPatient(activePatient) {
        Session.set("currentPatientSelected", true);
        Session.set("currentPatientID", activePatient?.patientId);
        Session.set("currentPatientName", activePatient?.patientName);
        // Session.set("selectedPatientInfo", this);
        Session.set("patientMrn", activePatient?.patientMRN);
        // Session.set("fhirModalData", activePatient.text.div);
    },

    //this helper will reset current user info when user
    //switch between local and remote
    resetCurrentPatient() {
        Session.set('currentPatientInfo', null)
        Session.set("currentPatientSelected", null);
        Session.set("currentPatientID", null);
        Session.set("currentPatientName", null);
        Session.set("selectedPatientInfo", null);
        Session.set("patientMrn", null);
        Session.set("fhirModalData", null);
        FlowRouter.go(`/find-patient`);
    },

    //below functions save active patients only in session
    //first it check if both params supplied then it save new values
    //else it will check for old values and set the session
    //in case both not found it will do nothing
    setActiveLocalPatient(patient) {
        console.log('setActiveLocalPatient', patient)
        if(patient){
            Session.set('activeLocalPatient', patient);
        } else {
            patient = Session.get('activeLocalPatient');
        }
        Session.set('currentPatientInfo', patient);
        if(patient?.data) {
            this.setCurrentPatient(patient?.data);
        } else {
            this.resetCurrentPatient();
        }
    },

    //below functions save active patients only in session
    //first it check if both params supplied then it save new values
    //else it will check for old values and set the session
    //in case both not found it will do nothing
    setActiveRemotePatient(patient) {
        if(patient){
            Session.set('activeRemotePatient', patient);
        } else {
            patient = Session.get('activeRemotePatient');
        }
        Session.set('currentPatientInfo', patient);
        if(patient?.data) {
            this.setCurrentPatient(patient?.data);
        } else {
            this.resetCurrentPatient();
        }
    },

    async getCachedPatientsByPageNumber (pageNumber) {
        // if it's same page do nothing
        if(pageNumber === Session.get('currentPage')){
            return false;
        } else if(isNaN(pageNumber) || pageNumber < 0 || pageNumber > Session.get('patientsPageLimit')){
            alert('Please Enter Correct Page Number');
            return false;
        }
        let queryId;
        if (Session.get("isActive") === "remote") {
            queryId = Session.get('remoteSavedData').cache.id;
        } else {
            queryId = Session.get('localSavedData').cache.id;
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
        let res = await patientHelpers.getCachedPatients(coreUrl(), queryId, pageNumber, 10, {
            Authorization: `Bearer ${authToken}`,
        })
        console.log("res of cachedPatients different from original API response????", res)
        if(!res){
            alertHelpers.supportAlert();
            return
        }

        Session.set("isFindLoading", false)

        if (isActive === "remote") {
            if (res?.data?.vsPatients.length) {
                let remoteSaveData = Session.get('remoteSavedData');
                remoteSaveData.patients = res?.data?.vsPatients;
                remoteSaveData.cache.pageNumber = pageNumber;
                // update page css active class locally
                Session.set("currentPage", pageNumber);
                Session.set("remoteSavedData", remoteSaveData);
            } else {
                Session.set("remoteSavedData", null)
                Session.set('displayPagination', false);
            }
        }  else {
            if (res?.data?.vsPatients.length) {
                let localSavedData = Session.get('localSavedData');
                localSavedData.patients = res?.data?.vsPatients;
                localSavedData.cache.pageNumber = pageNumber;
                // update page css active class locally
                Session.set("currentPage", pageNumber);
                Session.set("localSavedData", localSavedData);
            } else {
                Session.set("localSavedData", null)
                Session.set('displayPagination', false);
            }
        }
    }
};