'use strict';

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-kss');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    var rebase = require('./test/report/rebase.js');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadTasks('test');
    var scraper = 'scraper/syncscraper.js';
    var casper = 'styleguide/comparison.js --path=test';
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

        //compile less and kss
        less: {
            styleguide: {
                options: {
                    paths: ["demo"]
                },
                files: {
                    "styleguide/public/style.css": "demo/**/*.less"
                }
            }
        },
        kss: {
            options: {
                includeType: 'less',
                template: 'kss-lib/template',
                helpers: 'kss-lib/template/helpers'
            },
            dist: {
                files: {
                    'styleguide': ['demo']
                }
            }
        },
        //run concurrent tasks for watching scripts, styleguide and comparison with PhantomCss
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
                tasks: ['clean:rebase','scraper','casper','report','connect:compare'],
                options: {
                    limit:1,
                    logConcurrentOutput: true
                }
            },
            report: {
                tasks: ['report', 'connect:compare'],
                options: {
                    limit: 1,
                    logConcurrentOutput: true
                }
            }
        },
        watch: {
            scripts: {
                files: ['kss/template/*.html', 'demo/**/*.less'],
                tasks: ['styleguide'],
                options: {
                    spawn: false,
                    livereload: 1420
                }
            }
        },
        connect: {
            //serve styleguide on localhost:1419/
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
            //serve PhantomCss report on localhost:1421/
            compare:{
                options:{
                    port: 1421,
                    protocol: 'http',
                    hostname: 'localhost',
                    keepalive: true,
                    base: ['test/report/'],
                    open: true,
                    livereload: 1422,
                    middleware: function(connect, options, middlewares) {
                        middlewares.push(rebase);
                        middlewares.unshift(function (req, res, next) {
                            return next();

                        });
                        return middlewares;
                    }
                }
            }
        }

    });

    grunt.registerTask('styleguide', [
        'kss',
        'less:styleguide',
        'concurrent:connect'
    ]);

    grunt.registerTask('verify:clean',['clean:init']);
    grunt.registerTask('verify:init',['concurrent:compare_init']);
    grunt.registerTask('verify:compare',['concurrent:compare']);
    grunt.registerTask('verify:report',['concurrent:report']);

}


