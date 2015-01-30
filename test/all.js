/**
 * Created by mhodenpijl on 29/12/14.
 *
 * This program serves as a bridge between Grunt tasks and node js programs.
 * The program executes node js scripts in a separate process.
 */
var exec = require('child_process').exec;

module.exports = function(grunt) {

    grunt.registerMultiTask('all', '', function() {
        var self = this;
        var options = this.options;
        var tasks = this.data.tasks || this.data;
        runTask(tasks);
        grunt.task.current.async();
    });
};

function runTask(tasks){
//        console.log('bridge called');
//        console.log("arguments bridge " + this.nameArgs);
    var message = "";
    if(!tasks.cmd){
        //cmd is the command
        message = "cmd is required";
        throw new Error(message);
    }
    var cmd = tasks.cmd;
    console.log("Execute command: " + cmd );
    var child = exec(cmd);
    child.stdout.on('data', function(data) {
        console.log(data);
    });
    child.stderr.on('data', function(data) {
        console.log('error : ' + data);
    });
    child.on('close', function(code) {
        //console.log('closed : ' + code);
    });
}





