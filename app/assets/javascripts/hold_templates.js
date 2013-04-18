/*
# Place all the behaviors and hooks related to the matching controller here.
#All this logic will automatically be available in application.js.
#You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/
*/

$(window).load(function() {     //ensure we don't do anything until the page loads fully.
    //First, get all the td's in #grid into an array.
    //Then loop through that array and if the element in gon.hold_template.selectable_cells
    // at the corresponding index is 1, change the td's data-selectable tag to "1" and add the class selectable.



    var $image = $('#grid_background');

    var $rowSize = ( $image.innerHeight() / gon.hold_template.row_count )/ 16.0 ;
    var $colSize = ( $image.innerWidth() / gon.hold_template.column_count )/ 16.0 ;

    // fine tune the row and column size values (which are in ems) to ensure accurate overlay
    $rowSize*=1.16;
    $colSize*=200;

    //Loop through the td's in the grid, setting their data-selectable attribute to 1 if that cell is marked as selectable in the database.
    $('#grid td').each( function(index,value) {
       if(gon.hold_template.selectable_cells[index]==1){
           $(this).attr("data-selectable","true");
           $(this).addClass("selected");
       } else {
           //nothing
       }
    });

    //Set the sizes of the grid itself (to be the same as the picture) and the cells (to be the predetermined sizes)
    $('#grid').css("height",$image.innerHeight());
    $('#grid').css("width",$image.innerWidth());
    $('#grid td').css("height",$rowSize+"em");
    $('#grid td').css("width",$colSize+"em");


    $('#grid[data-action="edit_selectable_cells"] td').hover(function() {
        $(this).toggleClass("hover");
    });

    $('#grid[data-action="edit_selectable_cells"] td').click(function() {
        $(this).toggleClass('selected');
    });

    $('.hidden_input_field').hide(); //hide the input fields. We'll be adding to the selectable_cells one dynamically.

    $('#submit_selectable_cells').submit(function() {
        var new_selectable_array = [];
        $('#grid td').each( function(index) {
            if($(this).hasClass("selected")){
                new_selectable_array.push("1");
            } else {
                new_selectable_array.push("0");
            }
        });
        $('#selectable_cells_text_field').val(new_selectable_array);
        return true;
    });
});

