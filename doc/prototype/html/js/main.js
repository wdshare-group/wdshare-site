/*
  auther:f7
  date:2014.11
*/

requirejs.config({
    paths: {
        jquery: [
            './jquery-1.11.1.min'
        ]
    },
    shim: {
        
    }
});

function domready() {
    
    
};

require(["jquery"], function() {
    domready();
});