import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";

Meteor.methods({
    async saveDocumentResource (url, body, headers) {
        console.log("---------------SAVE DOCUMENT STARTS------------");
        console.log("requestUrl", url);
        console.log("body and headers ", {data: body, headers: headers})

        try {
            const res = await HTTP.post(url, {data: body, headers: headers});
            console.log("requestUrl", url);
            console.log("saveResponse: ", res);
            console.log("---------------SAVE DOCUMENT ENDS------------")
            return res;
        } catch (error) {
            console.error("Error saving patient in local!", error);
            console.log("---------------SAVE DOCUMENT ENDS------------")
            throw new Meteor.Error('Error saving patient in local!', error);
        }
    },
})