import "./ObservationSearchModal.html";

import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { ReactiveVar } from "meteor/reactive-var";
import { Meteor } from "meteor/meteor";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import AppConfiguration from "/imports/utils/configuration";
import { resourceHelpers } from "/imports/helpers/resourceHelpers";
import { alertHelpers } from "/imports/helpers/alertHelpers";


const buildEndPoint = (isExpandResults) => {
    let baseURL = Session.get("coreURL");
    baseURL += Session.get("activeResourceType");
    const resourceId = Session.get("resourceId");
    // const provenance = Session.get("provenance");
    if (resourceId) {
        baseURL += `?_id=${resourceId}`;
        if (provenance)
            baseURL += `&_revinclude=${provenance}`;
        return baseURL;
    }
    baseURL += `?patient=${Session.get("currentPatientID")}`;
    const startDate = Session.get("startDate");
    const endDate = Session.get("endDate");
    const category = Session.get("category");
    const codeFilter = Session.get("codeFilter");
    const categoryFilter = Session.get("categoryFilter");
    const type = Session.get("type") || ''
    const encounter = Session.get("encounter");

    if (!!startDate) {
        baseURL += `&date=ge${new Date(startDate).toISOString()}`;
    }
    if (!!endDate) {
        baseURL += `&date=le${new Date(endDate).toISOString()}`;
    }
    if (!!category) {
        console.log('type code', category)
        baseURL += `&category=${categoryFilter}|${category}`;
    }
    if (!!type) {
        let typeReference = $('input[name = "typeReference"]:checked').val()
        baseURL += `&code=${codeFilter}|${type}`;
    }
    if (!!encounter) {
        baseURL += `&encounter=${encounter}`;
    }
    if (isExpandResults) {
        baseURL += `&_count=100`;
    }
    return baseURL;
}


const getPatientDocs = async (url, headers) => {

    return new Promise(function (resolver, reject) {
        Meteor.call(
            "patientTestQuery",
            url,
            headers,
            (error, result) => {
                console.group('patientTestQuery response')
                console.log('error', error)
                console.group('result', result)
                console.groupEnd();
                console.groupEnd();
                if (error) {
                    console.log("errorFinding", error);
                    if (error.error?.response?.statusCode === 401) {
                        alert("Your session has expired, please login");
                        Session.clear();
                        FlowRouter.go("/login");
                        return
                    }
                    reject(error);
                } else {
                    if (result?.status === 200) {
                        resolver(result);
                    } else {
                        reject(result)
                    }
                }
            }
        )
    }).catch((error) => {
        console.log('Unexpected Error', error)
        if(error.status === 404) {
            alert(error.message)
        }
        else if(error?.response?.statusCode === 404){
            let alertMessage = error?.response.message || "End Point Not Found"
            alert(alertMessage)
        } else {
            alertHelpers.supportAlert();
        }
        // show error on screen
        if(Session.get('isActive') === 'local'){
            Session.set("getLocalPatientDocs", null);
        } else {
            Session.set("getPatientDocs", null);
        }

        Session.set("isFindingDoc", false);
        // alert("Error: " + "resourceType: " + error.error.response?.data?.resourceType)
        // alert("Error: " + "There is no Search Result")
    })
}

const setDocs = (res) => {
    Session.set('documentsPageLimit', Math.ceil(res?.countInPage / 10))
    Session.set("searchResult", true);
    Session.set("isFindingDoc", false);
    if(Session.get('isActive') === 'local'){
        Session.set("getLocalPatientDocs", {
            patients: res?.resources,
            headerData: res?.gridHeaderData,
            cache: {
                id: res?.queryId,
                pageNumber: res?.pageNumber,
                totalPages: res?.pageNumber,
                countInPage: res?.countInPage,
            },
        })
    } else {
        // Session.set('documentsPageLimit', 3)
        Session.set('currentPage', '');
        // get patient cache page url from response dynamically
        Session.set("documentsCachePageURL", res?.header?.cachePageUrl);
        Session.set("documentsCacheStatusUrl", res?.header?.cacheStatusUrl);
        console.log("res", res)
        //only update table after verifying new data structure
        if(res?.countInPage){
            Session.set("getPatientDocs", {
                headerData: res?.gridHeaderData,
                cache: {
                    id: res?.queryId,
                    pageNumber: res?.pageNumber,
                    totalPages: res?.pageNumber,
                    countInPage: res?.countInPage,
                },
            })
        }
        // add a condition that if return resources is limited (< totalPages) it will not call cache status
        let totalPages = AppConfiguration.TOTAL_Pages;
        if(res?.countInPage >= totalPages) {
            // Session.set('documentsPageLimit', Math.ceil(res?.countInPage / 10))
            const authToken = Session.get("headers");
            resourceHelpers.getCachedDocumentsStatus(Session.get('coreURL'), res?.queryId, {
                Authorization: `Bearer ${authToken}`,
            })
        } else {
            if(res?.countInPage){
                resourceHelpers.getCachedDocumentsByPageNumber(1)
            }
        }
        return false
    }
}


