/*
	Require and initialise PhantomCSS module
	Paths are relative to CasperJs directory
*/
 var phantomcss = require('bower_components/phantomcss/phantomcss.js');

phantomcss.init({
        screenshotRoot: 'test/screenshots',
        libraryRoot: 'test/bower_components/phantomcss'
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


/*
	The test scenario
*/
url  = 'http://localhost:63342/styleguide-poc/styleguide/section-1.html';
console.log('open url ' + url);

casper.start(url);

casper.viewport(1024, 768);

/*
 test is to change
  */

casper.then (function makeScreenShots() {
    var selectors = ["button.btn.btn-primary", "button.btn", "button.btn.btn-primary.pseudo-class-hover", "button.btn.pseudo-class-hover"];
    //var modifiers = [":hover", ":active", ".disabled"];
    var selector = null;
    var message = null;
    for (indexSelectors = 0; indexSelectors < selectors.length; ++indexSelectors) {
        selector = selectors[indexSelectors];
        console.log('Check selector ' + selector);
        if (casper.exists(selector)){
            message = '\nScreenshot for selector [' + selector + ']';
            console.log(message);
            phantomcss.screenshot(selector, message);
            casper.assert
        }else{
            console.log('Selector does not exist' + selector);
        }
//        for (indexSelectors = 0; indexSelectors < selectors.length; ++indexSelectors) {
//            selector = selectors[indexSelectors] + " " + modifiers[indexModifiers];
//            message = '\nScreenshot for selector [' + selector + ']';
//            console.log(message)
//            phantomcss.screenshot(selector, message);
//        }
    }
});

casper.then( function compareScreenshots(){
    console.log('\ncompareScreenshots')
	phantomcss.compareAll();
});

casper.then( function (){
    console.log('\ntests done')
	casper.test.done();
});

/*
Casper runs tests
*/
casper.run(function(){
	console.log('\nend.');
	phantom.exit(phantomcss.getExitStatus());
});

