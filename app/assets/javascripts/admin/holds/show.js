BACKLOAD.holds.show = function () {
    $(window).load(function() {     //ensure we don't do anything until the page loads fully.
        //First, get all the td's in #grid into an array.
        //Then loop through that array and if the element in window.hold.selectable_cells
        // at the corresponding index is 1, change the td's data-selectable tag to "1" and add the class selectable.

        var $image = $('#grid_background');
        //var $hold is defined in /holds/show.html.erb as @hold in holds_controller#show

        var $rowSize = Math.ceil( $image.innerHeight() / $hold.row_count ) ;
        var $colSize = Math.ceil( $image.innerWidth() / $hold.column_count );

        // fine tune the row and column size values (which are in ems) to ensure accurate overlay
        $rowSize*=0.99;
        //$colSize*=200;


        //Loop through the td's in the grid, setting their data-selectable attribute to true if that cell is marked as selectable in the database.
        $('#grid td').each( function(index,value) {
            if($hold.selectable_cells[index].selectable == "true"){
                $(this).attr("data-selectable","true");
                $(this).addClass("selected");
            } else {
                //nothing
            }
        });


        //Set the sizes of the grid itself (to be the same as the picture) and the cells (to be the predetermined sizes)
        $('#grid').css("height",$image.innerHeight());
        $('#grid').css("width",$image.innerWidth());
        $('#grid td').css("height",$rowSize+"px");
        $('#grid td').css("width",$colSize+"px");



    });
}