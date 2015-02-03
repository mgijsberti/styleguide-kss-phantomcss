/*
 Require and initialise PhantomCSS module
 Paths are relative to CasperJs directory
 */
var fs = require('fs');
var phantomcss = require('bower_components/phantomcss/phantomcss.js');
var utils = require("utils");

//variables
var server = 'http://localhost:1419';
var path =  '/section-1.html';
var url  =  server + path;
var width =  1920;
var height = 1080;
var json = '../scraper/selectors-sync.json';
//var jsonLinks = '../scraper/links.json'

function getRoot(){
    path = "";
    var options = casper.cli.options;
    if(options["path"]){
        path = options["path"] + "/styleguide/";
    }
    console.log('path = ' + path);
    return path;
}

function getPath(){
    path = "";
    var options = casper.cli.options;
    if(options["path"]){
        path = options["path"] + "/report/";
    }
    console.log('path = ' + path);
    return path;
}

phantomcss.init({
        screenshotRoot: getPath() + 'screenshots',
        libraryRoot:  getRoot() + 'bower_components/phantomcss',
        failedComparisonsRoot: getPath() + 'failures',
        fileNameGetter: function(root,fileName){
            var name;
            fileName = fileName || "screenshot";
            name = root + fs.separator + fileName;

            var Re = new RegExp("\\.","g");
            name = name.replace(Re,"_");
            var Re2 = new RegExp("-","g");
            name = name.replace(Re2,"_");
            var Re3 = new RegExp("#","g");
            name = name.replace(Re3,"");

            if(fs.isFile(name+'.png')){
                return name+'.diff.png';
            } else {
                return name+'.png';
            }
        },
        increment: true
    }
    /*{
     screenshotRoot: '/screenshots',
     failedComparisonsRoot: '/failures'
     casper: specific_instance_of_casper,
     libraryRoot: '/phantomcss',
     fileNameGetter: function overide_file_naming(){},
     onPass: function passCallback(){},
     onFail: function failCallback(){},
     onTimeout: function timeoutCallback(){},
     onComplete: function completeCallback(){},
     hideElements: '#thing.selector',
     addLabelToFailedImage: true,
     outputSettings: {
     errorColor: {
     red: 255,
     green: 255,
     blue: 0
     },
     errorType: 'movement',
     transparency: 0.3
     }
     }*/);

casper.start();

var data = require(json);
var sections = data.sections;
for (var s in sections) {
    var child = sections[s];
    for (var prop in child) {
        var url = child[prop].url;
        var selectors = child[prop].selectors;
        casper.thenOpen(url,function(response){
            casper.test.comment("Open [" + response.url + "]");
        })
        casper.viewport(width, height).eachThen(selectors, function makeScreenShots(response) {
            var selector = response.data;
            casper.test.info("Check selector [" + selector + "]");
            if (casper.exists(selector)) {
                phantomcss.screenshot(selector, selector);
            } else {
                casper.test.error("Selector does not exist [" + selector + "]");
            }
        });
    }
}

casper.then( function compareScreenshots(){
    console.log('Compare screenshots')
    phantomcss.compareAll();
});

casper.then(function () {
    console.log('Tests done')
    casper.test.done();
});

casper.run(function () {
    console.log('End [' + url + "]");
    phantom.exit(phantomcss.getExitStatus());
});



