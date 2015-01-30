# Living Styleguide Example with automatic PhantomCss comparison of screenshots


This project uses the kss-node implementation of KSS Living Styleguides in combination with PhantomCss validation.
The PhantomCss validation scripts are generated from the Living Styleguide. With this setup you can automatically
validate any unexpected side-effects of changes in your css classes.

Libraries used are kss-node and phantomcss:

* https://github.com/kss-node/kss-node
* https://github.com/Huddle/PhantomCSS

## Installation

Install the following npm modules with option --saved-dev :
  * grunt
  * grunt-concurrent
  * grunt-contrib-connect
  * grunt-contrib-less
  * grunt-contrib-sass
  * grunt-contrib-watch
  * grunt-kss
  * load-grunt-tasks
  * grunt-styleguide

Or run npm install (which install the dependencies from the package.json)
Run in the folder test/styleguide :
 * npm install bower
 * bower install phantomcss
 * bower install resemblejs

## Start living styleguide

```shell
grunt styleguide
```

Starts the styleguide on http://localhost:1419. The source files and index.html of the living styleguide are watched.
The styleguide shows the button with different styles. If you change the less files in app/src or the index.html in
kss/template, the styleguide is reloaded.

Open a new terminal for the comparison of the changes in css. Phantomcss makes screenshots for each css element of
the styleguide, which are described in the markup of the less files.


## Testing living styleguide


The first step is to set the baseline. Phantomcss will generate screenshots in the test/report/screenshots folder.

## Setup baseline

```shell
grunt concurrent:compare_init
```

## Apply a change in the less and check the results:

Change in the app/src/buttons.less the padding attribute of the .btn class:

  padding: 4px 22px; into padding: 4px 52px;

Wait for reloading of the Living Styleguide.
Now run

```shell
grunt concurrent:compare
```

The report with differences will automatically load at http://localhost:1421/. PhantomCss will make new screenshots
for each css element in the markup of the less files, and compare them with the originals. A report will show the
originals, the new (after the applied change), and the differences.

## Reinitialize


```shell
grunt clean:init
```
This command will reinitialize the validation, all screenshots are removed.

##Rebase

To do




