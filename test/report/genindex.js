var fs=require('fs'),
    mustache = require('mustache'),
    EventEmitter=require('events').EventEmitter,
    filesEE=new EventEmitter(),
    myfiles=[],
    htmlTemplate;

var failuresPath =  "../styleguide/failures";
var screenshotPath = "../styleguide/screenshots";

function getFailuresPath(){
    path = "..";
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
    path = path + "/styleguide/failures";
//    console.log("failures path [" + path + "]");
    return path;
}

function getReportPath(){
    path = "..";
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
    path = path + "/report/" + 'failures.html';
//    console.log("report path [" + path + "]");
    return path;
}

function getTemplatePath(){
    path = "..";
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
    path = path + "/report/" + 'index_template.html';
//    console.log("report path [" + path + "]");
    return path;
}
//pushes unique values into an array
Array.prototype.pushUnique = function(value){
    if (this.indexOf(value) === -1) {
        this.push(value);
    }
}

fs.readdir(getFailuresPath(),function(err,files){
    if(err) throw err;
    files.forEach(function(file){
//        console.log('file : [' + file + '] last failure: [' + getLastFailure(file) + ']')
        myfiles.pushUnique(getLastFailure(file));
    });
    filesEE.emit('files_ready'); // trigger files_ready event
});


filesEE.on('files_ready',function(){
    console.dir('files ready');
    var out = '';
    for(var i=0;i<myfiles.length;i++){
        out = out + 'File [' + i + '] ' + myfiles[i] + '\n';
    }
//    console.log(out);
    fs.readFile(getTemplatePath(), 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        htmlTemplate = data;
        //console.log(htmlTemplate);
        demoData = getData(myfiles);
        //console.log(demoData);
        var html = mustache.to_html(htmlTemplate, demoData);
        //console.log('show html');
        //console.log(html);
        var report = getReportPath();
        fs.writeFile(report, html, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log('Write to ' + report + ' success!! ')
        });
    });
});

function getData(files){
    var data = {
        files: []
    };
    for(var i in files) {
        var failure = files[i];
        if(typeof failure == "string"){
//            console.log("Failure is " + failure);
            var item = clean(failure);
//            console.log("Item is " + item);
            var jsonArg = new Object();
            jsonArg.section = getSection(item);
            jsonArg.selector = getSelector(item);
            jsonArg.original = getOriginal(item);
            jsonArg.diff = getDiff(item);
            jsonArg.path = getFailure(failure);
            jsonArg.id = getId(item);
            //debug(jsonArg);
            data.files.push(jsonArg);
        }
    }
    return data;
}

function debug(jsonArg){
    console.log('path ' + jsonArg.path );
    console.log('section ' + jsonArg.section );
    console.log('selector ' + jsonArg.selector);
    console.log('original ' + jsonArg.original);
    console.log('diff ' + jsonArg.diff);
    console.log('id ' + jsonArg.id);
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


//s1_1_button__arrowRight.fail.png -> 1.1
//s1_1.fail.png --> 1.1
//s1_4_2_1_icon__b_icon__align_top.fail.png --> 1.4.2.1
//1_4_2_1.fail.png --> 1.4.3.1
function getSection(item){
    var r = new RegExp("^[\\d_]*");
    var parts = item.match(r);
    var l = parts.length;
    var name = ";"
    if(l == 1 && parts[0]){
        name = parts[0];
    }
    if(name.endsWith("_")){
        name = name.slice(0,-1);
    }
    r = new RegExp("_","g");
    name = name.replace(r,".");
    return name;
}

//get the name of the selector
//s1_1_button__arrowRight.fail.png -> button__arrowRight
//s1_1.fail.png --> ""
//s1_4_2_1_icon__b_icon__align_top.fail.png --> icon__b_icon__align_top
//1_4_2_1.fail.png --> ""
function getSelector(item){
    var name = "";
    var r = new RegExp("^[\\d_]*");
    var parts = item.split(r);
    if(parts.length == 2 && parts[1]){
        name = parts[1];
    } else{
        name = "no selector";
    }
    return name;
}

function getId(item){
    var section = getSection(item);
    var selector = getSelector(item);
    if(selector.match('no selector')){
        selector = '';
    } else {
        var s = new RegExp("_","g");
        selector = "-" + selector.replace(s,"-");
    }
    var r = new RegExp("\\.","g");
    return "s" + section.replace(r,"-") + selector;
}

//memoize function for local caching based on https://github.com/addyosmani/memoize.js
function memoize( fn ) {
    return function () {
        var args = Array.prototype.slice.call(arguments),
            hash = "",
            i = args.length;
        currentArg = null;
        while (i--) {
            currentArg = args[i];
            hash += (currentArg === Object(currentArg)) ?
                JSON.stringify(currentArg) : currentArg;
            fn.memoize || (fn.memoize = {});
        }
        if(hash in fn.memoize ){
            //console.log("Cache hit " +hash);
            return fn.memoize[hash];
        } else {
            //console.log("Cache miss " +hash)
            return fn.memoize[hash] = fn.apply(this, args);
        }
    };
}

function getLastFailure(item){
    var s = new RegExp("\\.\\d\\.fail\\.png");
    var first = null;
    var last = first + ".fail.png";
//    console.log('getLastFailure  item : [' + item + ']');
    var getLastCached = memoize(getLast);
    if(item.match(s)) {
        first = getFailuresPath() + "/" + item.replace(s, "");
        last = getLastCached(first);
    } else {
        var r = new RegExp("\\.fail\\.png");
        first = getFailuresPath() + "/" + item.replace(r,"");
        last = getLastCached(first);
    }
//    console.log("Failure [" + last + "]");
    return last;
}

function getLast(element){
    var increment = 0;
//    console.log("element is  " + element);
    var last = element + ".fail.png";
    while (fs.existsSync(last)) {
//        console.log("Last [" + last + " found !");
        increment++;
        last = element + "." + increment + ".fail.png";
    }
    increment--;
    if(increment === 0){
        return element + ".fail.png";
    }
    return element + "."  + increment + ".fail.png";
}

function getDiff(item){
    return screenshotPath + "/" + "s" + item + ".diff.png";
}

function getOriginal(item){
    return screenshotPath + "/" + "s" + item + ".png";
}

function getFailure(item){
    var r = new RegExp("\\./test/styleguide/failures");
    var name = item.replace(r,"");
    return failuresPath + name;
}

//removes the path, the .[\\d].fail.png and the start letter "s"
function clean(item){
//    var r = new RegExp("\\.\\./styleguide/failures/");
    var r = new RegExp("\\./test/styleguide/failures/");
    var name = item.replace(r,"");
    r = new RegExp("\\.\\d\\.fail\\.png","g");
    if(!item.match(r)) {
        r = new RegExp("\\.fail\\.png", "g");
    }
    name = name.replace(r, "");
    r = new RegExp("s");
    return name.replace(r, "");
}


