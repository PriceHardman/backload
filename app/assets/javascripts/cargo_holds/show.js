BACKLOAD.cargo_holds.show = function() {
    $(window).load(function() {

        //#####################################################################################
        //######################### Set up the grid environment ###############################
        //#####################################################################################

        var GridBehavior = (function(){ //this module contains the code necessary to set up the grid representing the hold.

            function setCellSelectability() {
                //Loop through the td's in the grid, setting their data-selectable attribute to true
                // if that cell is marked as selectable in the database.
                $('#grid td').each( function(index,value) {
                    if($hold.selectable_cells[index].selectable == "true"){
                        $(this).attr("data-selectable","true");
                    } else {
                        //nothing
                    }
                });
            }

            function cellContentSync(gridSquare,palletSquare) {
                //The actual pallet square data is stored in JavaScript objects in the $pallet_squares global var.
                //This function serves to sync the data in $pallet_squares with the representation of that data
                //in the DOM.

                // a) instantiate empty string. This will hold the pallet data, and will be placed in the corresponding
                //    td in #grid.
                // b) Loop through the pallets in that pallet_square and add pallet[i].destination_code+" "+pallet[i].pallet_number+"\n"
                //    to the string.
                // c) Replace the current value of the td corresponding to this pallet_square with the string.

                var output = "";
                if( (palletSquare.pallets == undefined ) || (palletSquare.pallets.length == 0) ) {
                    // do nothing, the empty string output will be returned
                }
                else {
                    var n = palletSquare.pallets.length;
                    for(var i=0; i< n;i++){
                        var pallet = palletSquare.pallets[n-i-1]; //loop through pallets array backwards,
                        // since first element is on bottom.
                        var thisPalletData = pallet.dest+" "+pallet.pallet_number+"\n";
                        output = output+thisPalletData;
                    }
                }
                gridSquare.text(output); //set the td's value to output.
            }

            function gridSetup() {
                var $image = $('#grid_background');

                //The height of each row is the height of the picture divided by the number of rows
                // The same is true for the width of each column.
                var $rowSize = Math.ceil( $image.innerHeight() / $hold.row_count );
                var $colSize = Math.ceil( $image.innerWidth() / $hold.column_count );

                // fine tune the row and column size values (which are in px) to ensure accurate overlay
                $rowSize*=0.99;

                //Set the sizes of the grid (to the same as the picture)
                // and the cells (to the predetermined sizes)
                $('#grid').css("height",$image.innerHeight());
                $('#grid').css("width",$image.innerWidth());
                $('#grid td').css("height",$rowSize+"px");
                $('#grid td').css("width",$colSize+"px");

                //set the selectability of the cells,
                // based on their values in $hold var, which comes from db.
                setCellSelectability();
            }

            return {
                setCellSelectability: setCellSelectability,
                gridSetup: gridSetup,
                cellContentSync: cellContentSync
            };
        })();

        GridBehavior.gridSetup(); //overlay grid on top of hold picture, set default selectability of cells to true

        //#####################################################################################
        //####################### Set up the cargo data storage scheme ########################
        //#####################################################################################


        /*
            The idea is to have each piece of data stored in one -- and only one -- place.
            On page load, get the $pallet_squares variable and make a copy of it. This copy will
            be compared on submit with the original variable (which the user will be changing
            constantly), and only the changed cells will actually be submitted to the server.


        */
            var $pallet_squares_original = $pallet_squares;







        //#####################################################################################
        //##################### Set up the menus for manipulating cargo #######################
        //#####################################################################################


        //The default behavior for the app is clicking on a pallet square brings up a JQuery UI dialog,
        // in which the user can see the current contents of the pallet square, and buttons in the dialog
        // allow the user to add, edit, rearrange, and delete pallets within the square, as well as move
        // individual pallets to other squares. Clicking the "multi" button at the top of the page will
        // override this default behavior and allow the user to perform batch operations, such as adding
        // and deleting pallets from multiple pallet squares. The 'multi' data attribute governs this behavior.



        function palletMenuVisible() {
            return $('#pallet_menu').is(":visible");
        };

        
        var SingleModeBehavior = (function(){     //module for single-mode behavior

            //setup and behavior
            function palletViewSetup(palletSquare){
                //Set up in-dialog pallet view:
                // Delete current contents. We'll be replacing/updating them.
                // If pallet has no pallets, say so.
                // Otherwise, get the length of the pallets array (i.e. # of pallets in stack) and make
                // an (n x 1) table with that many rows, one td per row, with the pallet's detail in the row.
                // The table will be deleted each time the dialog is closed.

                //delete current contents of pallet view:
                $('#pallet_view tr').remove();


                if( (palletSquare.pallets == undefined) || (palletSquare.pallets.length == 0 ) ){
                    $('#pallet_view').append("<tr><td>This Pallet Square Is Currently Empty.</td></tr>");
                    $('#pallet_view td').css("height","100%");
                    $('#pallet_view td').css("font-size", "100%");
                }
                else {
                    // for the n pallets in the pallet square, append n rows to the table,
                    // each with one cell, the height of which is 100/n % of the height of the parent div.
                    var n = palletSquare.pallets.length;
                    var cell_height = (100/n)+"%";
                    for(var i=0; i< n;i++){
                        var pallet = palletSquare.pallets[n-i-1]; //loop through pallets array backwards,
                        // since first element is on bottom.

                        //make a tr with one td, the contents of which are the pallets destination code and plt #.
                        $('#pallet_view').append("<tr><td id=\"cell_"+i+"\">"+pallet.dest+" "+pallet.pallet_number+"</td></tr>");
                        var thisCell = $("#cell_"+i);

                    }
                    $('#pallet_view td').css("height",cell_height);
                    if(n>1){
                        //if more than one pallet, give the cells borders to separate them
                        $('#pallet_view td').css("border","2px solid black");
                    }
                }        
            }

            function palletSubMenuBehavior(){
                //on open, focus on first field (destination code field)
                $('#destination_code').focus();

                //Use HTML5 input types to ensure that for both input fields, the number section of the keyboard
                // is shown for iPads, eliminating the need for hitting the ".?123" button to show the numbers.
                //Unfortunately, the HTML5 type attribute "tel" will restrict an iPhone user to a keyboard of
                // only numbers. Remedy this by only applying the attribute if the user is not on an iPhone
                if( (/iPhone/i).test(navigator.userAgent) ) {
                   //do nothing
                } else {
                    $('#destination_code').attr("type","tel");
                    $('#pallet_number').attr("type","tel");
                }
            }

            //showing events

            function enterPalletMode() {
                $('#pallet_menu').stop().toggle("slide",{direction: "right"});
                $('#mask_layer').show();
            }

            function palletSubMenuOpen(gridSquare) {
                $('#pallet_menu_sub_menu').show();
                SingleModeBehavior.palletSubMenuBehavior();

            }

            //hiding events

            function palletMenuClose(gridSquare) { //behavior for when the close button is clicked on pallet menu
                $('#mask_layer').hide();
                $('#pallet_menu').stop().toggle("slide",{direction: "right"});
                gridSquare.removeClass("selected");
                $('#pallet_view tr').remove(); //clear the pallet view in the menu.
                $('#pallet_menu').removeAttr("style"); //fix apparent bug in JQueryUI.effect.slide
            }

            function palletSubMenuClose(gridSquare) {
                $('#pallet_menu_sub_menu input').val(""); //reset the input fields to blank
                $('#pallet_menu_sub_menu').hide(); //close the menu

            }

            //single-mode menu buttons

            function singleModeButtonsEvents(gridSquare,palletSquare) {
                //all the button click events for Single Pallet Mode are aggregated here
                palletMenuCloseButtonClick(gridSquare);
                palletMenuDoneButtonClick(gridSquare);
                palletMenuAddButtonClick(gridSquare,palletSquare);
                palletSubMenuSubmitButtonClick(gridSquare,palletSquare);

            }

            function palletMenuCloseButtonClick(gridSquare){
                $('#pallet_menu_close_button').click(function(){
                    palletMenuClose(gridSquare);
                });
            }

            function palletMenuDoneButtonClick(gridSquare){
                $('#pallet_menu_done_button').click(function(){
                    palletMenuClose(gridSquare);
                });
            }

            function palletMenuAddButtonClick(gridSquare,palletSquare){

                $('#add_button').click(function(){
                    SingleModeBehavior.palletSubMenuOpen(gridSquare);
                });
            }

            //single-mode sub-menu (inner menu) buttons

            function palletSubMenuSubmitButtonClick(gridSquare,palletSquare){
                //perform validations (coming soon)
                //create JS object with information from form
                //if pallets==undefined create pallets and push object into pallets array,
                // otherwise just push it (real good).
                // if there's a connection to the server, submit the changes since last submit

                $('#inner_submit_button').unbind('click').bind('click',function(){
                    //need to unbind and rebind click event because click was mysteriously being called twice.

                    var destination_code = $('#destination_code').val().toUpperCase();
                    var pallet_number = $('#pallet_number').val().toUpperCase();

                    var object = {dest: destination_code, pallet_number: pallet_number};

                    if(palletSquare.pallets == undefined ) {   //put the object in the array
                        palletSquare.pallets = [object];
                    } else {
                        palletSquare.pallets.push(object);
                    }


                    //submit it if there's a connection (coming soon)

                    GridBehavior.cellContentSync(gridSquare,palletSquare);
                    SingleModeBehavior.palletViewSetup(palletSquare);

                    SingleModeBehavior.palletSubMenuClose(gridSquare);
                });

            }

            function palletSubMenuCancelButtonClick(gridSquare){
                $('#inner_cancel_button').click(function(){
                    SingleModeBehavior.palletSubMenuClose(gridSquare);
                });
            }

            return {
                //setup and behavior
                palletViewSetup: palletViewSetup,
                palletSubMenuBehavior: palletSubMenuBehavior,
                //showing events:
                enterPalletMode: enterPalletMode,
                palletSubMenuOpen: palletSubMenuOpen,
                //hiding events
                palletMenuClose: palletMenuClose,
                palletSubMenuClose: palletSubMenuClose,
                //single-mode menu buttons:
                singleModeButtonsEvents: singleModeButtonsEvents,
                palletMenuCloseButtonClick: palletMenuCloseButtonClick,
                palletMenuDoneButtonClick: palletMenuDoneButtonClick,
                palletMenuAddButtonClick: palletMenuAddButtonClick,
                //single-mode sub-menu (inner menu) buttons:
                palletSubMenuSubmitButtonClick: palletSubMenuSubmitButtonClick,
                palletSubMenuCancelButtonClick: palletSubMenuCancelButtonClick
            };
        })();

        var MultiModeBehavior = (function(){

            function setMultiModeDefaultOff() {
                //the multi parameter tells the app whether or not the user is carrying out batch operations on cells.
                $('#grid').attr('data-multi',"false"); //set the multi-parameter to false by default.
            }

            function multiModeSetup() { //actions to be carried out when entering multi-pallet (batch) mode
                //Enter Multi-Mode. Do the following:
                // Set the data-multi data attribute to "true" (indicating we're in multi-mode),
                // highlight the multi-button by adding the "button_selected" class, and change the text of button
                // to "Multi-Mode ON".
                $('#grid').attr('data-multi',"true");
                $('#multi_button').css("background-color","lightgreen");
                $('#multi_button').val("Multi-Mode: ON");
            }

            function multiModeCleanup() { //actions to be carried out when leaving multi-pallet (batch) mode
                //Exit multi mode. Do the following:
                // Change the data-multi attr to false, unhighlight the multi button,
                // change the button text to indicate multi mode is now off,
                $('#grid').attr('data-multi',"false");
                $('#multi_button').css("background-color","");
                $('#multi_button').val("Multi-Mode: OFF");
                $('#batch_menu').stop().hide("slide",{direction: "right"});
                $('#grid td.selected').each(function(){$(this).removeClass("selected");});
            }

            //function to simplify checking if we're in multi-mode
            function inMultiMode() {
                if($('#grid').attr('data-multi')=="true"){
                    return true;
                } else {
                    return false;
                };
            };


            return {
                setMultiModeDefaultOff: setMultiModeDefaultOff,
                multiModeSetup: multiModeSetup,
                multiModeCleanup: multiModeCleanup,
                inMultiMode: inMultiMode
            };
        })();





        //logic for the multi button, which toggles multi-pallet mode (assignment of cargo to multiple squares).
        $('#multi_button').click(function(){
            if( MultiModeBehavior.inMultiMode() ){ //if we're in multi-mode
                MultiModeBehavior.multiModeCleanup() //exit multi-mode and clean up
            } else { //if we're not in multi-mode
                MultiModeBehavior.multiModeSetup() //enter multi-mode and set up whats needed
            }
        });


            //what happens when a cell in the hold grid is clicked:
        $('#grid td[data-selectable="true"]').click(function(event){
            var $td = $(event.target); //the cell in the table that was clicked

            //the entry in the array of PalletSquare objects corresponding to the cell in the table.
            var $pallet_square = $.grep($pallet_squares,
                function(value,index){
                    //find the entry in $pallet_squares by grid name
                    return value.name == ($td.data('row')+$td.data('column'));
                })[0]; //grep returns an array, so get the element in the array via [0].

            $(this).toggleClass('selected');


            if( MultiModeBehavior.inMultiMode() ) { //functionality for multi-pallet mode
                $('#batch_menu').stop().show("slide",{direction: "right"});
            } else {  //functionality for single-pallet mode
                SingleModeBehavior.palletViewSetup($pallet_square); //set up the pallet view
                SingleModeBehavior.enterPalletMode();
                SingleModeBehavior.singleModeButtonsEvents($td,$pallet_square); //all single-mode button events

            };
        });



    });
}