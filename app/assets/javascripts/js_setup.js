SETUP = {
    exec: function( controller, action ) {
        var backload = BACKLOAD,
            action = ( (action === undefined) ? "common" : action );

        if ( controller !== "" && backload[controller] && typeof backload[controller][action] == "function" ) {
            backload[controller][action]();
        }
    },

    init: function() {
        var body = document.body,
            controller = body.getAttribute("data-controller"),
            action = body.getAttribute("data-action");

        SETUP.exec("common");  // execute site-wide js in assets/javascripts/common.js:BACKLOAD.common.init()
        SETUP.exec(controller); // execute assets/javascripts/<controller>/common.js
        SETUP.exec(controller,action); // execute assets/javascripts/<controller>/<action>.js
    }
};

$(document).ready(SETUP.init ); //load the JS