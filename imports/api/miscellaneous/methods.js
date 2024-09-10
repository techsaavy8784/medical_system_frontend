import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { baseUrl, versionId } from "/imports/utils/constants";

Meteor.methods({
    getTagLine: function() {
        // Make an HTTP GET request to the getTagLine API endpoint
        console.log("baseUrl", baseUrl);
        const requestUrl = baseUrl + "TagLine";

        try {
            console.log("requestUrl", requestUrl);
            const res = HTTP.get(requestUrl);
            console.log("tagLineResponse: ", res);
            return res;
        } catch (error) {
            console.error("Error fetching tagline:", error);
            throw new Meteor.Error('tagline-fetch-failed', 'Failed to fetch tagline');
        }
    },
    getVersionId: function() {
        return versionId
    },
    getEnvVariables: function() {
        return process.env
    },

    async logUserAction (url, body, headers) {
        console.log('logUserAction called........')
        console.log("requestUrl", url);
        console.log("body and headers ", {data: body, headers: headers})

        try {
            const res = await HTTP.post(url, {data: body, headers: headers});
            console.log("requestUrl", url);
            console.log("logResponse: ", res);
            return res;
        } catch (error) {
            console.error("Error in logging user Action!", error);
            throw new Meteor.Error('Error logging user Action!', error);
        }
    },
    getSystemSummary: function(requestUrl, headers) {
        // Make an HTTP GET request to the getSystemSummary API endpoint
        try {
            console.log("requestUrl", requestUrl);
            const res = HTTP.get(requestUrl, {headers});
            console.log("systemSummaryResponse: ", res);
            return res;
        } catch (error) {
            console.error("Error fetching systemSummary:", error);
            throw new Meteor.Error('system-summary-failed', 'Failed to fetch system summary');
        }
    },

    getPendingData: async function(url, headers){
        let result;
        try {
            console.log('..........GET NEW UPDATE STARTS..........');
            console.log('URL', url);
            const response = await HTTP.get(url, {headers});

            console.log("getPendingData response: ", response?.data)
            console.log('..........GET NEW UPDATE ENDS..........');
            result = response;
        } catch (e) {
            console.log("getPendingData ERROR ", e);
            console.log('..........GET NEW UPDATE ENDS..........');
            return e;
        }
        return result;
    },

    getPendingQueueSummary: async function(url, headers){
        let result;
        try {
            console.log('..........GET PendingQueueSummary STARTS..........');
            console.log('URL', url);
            const response = await HTTP.get(url, {headers});

            console.log("getPendingData response: ", response?.data)
            console.log('..........GET PendingQueueSummary ENDS..........');
            result = response;
        } catch (e) {
            console.log("getPendingData ERROR ", e);
            console.log('..........GET PendingQueueSummary ENDS..........');
            return e;
        }
        return result;
    },
    getNewData: async function(url, headers){
        let result;
        try {
            const response = await HTTP.get(url, {headers});

            console.log("testResponse: ", response?.data)

            result = response;
        } catch (e) {
            console.log("ERROR ", e);
            return e;
        }
        return result;
    },
});

/*
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});


Meteor.methods({
  loginUser: function (username, password) {
    // Make an HTTP POST request to the authorize API endpoint
    const requestUrl = baseUrl + "authorize";

    logger.info(`Making external API call to: ${requestUrl}`)

    try {
      const response = HTTP.post(requestUrl, {
        data: {
          userName: username,
          password: password
        }
      });

      logger.info('API response:', { response: response.data });
      return response.data;

    } catch (error) {
      logger.error('Error ocurred during the API call: ', error)
      throw new Meteor.Error('login', 'Network connection Error!');
    }

  },
  getTagLine: function() {
    // Make an HTTP GET request to the getTagLine API endpoint

    const requestUrl = baseUrl + "TagLine";
    logger.info(`Making external API call to: ${requestUrl}`)
    try {
      const res = HTTP.get(requestUrl);
      // const { data } = res;
      logger.info('API response:', { response: res });
      return res;
    } catch (error) {
      logger.error('Error occurred during the API call:', error);
      throw new Meteor.Error('tagline-fetch-failed', 'Failed to fetch tagline');
    }
  },
  async patientTestQuery(url, headers) {
    console.log("patientTestQuery")
    try {

      logger.info(`Making external API call to: ${url}`);

      const response = await HTTP.get(url, { headers });

      logger.info('API response:', { response: response.data });
      const { data } = response;
      data.bundle.entry = data.bundle.entry.map(e => {
        let title = data.resourceType;
        if (data.resourceType === "DocumentReference") {
          title = "Document Reference"
        } else if (data.resourceType === "DiagnosticReport") {
          title = "Diagnostic Report"
        }

        e.resource.text.div = e.resource.text.div.split(`<p><b>${title}</b></p>`).join("")
        return {...e, text: e.resource.text}
        });

      return data;
    } catch (error) {
      logger.error('Error occurred during the API call:', error);
      throw new Meteor.Error(error)
    }
  }
});
*/