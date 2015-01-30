/**
 * Created by mhodenpijl on 29/12/14.
 *
 * This program serves as a bridge between Grunt tasks and node js programs.
 * The program executes node js scripts in a separate process.
 */
var spawn = require('child_process').spawn;

module.exports = function(grunt) {

    grunt.registerMultiTask('spawn', '', function() {
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
    //cmd = tasks.cmd;
    var cmd = tasks.cmd;
    var options = tasks.options
    console.log("Execute command: " + cmd + '   ' + options );
    var child = spawn(cmd, options);
    child.on('error',function(error){
        throw error;
    })
    child.stdout.on('data', function(data) {
        console.log('' + data);
    });
    child.stderr.on('data', function(data) {
        console.log('error : ' + data);
    });

    child.on('disconnect', function(code){
       console.log('disconnect : ' + code);
        child.connected = true;
    });

    child.on('close', function(code) {
        console.log('closed - child connected  : ' + child.connected);

    });

}





