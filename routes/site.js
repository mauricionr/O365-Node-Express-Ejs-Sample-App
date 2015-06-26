﻿/*
 *  Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.
 */

// site.js

var request = require('request');
var appSettings = require('../models/appSettings.js');

// express app routes for SharePoint  rest api  calls to get O365 site lists
module.exports = function (app, passport, utils) {
        
    // The following middleware checks for and obtain, if necessary, access_token for
    // accessing SharePoint site service. 
    app.use('/site', function (req, res, next) {
        passport.getAccessToken(appSettings.resources.sharepoint, req, res, next);
    })
    
    // Illustrating SharePoint REST API call to read List.
    // This call is called after the app.use('/list', ...) is executed.
    app.get('/site', function (req, res, next) {
        if (!passport.user.getToken(appSettings.resources.sharepoint)) {
            return next('invalid token');
        }
        var fileUrl = appSettings.apiEndpoints.sharePointSiteBaseUrl + '/lists';
        var opts = {
            auth: { 'bearer' : passport.user.getToken(appSettings.resources.sharepoint).access_token },
            headers : { 'accept' : 'application/json' },
            secureProtocol: 'TLSv1_method'  // required of Shareoint site and OneDrive,
        };
        
        //For debugging purposes
        if (appSettings.useFiddler) {
            opts.proxy = 'http://127.0.0.1:8888';
            opts.rejectUnauthorized = false;
        }
        
        require('request').get(fileUrl, opts, function (error, response, body) {
            if (error) {
                next(error);
            }
            else if (response.statusCode != 200) {
                error.status = response.statusCode;
                error.msg = body;
                next(error);
            } else {
                data = { user: passport.user, result: JSON.parse(body) };
                res.render('site', { data: data });
            }
        });
    });

}

// *********************************************************
//
// O365-Node-Express-Ejs-Sample-App, https://github.com/OfficeDev/O365-Node-Express-Ejs-Sample-App
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// *********************************************************
