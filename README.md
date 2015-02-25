# KSS Living Styleguide and PhantomCss

This project uses the kss-node implementation of KSS Living Styleguides in combination with PhantomCss.
The PhantomCss validation scripts are generated from the Living Styleguide. With this tool you can verify
unexpected side-effects of changes (regression) in the css of your project. All differences are listed in a report.

See for more info about KSS Living Styleguide and PhantomCss:

### Living or Live Styleguides
* http://styleguides.io/
* http://warpspire.com/kss/styleguides/
* http://web-design-weekly.com/2013/02/01/getting-started-with-kss-node/
* https://github.com/kss-node/kss-node

### PhantomCss
* http://mattsnider.com/using-phantomcss-for-regression-testing-your-css/
* https://github.com/Huddle/PhantomCSS


## Installation

In the root folder, folders test/scraper and test/report execute

```shell
npm install
```

In test/styleguide execute

```shell
 npm install
 bower install phantomcss
 bower install resemblejs
```
## Start the example KSS Living Styleguide

```shell
grunt styleguide
```

Starts the style guide on http://localhost:1419. The source files and index.html of the living style guide are watched.
The style guide shows the button with different styles. If you change the less files in demo folder the style guide is
reloaded automatically.



## Test the living style guide

Open a second terminal for the comparison of the changes in css. PhantomCss will procuce screenshots for each css
selector of the style guide, based on the markup in the less files.

The first step is to make a baseline. PhantomCss will generate the screenshots in the test/report/screenshots folder.
These screenshots will serve as the baseline.

## Setup baseline

```shell
grunt verify:init
```

## Apply a change

Change in the demo/variables.less font

   @font-size: 14px; to @font-size: 17px;

Wait for reloading of the living styleguide.

Now execute

```shell
grunt verify:compare
```

The 'differences' report will automatically load at http://localhost:1421/. PhantomCss will make new
screenshots for each css element in the markup of the less files, and compare them with the originals.
A report will show the originals, the new (after the applied change), and the differences between orginals
and new.

![alt tag](https://raw.githubusercontent.com/mgijsberti/styleguide-kss-phantomcss/master/readme_assets/report.png)

## Reinitialize

```shell
grunt verify:clean
```
This command will reinitialize the validation. All the screenshots are removed.

## Rebase

In the report you can select a selector and rebase the selector.If you press the button 'OK' in the column 'rebase'
for a css selector in the styleguide.

![alt tag](https://raw.githubusercontent.com/mgijsberti/styleguide-kss-phantomcss/master/readme_assets/rebase.png)

I you rebase a css selector, it means that the reported differences are intented for this css selector.
If you run again grunt verify:compare, the 'rebased' css selector is removed from the report.


## Tutorial

**Start**
*Revert all the changes in the less files in the demo folder. The living Styleguide is live on localhost:1419.*

This tutorial explains how the PhantomCss comparison tool works together with the Living Styleguide.


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

* Stop in the second terminal the process (ctrl+C) and do another compare. The styleguide (in the first terminal) is
still live.

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
Wait for the styleguide to reload. And compare again.

```shell
grunt verify:compare
```
Now the report does not show any selectors. The buttons have the same font-size of 14px again, and PhantomCss reports
no differences with the baseline. So, the forms and buttons are correct, and the report does not report any differences.

## How to apply to your own styleguide

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










