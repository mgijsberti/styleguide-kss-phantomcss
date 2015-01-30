//http://mikefowler.me/2013/10/14/static-styleguides-kss-node/
//https://github.com/indieisaconcept/grunt-styleguide

//var rebase = require('./rebase.js');
//grunt.loadNpmTasks('grunt-contrib-clean');
//grunt.loadNpmTasks('grunt-contrib-less');
//grunt.loadNpmTasks('grunt-contrib-watch');

//variables for phantomCss testing
//grunt.loadTasks('test');
//var phPath = 'test/';
//var scraper = 'scraper/syncscraper.js';
//var scraperPath = phPath + scraper;
//var casper = 'styleguide/comparison.js';
//var casperPath = phPath + casper;
//var report = 'report/genindex.js'
//var reportPath = phPath + report;
//var cmdAll = 'node ' + scraperPath + ' && casperjs test ' + casperPath + ' && ' + ' node ' + reportPath;

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-kss');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.initConfig({

        less: {
            development: {
                options: {
                    paths: ["app/src"]
                },
                files: {
                    "styleguide/public/style.css": "app/**/*.less"
                }
            }
        },

        kss: {
            options: {
                includeType: 'less',
                template: 'kss/template',
                helpers: 'kss/template/helpers'
            },
            dist: {
                files: {
                    'styleguide': ['app/src/']
                }
            }
        },

        sass: {
            dist: {
                files: {
                    'kss/template/public/kss-style.css': 'kss/template/scss/kss-style.scss'
                }
            }
        },
        concurrent: {
            connect: ['watch:scripts','connect:styleguide'],
            options: {
                logConcurrentOutput: true
            }
        },
        watch: {
            scripts: {
                files: ['kss/template/*.html', 'app/src/*.less'],
                tasks: ['styleguide'],
                options: {
                    spawn: false,
                    livereload: 1420
                }
            }
        },
        connect: {
            styleguide: {
                options: {
                    port: 1419,
                    protocol: 'http',
                    hostname: 'localhost',
                    keepalive: true,
                    base: 'styleguide',
                    open: true,
                    livereload: 1420,
                    development: true
                }
            }
        }

    });

    grunt.registerTask('styleguide', [
        'sass',
        'kss',
        'less',
        'concurrent:connect'
    ]);
}


