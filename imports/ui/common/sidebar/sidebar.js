import './sidebar.html';
import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { ReactiveVar } from "meteor/reactive-var";
import { resourceHelpers } from "/imports/helpers/resourceHelpers";
import { systemHelpers } from "/imports/helpers/systemHelpers";


const clearQuery = () => {
    Session.set("startDate", null);
    Session.set("endDate", null);
    Session.set("filterCount", null);
    Session.set("category", null);
    Session.set("type", null);
}

Template.sidebar.onCreated(function sidebarOnCreated() {
    this.selectedResourceItem = new ReactiveVar("")
});

Template.sidebar.onRendered(function () {
    // Session.set("activeResourceType",null);
});

Template.sidebar.helpers({

});

Template.sidebar.events({
    async 'click .resource-item'(event, instance) {
        let resetForm = false;
        Session.set("searchResult", false);
        const activeResourceType = event.currentTarget.id;
        const activeResourceName = event.currentTarget.attributes?.name?.value;
        let oldActiveResourceName = Session.get("activeResourceName");
        instance.selectedResourceItem.set(activeResourceType);
        if(oldActiveResourceName !== activeResourceName){
            resetForm = true
            clearQuery();
        }
        Session.set("activeResourceType",activeResourceType);
        Session.set("activeResourceName",activeResourceName);
        systemHelpers.getSystemSummary();
        resourceHelpers.openActiveResourceModal('Search', resetForm);
    }
});