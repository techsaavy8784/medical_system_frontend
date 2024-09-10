/***** all common helpers related to system will be added here *****/
import {Session} from "meteor/session";

export const systemHelpers = {
    getSystemSummary() {
        console.group('Getting System Summary');

        let url;
        if (Session.get("isActive") === "remote") {
            url = "http://universalcharts.com:30300/system/640ba5e3bd4105586a6dda74/SystemSummary";
        } else {
            url = "http://universalcharts.com:30300/system/640ba5e3bd4105586a6dda75/SystemSummary";
        }
        console.log("url", url);
        console.groupEnd();

        const authToken = Session.get("headers");

        Meteor.call('getSystemSummary', url, {Authorization: `Bearer ${authToken}`}, (error, result) => {
            if (error) {
                console.log("error", error);
            } else {
                console.log("result: ", result)
                let resourceConfigs = result?.data?.resourceConfigs
                if(resourceConfigs){
                    Session.set("resourceConfigs", resourceConfigs)
                    let patientFilters = resourceConfigs?.filter(config => (config.name === "Patient"));
                    Session.set('patientFilters', patientFilters);

                    let observationFilters = resourceConfigs?.filter(config => (config.name === "Observation"));
                    Session.set('observationFilters', observationFilters);

                    let documentReferenceFilters = resourceConfigs?.filter(config => (config.name === "DocumentReference"));
                    Session.set('documentReferenceFilters', documentReferenceFilters);

                    let diagnosticReportFilters = resourceConfigs?.filter(config => (config.name === "DiagnosticReport"));
                    Session.set('diagnosticReportFilters', diagnosticReportFilters);

                    let conditionFilters = resourceConfigs?.filter(config => (config.name === "Condition"));
                    Session.set('conditionFilters', conditionFilters);

                    let immunizationFilters = resourceConfigs?.filter(config => (config.name === "Immunization"));
                    Session.set('immunizationFilters', immunizationFilters);

                    let questionnaireResponseFilters = resourceConfigs?.filter(config => (config.name === "QuestionnaireResponse"));
                    Session.set('questionnaireResponseFilters', questionnaireResponseFilters);

                    let proceduresFilters = resourceConfigs?.filter(config => (config.name === "Procedures"));
                    Session.set('proceduresFilters', proceduresFilters);

                }
            }
        });
    }
};