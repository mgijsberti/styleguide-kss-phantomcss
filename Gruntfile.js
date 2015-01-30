'use strict';

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-kss');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    var rebase = require('./rebase.js');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadTasks('test');
    var phPath = 'test/';
    var scraper = 'scraper/syncscraper.js';
    var scraperPath = phPath + scraper;
    var casper = 'styleguide/comparison.js --path=test';
    var casperPath = phPath + casper;
    var report = 'report/genindex.js'

    grunt.initConfig({

        //comparison with phantomcss
        clean: {
            init: ["test/report/failures/*.fail.png", "test/report/screenshots/*.png" ],
            rebase: ["test/report/failures/*.fail.png", "test/report/screenshots/*.fail.png" ]
        },
        scraper: {
            run:{ cmd: 'node', options: {path: './test', src: scraper}}
        },
        casper: {
            run:{ cmd: 'casperjs test', options: {path: 'test', src: casper}}
        },
        report:{
            run:{cmd: 'node', options: {path: './test', src: report}}
        },

        //compile less, kss and sass
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

        //run concurrent tasks for watching scripts, styleguide and comparison with phantomcss
        concurrent: {
            connect: {
                tasks: ['watch:scripts', 'connect:styleguide'],
                options: {
                    logConcurrentOutput: true
                }
            },

            //set the baseline, no report is generated yet
            compare_init: {
                tasks: ['clean','scraper','casper'],
                options: {
                    limit:1,
                    logConcurrentOutput: true
                }
            },
            //Report shows the results of the changes
            compare:{
                tasks: ['scraper','casper','report','connect:compare'],
                options: {
                    limit:1,
                    logConcurrentOutput: true
                }
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
            },
            compare:{
                options:{
                    port:1421,
                    protocol: 'http',
                    hostname: 'localhost',
                    keepalive: true,
                    base: ['test/report/'],
                    open: true,
                    livereload: 1422
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

    grunt.registerTask('verify:clean',['clean:init']);
    grunt.registerTask('verify:init',['concurrent:compare_init']);
    grunt.registerTask('verify:compare',['concurrent:compare']);

}


