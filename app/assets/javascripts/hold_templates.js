/*
# Place all the behaviors and hooks related to the matching controller here.
#All this logic will automatically be available in application.js.
#You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/
*/

$(window).load(function() {     //ensure we don't do anything until the page loads fully.
    var $image = $('#grid_background_edit');

    var $rowSize = ( $image.innerHeight() / gon.hold_template.row_count )/ 16.0 ;
    var $colSize = ( $image.innerWidth() / gon.hold_template.column_count )/ 16.0 ;


    // fine tune the row and column size values (which are in ems) to ensure accurate overlay
    $rowSize*=1.16;
    $colSize*=200;


    $('#grid_edit').css("height",$image.innerHeight());
    $('#grid_edit').css("width",$image.innerWidth());
    $('#grid_edit td').css("height",$rowSize+"em");
    $('#grid_edit td').css("width",$colSize+"em");

    $('#grid_edit td').hover(function() {
        $(this).toggleClass("hover");
    });

    $('#grid_edit td').click(function() {
        $(this).toggleClass('selected').toggleClass('unselected');
    });
});

