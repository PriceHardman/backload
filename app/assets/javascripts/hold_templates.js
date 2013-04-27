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


    //Loop through the td's in the grid, setting their data-selectable attribute to true if that cell is marked as selectable in the database.
    $('#grid td').each( function(index,value) {
       if(gon.hold_template.selectable_cells[index].selectable == "true"){
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

    //##############################################################################################
    //##############################################################################################
    //##############################################################################################


    // If this is the edit_selectable_cells view, then on load loop through the table cells
    // and record the current state of their 'selectable' data tag.

    // The purpose of this is that upon updating the selectable cells, each cell will have its
    // before and after states compared and only those that have changed will be submitted to the server
    // thereby saving bandwidth and increasing speed.

    var gridOnLoad = [];

    $('#grid[data-action="edit_selectable_cells"] td').each(function(index,value){

        gridOnLoad.push( $(this).attr('data-selectable') );
    })



    //##############################################################################################
    //##############################################################################################
    //##############################################################################################





    $('#grid[data-action="edit_selectable_cells"] td').hover(function() {
        $(this).toggleClass("hover");
    });

    $('#grid[data-action="edit_selectable_cells"] td').click(function() {
        $(this).attr('data-selectable',$(this).attr('data-selectable')=='true' ? 'false' : 'true' );
        $(this).toggleClass('selected');
    });


    //##############################################################################################
    //##############################################################################################
    //##############################################################################################


    //When the user clicks the 'update_selectable_cells' button, loop through the cells in the table
    // and record the state of the selectable data attribute. If it does not match that of the
    // corresponding

    $('#update_selectable_cells_form').submit(function() {

        //Loop through the grid cells
        var changedCells = {};
        $('#grid td').each( function(index,value) {
            if( $(this).attr('data-selectable') != gridOnLoad[index] ){

                var thisCell = {}

                thisCell.name = $(this).attr('data-row') + $(this).attr('data-column');
                thisCell.selectable = $(this).attr('data-selectable');

                changedCells[thisCell.name]=thisCell;
            }
        });

        var $data = JSON.stringify(changedCells);

        $('#update_selectable_cells_field').val($data);
        return true
    });
});

