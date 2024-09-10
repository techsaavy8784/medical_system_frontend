import "./pending.html";
import "./acceptPatientModal/acceptPatientModal";
import "./acceptResourceModal/acceptResourceModal";
import "/imports/ui/pending/matchResourceModal/matchResourceModal";
import { Session } from "meteor/session";
import { XMLParser } from "fast-xml-parser";

Template.pending.onCreated(function() {
    Session.set('selectedUpdateInfo', null);
    Session.set('pendingData', []);
    const authToken = Session.get("headers");
    Session.set('isUpdateLoading', true)
    // let url = localsHelpers.getSourceSystemURL() + "SaveQueue"
    let url = Session.get("pendingDataURL");
    Meteor.call('getNewData', url, {Authorization: `Bearer ${authToken}`}, (error, result) => {
        Session.set('isUpdateLoading', false)
        if(error){
            console.log('error in cron job scheduler', error)
        } else {
            console.log(result.data)
            Session.set('pendingData', result.data)
        }
    })

})


Template.pending.helpers({

    tableHeadings() {
        let tableHeadings = []
        let patient = Session.get('pendingData')[0]
        if(patient) {
            const parser = new XMLParser();
            let jObj = parser.parse(patient?.resourceData?.resource?.text?.div);
            tableHeadings = jObj?.div.p?.filter(element => {
                return element['#text'];
            })
        }
        return tableHeadings || [];
    },

    header() {
        let tableHeading;
        let patient = Session.get('pendingData')[0]
        if(patient) {
            const parser = new XMLParser();
            let jObj = parser.parse(patient?.resourceData?.resource?.text?.div);
            tableHeading = jObj?.div.p?.filter(element => {
                return !element['#text'];
            })
        }
        try{
            tableHeading = tableHeading[0]['b']
        } catch (error) {
            tableHeading = 'Data';
        }
        return tableHeading
    },

    getFieldData(patient, fieldName) {
        if(patient){
            const parser = new XMLParser();
            let jObj = parser.parse(patient?.resourceData?.resource?.text?.div);
            let element = jObj?.div?.p?.find(element => {
                return element.b === fieldName
            })
            if(element) {
                return element['#text'].replace(":", "") || '-'
            }
        }
        return '-'
    },
    groupTitles: [
        {title: 'Patients'},
        // {title: 'Documents'}
    ],
    pendingData: () => Session.get('pendingData'),
    isUpdateLoading: () => Session.get('isUpdateLoading'),
})

Template.pending.events({
    'click .accept-update' () {
        Session.set('selectedUpdateInfo', this?.resourceData?.resource)
        Session.set('selectedUpdateXML', this?.resourceData?.resource?.text?.div)
        let resourceType = this?.resourceType;
        if(resourceType === "Patient"){
            $('#acceptPatientModal').modal('show');
        } else {
            $('#matchResourceModal').modal('show');
        }

    },
    'click .reject-update' () {
        console.log('reject this', this)
    }
})
