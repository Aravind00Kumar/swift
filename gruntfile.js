(function () {
    'use strict'
    module.exports = function (grunt) {
        grunt.config.init({

            clean: {
                dist: {
                    src: ['build']
                }
            },
            sass: {
                dev: {
                    files: { './src/styles/main.css': './src/styles/main.scss' }
                }
            },
            watch: {
                sass: {
                    files: ['./src/styles/**/*.scss'],
                    tasks: ['sass'],
                    options: {
                        interrupt: true,
                        spawn: false
                    }
                },
                typescript: {
                    files: ['./src/**/*.ts', '!./src/**/*.d.ts'],
                    tasks: ['typescript'],
                    options: {
                        interrupt: true,
                        spawn: false
                    }
                }
            },
            typescript: {
                base: {
                    src: ['src/**/*.ts'],
                    options: {
                        module: 'commonjs', //or commonjs 
                        target: 'es5', //or es3 
                        sourceMap: true,
                        declaration: false,
                    }
                }
            },

        });

        grunt.task.loadNpmTasks('grunt-contrib-clean');
        grunt.task.loadNpmTasks('grunt-contrib-sass');
        grunt.task.loadNpmTasks('grunt-contrib-watch');
        grunt.task.loadNpmTasks('grunt-typescript');

        //grunt.task.registerTask('watch-files', ['watch:sass', 'watch:typescript']);
        grunt.task.registerTask('default', ['clean', 'sass', 'typescript']);

        // custom tasks

    }
})();