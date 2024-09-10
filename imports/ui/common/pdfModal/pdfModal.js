import './pdfModal.html';

import { Template } from "meteor/templating";
import { Session } from "meteor/session";

Template.pdfModal.onCreated(function pdfModalOnCreated() {
    Session.set("emptyPdfData", false);
    Session.set("emptyXmlData", false);
});

Template.pdfModal.helpers({
    pdfDataUrl() {
        return Session.get("pdfDataUrl");
    },

    emptyPdfData() {
        return Session.get("emptyPdfData");
    },

    emptyXmlData() {
        return Session.get("emptyXmlData");
    }
})

