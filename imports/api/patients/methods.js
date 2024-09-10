import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";

Meteor.methods({
    async patientTestQuery(url, headers) {
        console.log("patientTestQuery")
        try {
            console.log("patientTestQuery-url:", url)

            const response = await HTTP.get(url, { headers });

            console.log("testResponse: ", response?.data)

            const { data } = response;

            if (!!data?.bundle?.entry) {
                data.bundle.entry = data.bundle?.entry.map(e => {
                    let title = data.resourceType;
                    if (data.resourceType === "DocumentReference") {
                        title = "Document Reference"
                    } else if (data.resourceType === "DiagnosticReport") {
                        title = "Diagnostic Report"
                    }

                    e.resource.text.div = e.resource.text.div.split(`<p><b>${title}</b></p>`).join("")
                    return {...e, text: e.resource.text}
                });
            }
            return data;
        } catch (e) {
            console.log("ERROR ", e);
            return e;
        }
    },
    async savePatientResource (url, body, headers) {
        console.log("requestUrl", url);
        console.log("body and headers ", {data: body, headers: headers})

        try {
            const res = await HTTP.post(url, {data: body, headers: headers});
            console.log("requestUrl", url);
            console.log("saveResponse: ", res);
            return res;
        } catch (error) {
            console.error("Error saving patient in local!", error);
            throw new Meteor.Error('Error saving patient in local!', error);
        }
    },

    async setActivePatient (url, body, headers) {
        console.log("requestUrl", url);
        console.log("body and headers ", {data: body, headers: headers})

        try {
            const res = await HTTP.post(url, {data: body, headers: headers});
            console.log("requestUrl", url);
            console.log("setActivePatient Response: ", res);
            console.log("setActivePatient sysCfgId: ", res?.data?.sysCfgId);
            return res;
        } catch (error) {
            console.error("Error in setActivePatient!", error);
            throw new Meteor.Error('Error setActivePatient!', error);
        }
    },
    async getPdfXml (url, headers) {
        try {
            console.log("pdfUrl", url);
            console.log("pdfUrl", headers);
            const res = await HTTP.get(url, { headers });
            return res;
        } catch (error) {
            console.log("PDF error", error)
        }
    },

    async getCachedResults (url, headers) {
        console.log("resourceCachedQuery")
        try {
            console.log("URL", url);
            console.log("Headers", headers);
            const res = await HTTP.get(url, { headers });
            console.log("cached resource Response", res);
            return res;
        } catch (error) {
            console.log("cached resource error", error)
        }
    },
})