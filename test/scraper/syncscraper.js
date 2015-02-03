// All links are scraped from the styleguide. Each link is opened and in the page is searched for the elements with a ".screenshot" selector.
// The markup selector is retrieved from the ".screenshot" elements and stored in 'selectors.json'. The markup selector
// exists of (#)s(styleguide-section)-(selector), eg #s1-4-2-2-icon--large is the selector icon--large
// for styleguide section 1.4.2.2

var Q = require('q');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

//url of the living styleguide
var base = 'http://localhost:1419/';
var section = '';
var url = base + section;
var foundLinks = [];
var jsonLinksFn = 'links.json';
var selectors = [] ;
var filename = '/scraper/selectors-sync.json';
var path = './test';//default

//pushes unique values into an array
Array.prototype.pushUnique = function(value){
    if (this.indexOf(value) === -1) {
        this.push(value);
    }
}

var parseArgs = function(){
    var d = Q.defer();
    process.argv.forEach(function(val, index, array) {
        //console.log(index + ': ' + val);
        if(index == 2){
            if(val.match('--path')){
                var values = val.split('=');
                if(values.length == 2 ){
                    path = values[1];
                }
            }
        }
    });
    d.resolve(path);
    return d.promise;
}

var getFirstSection = function(){
    var d = Q.defer();
    console.log('get FirstSection : url [' + url + ']');
    request(url,function (error, response, html) {
        if(error){
            console.log('getFirstSection : error [' + error.message + ']');
            d.reject(new Error("Error requesting [ " + url + "] error : " + error.message));
        }else{
            console.log('getFirstSection : success ');
            d.resolve(html);
        }
    })
    return d.promise;
}

//scrape all the links of the styleguide
var searchLinks = function (html) {
    var d = Q.defer();
    console.log('searchLinks for url [' + url + ']');
    var $ = cheerio.load(html);
    var anchors = ".kss-a";
    $(anchors).each(function () {
        var href = $(this).attr("href");
        console.log("Found href [" + href + "]");
        if(href) {
            //no #sections and index.html
            if(href.indexOf('#') === -1 && href.indexOf('section-') > -1) {
                foundLinks.pushUnique(base + href);
            }
        }
    });
    d.resolve(foundLinks);
    return d.promise;
}

var writeLinks = function (links){
    var d = Q.defer();
    //console.log('write Json file [' + jsonLinksFn + ']');
    fs.writeFile(jsonLinksFn, JSON.stringify(links, null, 4), function(error){
        if(error){
            var errorMessage = "Error write file [" + jsonLinksFn + "]";
            console.log(errorMessage);
            d.reject(new Error(errorMessage));
        } else {
            console.log('Write file [' + jsonLinksFn + '] is success.');
            d.resolve(links);
        }
    })
    return d.promise;
}

function doRequest(url) {
    return new Q.promise(function(resolve,reject){
        request(url, function(error, response, html) {
            var result = {"url" : url, "html" : html };
            if (error) {
                var errorMessage = "Error " + error.message + " for do request [" + url + "]";
                console.log(errorMessage);
                reject(new Error(errorMessage));
            } else {
                console.log("Request done succesfully for url [" + url + "]");
                console.log("status repsonse [" + response.statusCode + "]");
                resolve(result);
            }
        })
    })
};

//process all resolved links and return the promised response with html
var processLinks = function(links){
    console.log("found links length " + links.length);
    return Q.all(links.map(function(url) {
        return doRequest(url);
    }));
};

var parseHtml =  function(result ) {
    var d = Q.defer();
    var url = result.url;
    var $ = cheerio.load(result.html);
    var selector = ".screenshot";
    var sectionId =  getSectionFromUrl(url);
    var result = { "section": sectionId, "url" : url, "selectors" : []}
    console.log("Parse html for " + url + " sectionId: " + sectionId);
    $(selector).each(function () {
        var element = $(this);
        if ($(element).length) {
            var markUpSelector = "#" + element.attr("id");
            //console.log("selector [" + markUpSelector + "]");
            var len = $(markUpSelector).length;
            if (len == 0) {
                console.log(markUpSelector + ' DOES not exist !');
            } else if (len == 1) {
                var id = getFirstId(markUpSelector);
                if(id === sectionId) {
                    console.log("Add id: " + id + " markup: " + markUpSelector);
                    result.selectors.pushUnique(markUpSelector);
                }
            } else {
                console.log(markUpSelector + ' is not unique [' + len + "]");
            }
        }
    });
    console.log(JSON.stringify(result));
    console.log("Ready");
    d.resolve(result);
    return d.promise;
}

//#s2-3-h2 ->
function getFirstId(markUpSelector){
    var r = new RegExp("#s\\d-");
    var matches = markUpSelector.match(r);
    var id = "";
    if(matches && matches.length == 1){
        id  = matches[0];
    }
    r = new RegExp("\\d");
    matches = id.match(r);
    if(matches && matches.length == 1){
        id  = matches[0];
    }
    return id;
}

//process the results of allPromisedLinks
var parsePages = function(results) {
    return Q.all(results.map(function(result) {
        return parseHtml(result);
    }));
};


function getSectionFromUrl(url){
    var r = new RegExp("section-\\d");
    var matches = url.match(r);
    var section = "";
    if(matches && matches.length == 1){
        section  = matches[0];
    }
    r = new RegExp("\\d");
    matches = section.match(r);
    if(matches && matches.length == 1){
        section  = matches[0];
    }
    return section;
}

/**
 {"sections": {
       "section1": {
           "url": "url1",
           "selectors": ["A", "B", "C" ]
       },
       "section2": {
           "url": "url2",
           "selectors": ["A2", "B2", "C2" ]
       }
   }
}
 */
var parseResults = function(data){
    var d = Q.defer();
    var toJson = {"sections" : []};
    var url = "";
    var selectors = "";
    var section = "";
    for(var i =0; i < data.length; i++) {
        var child = data[i];
        section = child.section;
        url = child.url;
        selectors = child.selectors;
        //console.log("section=" + section + " url=" + url + " selectors=" + selectors);
        toJson.sections.pushUnique(getJsonSection(url, section, selectors));
    }
    d.resolve(toJson);
    return d.promise;
}

function getJsonSection(url, section, selectors){
    var parent = new Object(); var child = new Object();
    child.url = url;
    child.selectors = selectors;
    parent[section] = child;
    return parent;
}

var debugResults = function(results){
    var d = Q.defer();
    console.log("Debug results:");
    console.log(JSON.stringify(results));
    d.resolve(results);
    return d.promise;
}

//write the results
var writeJson = function(results){
//    console.log('WriteJson');
    var json = path  + filename;
    return Q.nfcall(fs.writeFile(json, JSON.stringify(results), function(err){
        console.log('File ' + json + ' successfully written!');
    }));
}

console.log('start scraper');
parseArgs()
    .then(getFirstSection)
    .then(searchLinks)
    .then(processLinks)
    .then(parsePages)
    //.then(debugResults)
    .then(parseResults)
    //.then(debugResults)
    .then(writeJson)
    .done(function(data) {
        console.log('success!');
    }, function(error){
        console.log('Error : ' + error);
    });

