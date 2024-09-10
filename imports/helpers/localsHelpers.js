import { Session } from "meteor/session";

/***** all common helpers related to Locals will be added here *****/

export const localsHelpers = {
    getLocals() {
        return Session.get("locals");
    },

    //it will always return opposite system ID
    getdestSystemId() {
        if (Session.get("isActive") === "local") {
            return Session.get("remotes")[0]?.systems[0].id;
        } else {
            return Session.get("locals")[0]?.systems[0].id;
        }
    },

    //it will always return current system ID
    getSrcSystemId() {
        if (Session.get("isActive") === "local") {
            return Session.get("locals")[0]?.systems[0].id;
        } else {
            return Session.get("remotes")[0]?.systems[0].id
        }
    },

    //it will always return opposite system URL
    getdestSystemURL() {
        let localURL = Session.get('localURL');
        let remoteURL = Session.get('remoteURL');

        //if local active return remote else vice versa
        if (Session.get("isActive") === "local") {
            return remoteURL;
        } else {
            return localURL;
        }
    },

    //it will always return local system URL
    getSourceSystemURL() {
        return Session.get('localURL');
    },

    getSourceSystemID() {
        return Session.get("locals")[0]?.systems[0].id;
    }
};