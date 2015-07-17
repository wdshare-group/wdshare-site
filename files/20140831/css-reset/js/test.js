(function(window,undefined){
    var hello = 123;

    var helloTest = function(){
        console.log('test');
    };
    window.test = {
        hello:hello,
        helloTest:helloTest
    }

})(window)

