import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import AppConfiguration from "/imports/utils/configuration";

/***** all common helpers related to logging will be added here *****/

export const logHelpers = {
    logAction(logType = "logType", logMessage = "Test HipaaLog") {
        return false
        // let systemId, srcSystemId, destSystemId, srcPatientId, destPatientId;
        // if(Session.get("isActive") === "local"){
        //     systemId = Session.get('locals')[0].systems[0].id || null;
        //     srcSystemId = Session.get('locals')[0].systems[0].id || null;
        //     destSystemId = Session.get('remotes')[0].systems[0].id || null;
        //     srcPatientId = Session.get('activeLocalPatient')?.patientId || null;
        //     destPatientId = Session.get('activeRemotePatient')?.patientId || null;
        // } else {
        //     systemId = Session.get('remotes')[0].systems[0].id || null;
        //     srcSystemId = Session.get('remotes')[0].systems[0].id || null;
        //     destSystemId = Session.get('locals')[0].systems[0].id || null;
        //     srcPatientId = Session.get('activeRemotePatient')?.patientId || null;
        //     destPatientId = Session.get('activeLocalPatient')?.patientId || null;
        // }
        // let resourceType = Session.get("activeResourceType") || null;
        // let currentPatient = Session.get("currentPatientInfo")
        // let userInfo = Session.get("userInfo")
        // let resource = Session.get('selectedDoc')?.resource
        // let body =  {
        //     // "_id" : ObjectId("65aca4fc9da1cbb6d2a57df4"),
        //     "userId" : userInfo?.id,
        //     "patientId" : currentPatient.patientId,
        //     "srcPatientId" : srcPatientId,
        //     "destPatientId" : destPatientId,
        //     "resourceType" : resourceType,
        //     "resourceId" : resource?.id,
        //     "srcResourceId" : resource?.id,
        //     "destResourceId" : "", // can be null if user just viewing or print anything (not sending anything)
        //     "systemId" : systemId,
        //     "srcSystemId" : srcSystemId,
        //     "destSystemId" : destSystemId,
        //     "logType" : logType,
        //     // "logTime" : ISODate("2024-01-21T05:00:44.516+0000"),
        //     "logMessage" : logMessage
        // }
        //
        // console.group('Log User Action');
        //
        // const url = AppConfiguration.LOGS_API_URL;
        // console.log("url", url);
        // console.log("payload", body);
        // console.groupEnd();
        //
        // const authToken = Session.get("headers");
        //
        // Meteor.call('logUserAction', url, body, {Authorization: `Bearer ${authToken}`}, (error, result) => {
        //     if (error) {
        //         console.log("error", error);
        //     } else {
        //         console.log("result: ", result)
        //     }
        // });
    }
};