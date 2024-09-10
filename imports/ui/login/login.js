import './login.html';

import { Template } from 'meteor/templating';
import { Meteor } from "meteor/meteor";
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import { job1 } from "/imports/schedulers";

Template.login.onCreated(function loginOnCreated() {
    this.isLogging = new ReactiveVar(false);
});

Template.login.helpers({
    isLogging() {
        return Template.instance().isLogging.get();
    }
});

Template.login.events({
    'submit .login-form'(event, instance) {
        event.preventDefault();

        const target = event.target;
        const username = target?.username?.value?.toLowerCase();
        const password = target?.password?.value?.toLowerCase();

        if (!(username && password)) {
            alert('Input all field values!');
            return;
        }
        instance.isLogging.set(true);
        try {
            Meteor.call('loginUser', username, password, (error, result) => {

                if (error) {
                    console.log("loginError", result);

                    alert(error)
                    instance.isLogging.set(false);
                } else {
                    console.log("loginResult", result);
                    if (result?.status === 200) {
                        console.log("loginResponse: ", result);
                        console.log("userRole", result?.role)
                        instance.isLogging.set(false);

                        Session.set("userInfo", result);
                        Session.set("userRole", result?.role);
                        Session.set("locals", result?.locals);
                        Session.set("remotes", result?.remotes);
                        Session.set("isLogin", true);
                        Session.set("isActive", "remote");
                        Session.set("headers", result?.token);
                        //set both local and remote URLs in sessin
                        Session.set('localURL', result?.locals[0]?.systems[0]?.coreUrl);
                        Session.set('remoteURL', result?.remotes[0]?.systems[0]?.coreUrl);

                        Session.set("coreURL", result?.remotes[0]?.systems[0]?.coreUrl);
                        job1.start();

                        FlowRouter.go('/');
                    } else if (result?.response?.statusCode === 401) {
                        instance.isLogging.set(false);
                        const errorMessage = result?.response?.data?.message;
                        alert("Not Authorized: " + `${errorMessage}`)
                    } else {
                        alert("Internet Connection error!")
                        Session.set("isLogin", false);
                        instance.isLogging.set(false);
                    }
                }
            });
        } catch (error) {
            console.log("network error")
            instance.isLogging.set(false);
        }
    },
});