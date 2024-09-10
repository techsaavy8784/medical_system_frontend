import "./home.html"

import { Template } from 'meteor/templating';
import { Meteor } from "meteor/meteor"
import { ReactiveVar } from 'meteor/reactive-var';
import { systemHelpers } from "/imports/helpers/systemHelpers";

Template.home.onCreated(function tagLineOnCreated() {
    this.tagLineText = new ReactiveVar("");

    Meteor.call('getTagLine', (error, result) => {
        if (error) {
            this.tagLineText.set("Network Error!");
        } else {
            if (result?.statusCode === 200) {
                this.tagLineText.set(result?.content);
            } else {
                this.tagLineText.set("Network Error!");
            }
        }
    });
    getEnvVariables();
});

Template.home.helpers({
    tagLineText() {
        return Template.instance().tagLineText.get();
    },
});

function getEnvVariables () {
    Meteor.call('getEnvVariables', (error, result) => {
        if (error) {
            console.log("can't find env variables", error);
        } else {
            console.log("here is the result of EVN from server", result.TOTAL_PAGES)
            let { TOTAL_PAGES } = result;
            Session.set('settings', {
                TOTAL_PAGES
            })
        }
    });
}