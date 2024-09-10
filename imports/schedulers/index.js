import { CronJob } from 'cron';
import { Session } from "meteor/session";
import { localsHelpers } from "/imports/helpers/localsHelpers";

export const job1 = CronJob.from({
    cronTime: '0 */1 * * * *',
    onTick: async function () {
        getPendingData();
    },
    // start: true,
    timeZone: 'America/Los_Angeles'
});

function getPendingData () {
    const authToken = Session.get("headers");
    // user session cleared for any client side reason
    if(!authToken){
        stopPendingDataSchedular('Session Expired')
        return;
    }
    let url = localsHelpers.getSourceSystemURL() + "SaveQueueCount";
    let getPendingQueueSummaryUrl = localsHelpers.getSourceSystemURL() + "PendingQueueSummary";
    Meteor.call('getPendingData', url, {Authorization: `Bearer ${authToken}`}, (error, result) => {
        if(error){
            console.log('error in cron job scheduler', error)
        } else {
            if(result?.response?.statusCode === 401){
                stopPendingDataSchedular('401 response from server')
                return;
            }
            let count = result?.data?.count || 0;
            console.log("???????????????", count);
            Session.set('notificationCount', count);

        }
    });

    Meteor.call('getPendingQueueSummary', getPendingQueueSummaryUrl, {Authorization: `Bearer ${authToken}`}, (error, result) => {
        if(error){
            console.log('error in cron job scheduler', error)
        } else {
            console.log(result.data)
            Session.set('PendingQueueSummary', result?.data?.pendingQueueSummary)
        }
    });
}

function stopPendingDataSchedular(reason) {
    console.log('stopping Data Update Scheduler')
    console.log('reason: ', reason)
    job1.stop();
}