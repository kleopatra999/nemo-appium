'use strict';

var ar = require('appium-running');
var cp = require('child_process');
var debug = require('debug');
var log = debug('nemo-appium:log');
var error = debug('nemo-appium:error');


module.exports.setup = function (apath, nemo, cb) {
    var once = function () {
        cb.apply(null, arguments);
        once = function () {
            error('once called more than once');
        };
    };
    //check if appium is already running
    ar(4723, function (success) {
        if (success) {
            log("Appium is running, move on!");
            once(null);
            // run test
        } else {
            log("Appium is not running, exec appium &");
            //start it
            var appiumPath = apath;
            var appiumProcess = cp.exec(appiumPath, function (err) {
                if (err) {
                    error(err);
                    once(err);
                }
            });
            nemo.appium = {
                process: appiumProcess
            };
            appiumProcess.stdout.on('data', function (data) {
                if (data.indexOf('Appium REST http interface listener started on 0.0.0.0:4723') !== -1) {
                    once(null);
                }
                log(data);
            });
            appiumProcess.stderr.on('data', function (data) {
                error(data);
            });
            appiumProcess.on('exit', function (code) {
                log('appium exited with code', code);
            });
        }
    });
};


//var eventInterval = setInterval(function () {
//    if (nemo && nemo.driver && nemo.driver.controlFlow) {
//        clearInterval(eventInterval);
//        console.log('clearing eventInterval');
//        nemo.driver.controlFlow().on('scheduleTask', function (task) {
//            driver.getSession().then(function (session) {
//                if (session && task !== undefined && task.indexOf('WebDriver.quit') !== -1) {
//                    //kill the appium server
//                    nemo.appium.process.kill();
//                }
//
//            });
//        });
//    }
//});
