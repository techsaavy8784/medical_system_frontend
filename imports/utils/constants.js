/***** Application Constants will be added here *****/

// these will dynamically return values for local and docker
export const baseUrl = Meteor.isDevelopment ? Meteor.settings.public.LOGIN_BASE_URL : process.env.LOGIN_BASE_URL;
export const versionId = Meteor.isDevelopment ? Meteor.settings.public.VERSION_ID : process.env.VERSION_ID;