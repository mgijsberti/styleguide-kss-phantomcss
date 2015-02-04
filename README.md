# Living Styleguide Example with automatic PhantomCss comparison of screenshots


This project uses the kss-node implementation of KSS Living Styleguides in combination with PhantomCss.
The PhantomCss validation scripts are generated from the Living Styleguide. With this setup you can automatically
validate any unexpected side-effects of changes (regression) in your css classes.

See for more info about KSS Living Styleguide and PhantomCss:

### KSS Living Styleguides
* http://warpspire.com/kss/styleguides/
* http://web-design-weekly.com/2013/02/01/getting-started-with-kss-node/
* https://github.com/kss-node/kss-node

### PhantomCss
* http://mattsnider.com/using-phantomcss-for-regression-testing-your-css/
* https://github.com/Huddle/PhantomCSS


## Installation

In the root folder, folders test/scraper and test/report

```shell
npm install
```

In test/styleguide

```shell
 npm install
 bower install phantomcss
 bower install resemblejs
```
## Start living styleguide

```shell
grunt styleguide
```

Starts the style guide on http://localhost:1419. The source files and index.html of the living style guide are watched.
The style guide shows the button with different styles. If you change the less files in app/src or the index.html in
kss/template, the style guide is reloaded.

Open a new terminal for the comparison of the changes in css. PhantomCss makes screenshots for each css element of
the style guide, based on the markup of the less files.


## Test the living style guide

The first step is to make a baseline. PhantomCss will generate screenshots in the test/report/screenshots folder. These
screenshots will serve as a baseline.

## Setup baseline

```shell
grunt verify:init
```

## Apply a change in the buttons.less and check the results:

Change in the app/src/buttons.less the padding attribute of the .btn class:

  padding: 4px 22px; into padding: 4px 52px;

Wait for reloading of the Living Styleguide.

Now run

```shell
grunt verify:compare
```

The 'failures' report with differences will automatically load at http://localhost:1421/. PhantomCss will make new
screenshots for each css element in the markup of the less files, and compare them with the originals.
A report will show the originals, the new (after the applied change), and the differences between orginals
and new.

## Reinitialize

```shell
grunt verify:clean
```
This command will reinitialize the validation. All the screenshots are removed.

## Rebase

In the report you can select a selector and rebase the selector. This means that the reported changes
are correct for the css selector. If you press the button 'rebase' for a particular css selector, the
new screenshots are copied onto the originals. If you run again grunt verify:compare, the 'rebased' css selector
is removed from the report.



## Tutorial

This tutorial explains how the PhantomCss diff tool works together with the Living Styleguide.

The living Styleguide is live on localhost:1419. Revert any change in the less files in the demo folder.

* Reinitialize

```shell
grunt verify:clean
```
* Setup a baseline with screenshots for PhantomCss.

```shell
grunt verify:init
```
* Aply the following change in demo/variables.less

  @font-size: 14px; to @font-size: 17px;

* Compare

```shell
grunt verify:compare
```

The report starts at localhost:4121. The buttons are now too large and incorrect,
but the forms are as intended.

* Rebase the forms of section 2 because the font-size change had the intended result. Leave
the buttons in the report.

* Compare again

```shell
grunt verify:compare
```
In the report the forms are now gone.

* Fix the buttons

Add two variables for the font-size of the buttons and the forms in variables.less.
```shell
  @font-size-buttons: 14px;
  @font-size-forms: 17px;
```
Use variable font-size-buttons in buttons.less and font-size-forms in base.less.
Wait for the styleguide to reload. and compare again.

```shell
grunt verify:compare
```

In the report, check that the new buttons have the intended result. Now the report does not show any selectors.
The forms and buttons are correct.

## How to apply the PhantomCss verification process to your styleguide

You need to make some adaptions in the kss living styleguide for the PhantomCss comparison and reporting.
For this example, we assume the kss living styleguide is located in the kss-lib folder.

* Add to the kss-lib/template the helpers directory and the handlebar_helpers.js. The helper registers 'markupId'
identifier. The helpers sets the markUpId to a valide css selector which starts with "s",the section and the class name
(for instance 1.1 will be s1_1). The syncscraper.js in test/scraper will use the markUpId to scrape the selectors and
 store them in selectors-sync.json. The json file is read by the CarpserJs/PhantomCss script comparison.js
 in test/styleguide.

* Add to the kss-lib/index.html the class screenshot and id="{{markupId}}"

```shell
   <tr class="kss-mod-example screenshot" id="{{markupId}}">
      <td colspan="2">{{modifierMarkup}}</td>
   </tr>
```
##Todo
### improve styling report
### jasmine