Template.ObservationSearchModal.onCreated(function ObservationSearchModalOnCreated() {
    this.resourceId = new ReactiveVar("");
    Session.set('emptyDocResult', false)
    Meteor.setTimeout(() => {
        if($('input:radio[name="typeReference"]')[0]){
            $('input:radio[name="typeReference"]')[0].checked = true;
            $('input:radio[name="categoryReference"]')[0].checked = true;
        }
    }, 500)
});

Template.ObservationSearchModal.onRendered(function ObservationSearchModalOnRendered() {
    const modalElement = this.find('#ObservationSearchModal');
    // $(modalElement).on('hidden.bs.modal', function (event) {
    //     $(this).find('form').trigger('reset');
    // })
});

Template.ObservationSearchModal.helpers({
    filterCount(value) {
        const filterCount = Session.get("filterCount") ? Session.get("filterCount") : "10";
        return filterCount === value ? "selected" : "";
    },
    isResourceId() {
        return Template.instance().resourceId.get() || false;
    },
    canInputType () {
        return !!Session.get('category');
    },
    canInputCategory () {
        return !!Session.get('type');
    },
    totalPages() {
        // here we are getting total pages from env variable or default to 3 pages
        // fallback value added so if env variable not defined it's default value will be 10
        let TOTAL_PAGES = AppConfiguration.TOTAL_Pages;
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

        let documents = [];
        if (Session.get("isActive") === "remote") {
            documents = Session.get("remoteSavedData")?.documents;
        } else {
            documents = Session.get("localSavedData")?.documents;
        }
        if(Session.get('currentPage') === 1 && documents?.length < 10){
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
    observationFilter(type) {
        let observationFilters = Session.get('observationFilters');
        if(observationFilters){
            let identifier =  observationFilters.find(filter => filter.element === type)
            return identifier?.filters || []
        }
    }
});

Template.ObservationSearchModal.events({
    async 'submit .search-doc-form' (event, instance) {
        Session.set("executeFinding", false);
        event.preventDefault()
		$('#ObservationSearchModal').modal('hide');

        const target = event.target
        const startDate = target?.startDate?.value;
        const endDate = target?.endDate?.value;
        const filterCount = target?.filterCount?.value;
        const category = target?.category?.value;
        const categoryFilter = target?.categoryFilter?.value;
        const codeFilter = target?.codeFilter?.value;
        const encounter = target?.encounter?.value;

        Session.set("startDate", startDate);
        Session.set("endDate", endDate);
        // Session.set("filterCount", filterCount);
        Session.set("category", category);
        Session.set("encounter", encounter);
        Session.set("categoryFilter", categoryFilter);
        Session.set("codeFilter", codeFilter);

        console.group(Session.get("activeResourceType"));
        console.log(`${Session.get('isActive')} is active so I am Search with URL below`);
        console.log(`${Session.get("coreURL")}`);
        console.groupEnd();
        // if (Session.get("isFindingDoc")) return;
        Session.set("isFindingDoc", true);
        const authToken = Session.get("headers");

        console.log("resourceURL---", buildEndPoint());
        const res = await getPatientDocs(buildEndPoint(), {
            Authorization: `Bearer ${authToken}`,
        });
        console.log('THIS IS THE RES I WANT', res?.message)
        const decision = await resourceHelpers.adjustFiltersConfirmation(res?.message);
        if(decision === 'acceptResults'){
            setDocs(res);
            // Session.set("executeFinding", true);
            console.log('res---', res);
        } else if(decision === 'expandResults'){
            console.log("resourceURL---", buildEndPoint(true));
            const res = await getPatientDocs(buildEndPoint(true), {
                Authorization: `Bearer ${authToken}`,
            });
            setDocs(res);

        } else if(decision === 'adjustResults'){
            Session.set("isFindingDoc", false);
            $('#DocumentReferenceSearchModal').modal('show');
        } else {
            setDocs(res);
            console.log('res---', res);
        }

    },
    'input #document-id' (event, instance) {
        const resourceId = event.target.value;
        if (!!resourceId) {
            instance.resourceId.set(true);
        } else {
            instance.resourceId.set(false);
        }
    },
    'click .reset': function (event, instance) {
        event.preventDefault();
        Session.set('category', null)
        Session.set('type', null)
        $('#ObservationSearchModal').find('form')[0].reset();
    },
    'input #type' (event, instance) {
        const type = event.target.value;
        Session.set('type', type)
        console.log('running', type)
    },
    'input #document-category' (event, instance) {
        const category = event.target.value;
        Session.set('category', category);
        console.log('running', category)
    },
    'change input[name="categoryReference"]' (event, instance) {
        const type = event.target.value;
        let newValue = $('input[name = "categoryReference"]:checked').val()
    },
    'change input[name="typeReference"]' (event, instance) {
        const type = event.target.value;
        let newValue = $('input[name = "typeReference"]:checked').val()
    },
});
