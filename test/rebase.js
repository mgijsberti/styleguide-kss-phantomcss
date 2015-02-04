var fs = require('fs');
var Q = require("q");


var getData = function(url){
    var d = Q.defer();
    console.log("getData [" + url + "]");
    var value = {
        "section" : "",
        "selector" : ""
    }
    var r = new RegExp("section=");
    var parts = url.split(r);
    var parts2 = null;
    for(var i = 0; i < parts.length; i++){
        //console.log('parts i[' + i + '] : ' + parts[i]);
        if(i == 1){
            r = new RegExp("&selector=");
            var p1 = parts[i]
            //console.log('split  [' + p1 + ']');
            parts2 = p1.split(r);
            //for(var x = 0; x < parts2.length; x++){
            //    console.log('.... parts2 x[' + x + '] : ' + parts2[x]);
            //}
            if(parts2.length == 2){
                var r = new RegExp("\\.","g");
                value.section = parts2[0].replace(r,"_");
                console.log('Section : [ ' + value.section  + ' ]');
                value.selector = parts2[1];
            }
        }
    }
    d.resolve(value);
    return d.promise;
}

var copyFile = function(data) {
    var d = Q.defer();
    var source =  data.diff;
    var target =  data.original;
    console.log("copyFile :  [" + source + "] to target [" + target + "]");
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
        done(err);
    });
    wr.on("close", function(ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cbCalled = true;
            if(err){
                console.log("error copy ready : " + err);
                d.reject(new Error("Cannot copy [" + source + "] to [" + target + "]"));
            } else {
                console.log("copy ready OK");
                d.resolve(data);
            }
        }
    }
    return d.promise;
}

var deleteScreenshots = function (data){
    var d = Q.defer();
    var source = data.failed.screenshots;
    console.log("deleteScreenshots:  [" + source + "]");
    fs.unlink(source, function (err){
        if(err){
            console.log('Error delete : [' + source + '] error '  + err);
            d.reject(new Error("Cannot delete [" + source + "]"));
        } else {
            console.log("delete ready OK : [" + source + "]");
            d.resolve(data);
        }
    });
    return d.promise;
}

var deleteFailures = function (data){
    var d = Q.defer();
    var source = data.failed.failures;
    console.log("deleteFailures: [" + source + "]");
    fs.unlink(source, function (err){
        if(err){
            console.log('Error delete : [' + source + '] error '  + err);
            d.reject(new Error("Cannot delete [" + source + "]"));
        } else {
            console.log("delete ready OK : [" + source + "]");
            d.resolve(data);
        }
    });
    return d.promise;
}

function getImageName(section, selector){
    var noSelector = encodeURIComponent("no selector");
    console.log("getImageName: section [" + section + "] selector [" + selector + "]");
    if(selector.match(noSelector)) {
        return "/s" + section;
    } else {
        return "/s" + section + "_" + selector;
    }
}

var getImagePath = function(data){
    var d = Q.defer();
    console.log('getImagePath : ' + JSON.stringify(data));
    var failuresPath =  "test/report/failures";
    var screenshotPath = "test/report/screenshots";
    var value = {
        "failed" : {
            "failures" : "",
            "screenshots" : ""
        },
        "original" : "",
        "diff": ""
    }
    var section = data.section;
    var selector = data.selector;
    var imageName = getImageName(section,selector);
    value.failed.screenshots = screenshotPath + imageName + ".fail.png";
    value.failed.failures  = failuresPath  +  imageName + ".fail.png";
    value.original =  screenshotPath +  imageName + ".png";
    value.diff =  screenshotPath + imageName + ".diff.png";
    d.resolve(value);
    return d.promise;
}


module.exports = function rebase(req, res, next){
    if (req.url.match('/test/rebase')) {
        console.log('Rebase test is called [ ' + req.url + ' ]');
        getData(req.url)
            .then(getImagePath)
            .then(copyFile)
            .then(deleteScreenshots)
            .then(deleteFailures)
            .done(
                function(data) {
                    console.log('success!');
                    res.end('success');
                }, function(error){
                    console.log('Error : ' + error.message);
                    res.end('error');
                }
            );
    } else {
        next();
    }
};


