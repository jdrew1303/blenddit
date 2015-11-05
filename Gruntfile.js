module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
                '* <%= pkg.name %> - v<%= pkg.version %> - Auto-compiled on <%= grunt.template.today("yyyy-mm-dd") %> - Copyright <%= grunt.template.today("yyyy") %> \n' +
                '* @author <%= pkg.author %>\n' +
                '*/',
        pathDev: 'src',
        pathBuild: 'dist',
        pathAssets: 'assets',
        pathViews: 'views',
        watch: {
            styles: {
                files: ['<%= pathDev %>/<%= pathAssets %>/less/**/*.less'],
                tasks: ['less:dev_main', 'less:dev_themes'],
                options: {
                    nospawn: true
                }
            }
        },
        clean: {
            build: {
                src: ['<%= pathBuild %>/']
            }
        },
        less: {
            dev_main: {
                options: {
                    banner: '<%= banner %>'
                },
                files: {
                    '<%= pathDev %>/<%= pathAssets %>/css/blenddit.css': '<%= pathDev %>/<%= pathAssets %>/less/main.less'
                }
            },
            dev_themes: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    '<%= pathDev %>/<%= pathAssets %>/css/themes/amethyst.min.css': '<%= pathDev %>/<%= pathAssets %>/less/themes/amethyst.less',
                    '<%= pathDev %>/<%= pathAssets %>/css/themes/city.min.css': '<%= pathDev %>/<%= pathAssets %>/less/themes/city.less',
                    '<%= pathDev %>/<%= pathAssets %>/css/themes/flat.min.css': '<%= pathDev %>/<%= pathAssets %>/less/themes/flat.less',
                    '<%= pathDev %>/<%= pathAssets %>/css/themes/modern.min.css': '<%= pathDev %>/<%= pathAssets %>/less/themes/modern.less',
                    '<%= pathDev %>/<%= pathAssets %>/css/themes/smooth.min.css': '<%= pathDev %>/<%= pathAssets %>/less/themes/smooth.less'
                }
            },
            build: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2,
                    banner: '<%= banner %>'
                },
                files: {
                    '<%= pathBuild %>/<%= pathAssets %>/css/blenddit.min.css': '<%= pathDev %>/<%= pathAssets %>/less/main.less',
                    '<%= pathBuild %>/<%= pathAssets %>/css/themes/amethyst.min.css': '<%= pathDev %>/<%= pathAssets %>/less/themes/amethyst.less',
                    '<%= pathBuild %>/<%= pathAssets %>/css/themes/city.min.css': '<%= pathDev %>/<%= pathAssets %>/less/themes/city.less',
                    '<%= pathBuild %>/<%= pathAssets %>/css/themes/flat.min.css': '<%= pathDev %>/<%= pathAssets %>/less/themes/flat.less',
                    '<%= pathBuild %>/<%= pathAssets %>/css/themes/modern.min.css': '<%= pathDev %>/<%= pathAssets %>/less/themes/modern.less',
                    '<%= pathBuild %>/<%= pathAssets %>/css/themes/smooth.min.css': '<%= pathDev %>/<%= pathAssets %>/less/themes/smooth.less'
                }
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1,
                keepSpecialComments: 0
            },
            build: {
                files: {
                    '<%= pathBuild %>/<%= pathAssets %>/css/blenddit.min.css' : [
                        '<%= pathBuild %>/<%= pathAssets %>/css/blenddit.min.css',
                        '<%= pathDev %>/<%= pathAssets %>/js/plugins/slick/slick.min.css',
                        '<%= pathDev %>/<%= pathAssets %>/js/plugins/slick/slick-theme.min.css'
                    ]
                }
            },
            legacy: {
                files: {
                    '<%= pathBuild %>/<%= pathAssets %>/css/legacy.blenddit.min.css' : [
                       '<%= pathDev %>/<%= pathAssets %>/css/legacy.bootstrap.min.css', 
                       '<%= pathDev %>/<%= pathAssets %>/css/legacy.blenddit.css'
                    ]
                }
            }
        },
        es6transpiler: {
            options: {
                disallowUnknownReferences: false
            },
            build: {
                files: {
                    '<%= pathDev %>/<%= pathAssets %>/js/blenddit.es5.js' : '<%= pathDev %>/<%= pathAssets %>/js/blenddit.js'
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            build: {
                src: [
                    '<%= pathDev %>/<%= pathAssets %>/js/core/jquery.min.js',
                    '<%= pathDev %>/<%= pathAssets %>/js/core/bootstrap.min.js',
                    '<%= pathDev %>/<%= pathAssets %>/js/core/jquery.slimscroll.min.js',
                    '<%= pathDev %>/<%= pathAssets %>/js/core/jquery.scrollLock.min.js',
                    '<%= pathDev %>/<%= pathAssets %>/js/core/jquery.appear.min.js',
                    '<%= pathDev %>/<%= pathAssets %>/js/core/jquery.countTo.min.js',
                    '<%= pathDev %>/<%= pathAssets %>/js/core/jquery.placeholder.min.js',
                    '<%= pathDev %>/<%= pathAssets %>/js/core/js.cookie.min.js',
                    '<%= pathDev %>/<%= pathAssets %>/js/app.js',
                    // Add plugins and blenddit application scripts
                    '<%= pathDev %>/<%= pathAssets %>/js/plugins/slick/slick.min.js',
                    '<%= pathDev %>/<%= pathAssets %>/js/ga.js',
                    '<%= pathDev %>/<%= pathAssets %>/js/blenddit.es5.js'
                ],
                dest: '<%= pathBuild %>/<%= pathAssets %>/js/blenddit.min.js'
            },
            legacy: {
                src: [
                    '<%= pathDev %>/<%= pathAssets %>/js/legacy.blenddit.js',
                    '<%= pathDev %>/<%= pathAssets %>/js/ga.js'
                ],
                dest: '<%= pathBuild %>/<%= pathAssets %>/js/legacy.blenddit.min.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            build: {
                files: {
                    '<%= pathBuild %>/<%= pathAssets %>/js/blenddit.min.js': ['<%= pathBuild %>/<%= pathAssets %>/js/blenddit.min.js']
                }
            },
            legacy: {
                files: {
                    '<%= pathBuild %>/<%= pathAssets %>/js/legacy.blenddit.min.js': ['<%= pathBuild %>/<%= pathAssets %>/js/legacy.blenddit.min.js']
                }
            }
        },
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= pathDev %>/<%= pathAssets %>/css/',
                        src: 'bootstrap.min.css',
                        dest: '<%= pathBuild %>/<%= pathAssets %>/css/'
                    },
                    {
                        expand: true,
                        cwd: '<%= pathDev %>/<%= pathAssets %>/fonts/',
                        src: '**',
                        dest: '<%= pathBuild %>/<%= pathAssets %>/fonts/'
                    },
                    {
                        expand: true,
                        cwd: '<%= pathDev %>/<%= pathAssets %>/img/',
                        src: '**',
                        dest: '<%= pathBuild %>/<%= pathAssets %>/img/'
                    },
                    {
                        expand: true,
                        cwd: '<%= pathDev %>/<%= pathViews %>/',
                        src: '**',
                        dest: '<%= pathBuild %>/<%= pathViews %>/'
                    }
                ]
            }
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-es6-transpiler');

    // Register Tasks
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', [ // 'grunt build' builds the production version of blenddit
        'clean:build',          // 1. "Cleans" the production directory (dist) before performing further tasks
        'less:build',           // 2. Compiles main.less to blenddit.min.css
        'cssmin:build',         // 3. Concats theme css and plugin css to blenddit.min.css and then minifies it for production
        'es6transpiler:build',  // 4. Transpiles the es6 blenddit.js to blenddit.es5.js so that ugilify:build can minify.
        'concat:build',         // 5. Concats all of OneUI's core application scripts, used plugins, and custom application scripts
        'concat:legacy',        // 6. Concats all of the legacy blenddit scripts
        'uglify:build',         // 7. Takes the result of concat:build and minifies it for production
        'uglify:legacy',        // 8. Takes the result of concat:legacy and minifies it
        'cssmin:legacy',        // 9. Minifies all of the legacy css
        'copy:build'            // 10. Copies relevant assets from development to production
    ]);
    grunt.registerTask('legacy', ['concat:legacy', 'uglify:legacy', 'cssmin:legacy']);
};