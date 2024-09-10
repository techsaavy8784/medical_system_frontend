import { Session } from "meteor/session";

/***** all common helpers related to alerts/loading will be added here *****/

export const alertHelpers = {
    supportAlert() {
        return alert('Something went wrong. If this issue persists, please contact the customer support team.');
    },
    showLoading() {
        Session.set('loading', true);
    },
    stopLoading(){
        Session.set('loading', false);
    }
};