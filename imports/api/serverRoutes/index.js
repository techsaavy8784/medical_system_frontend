import { Picker } from 'meteor/meteorhacks:picker';
const getRoutes = Picker.filter(function(req, res) {
    // you can write any logic you want.
    // but this callback does not run inside a fiber
    // at the end, you must return either true or false
    return req.method === "GET";
});

getRoutes.route('/healthcheck', function(params, req, res, next) {
    const versionDetails = {
        "versionId": "240909.0"
    }
    res.end(JSON.stringify((versionDetails)));
});
