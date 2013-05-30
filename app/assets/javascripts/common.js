//Initialize the object literals that encapsulate our application's JS code.

BACKLOAD = new Object(); //encapsulates all the application's JS
BACKLOAD.common = new Object(); //encapsulates the JS code common to the entire application

//Initialize
BACKLOAD.holds = new Object();
BACKLOAD.cargo_holds = new Object();

BACKLOAD.common.common = function() {
    //site-wide js code goes here
}