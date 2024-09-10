// here we add all application config variables based no Meteor.settings or static
// main reason it should always have fallback values for to prevent code breaking
import { Meteor } from "meteor/meteor";

const AppConfiguration = {
    TOTAL_Pages : Meteor.settings.public.TOTAL_PAGES || 3,
    LOGS_API_URL : 'http://universalcharts.com:30300/api/rest/v1/LogHipaa'
}

export default AppConfiguration;