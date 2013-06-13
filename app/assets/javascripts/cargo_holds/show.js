BACKLOAD.cargo_holds.show = function() {
    $(window).load(function() {

        //#####################################################################################
        //######################### Set up the grid environment ###############################
        //#####################################################################################
        var Helpers = (function(){

            function getGridSquare(name) { //return jQuery selector for grid with name passed to input (e.g. "A7").
                var row = name.match(/[A-Z]/)[0];
                var column = name.match(/\d+/)[0];
                return $("#grid td[data-row='"+row+"'][data-column='"+column+"']");
            }

            function getPalletSquare(name){
                //return object from $pallet_squares var, find it using $.grep

                var output = $.grep($pallet_squares,function(element,index){
                    return element.name == name;
                })[0];

                return output;
            }


            return {
                getGridSquare: getGridSquare,
                getPalletSquare: getPalletSquare
            }
        })();

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

            function populateGridSquaresFromJSVars() {
                //loop through each element in the $pallet_squares array and populate the values of the cells in the grid
                //with the data from the pallet objects in each pallet square object
                $.each($pallet_squares,function(index,value){
                    var row = value.name.match(/[A-Z]/)[0];
                    var column = value.name.match(/\d+/)[0];
                    var $td = Helpers.getGridSquare(row+column);

                    //sync the contents of the cell with the values in the JS var:
                    GridBehavior.cellContentSync($td,value);
                });
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

            function palletMenuVisible() {
                return $('#pallet_menu').is(":visible");
            }

            /*
            function getPalletSquareState() {
                return $.extend(true,{},$pallet_squares); //return a static deep copy of the $pallet_square var.
                                                          // see jQuery documentation for details
            }
            */

            function getChangedPalletSquares(){
                //after each pallet operation by the user, this function will run to capture the
                //changes made by the user to the $pallet_squares var since the last change.



                //an object containing the added, updated, and deleted collections are returned

                //take the var to which $pallet_squares_static was assigned on page load/update as input.
                // Compare the pallet arrays in the palletSquare objects in original collection to those currently in $pallet_squares var
                // Any differences will be copied into a collection and returned.

                var add = []; //holds the palletSquare objects of squares that have had content either added.
                var update = [];
                var destroy = [];   //holds the NAMES (e.g. "B7") of palletSquare objects that are now empty,
                                    // i.e. their contents were batch deleted, or a single pallet deleted such that the square is now empty.


                //iterate over the current array of objects, comparing the pallets property with the corresponding original object for equality
                $.each($pallet_squares, function(index,value){
                    var original = $pallet_squares_static[index]; //the original state of the palletSquare object at hand
                    var current = value;


                    //There are four possible combinations as far as the pallet collections are concerned:
                    // both original.pallets and current.pallets are undefined, both are defined, original
                    // is defined and current is undefined, and vice-versa.

                    // If both are undefined, then the spots haven't been touched. Skip to the next pallet square in order
                    // to avoid undefined errors.

                    // If original.pallets is undefined and current.pallets is defined, then a pallet was added to a
                    // previously-empty pallet square. Record this as an added pallet by adding the square object to array "added".

                    // If original.pallets is defined and current.pallets is undefined, this implies the user has deleted
                    // the contents of the pallet square (either via a batch delete of the entire square, or a single delete of
                    // a square with only one pallet in it). Record this is a deleted pallet by adding the square object to array "deleted"

                    // If both are defined, then either an update or nothing occurred. Take the pallet arrays of both
                    // original and current, and JSON.stringify them. Check if they are different. This implies an update.

                    if(original.pallets === undefined && current.pallets === undefined ) {
                        return true; // skip to the next pallet
                    }



                    if( original.pallets === undefined && current.pallets !== undefined) {
                        add.push(current); //record this as an add.
                        return true; // move on to the next pallet
                    }

                    if( original.pallets !== undefined && current.pallets === undefined ) {

                        destroy.push(current);
                        return true; // move on to the next pallet
                    }

                    if( original.pallets !== undefined && current.pallets !== undefined ) {
                        var orig = JSON.stringify(original.pallets);
                        var curr = JSON.stringify(current.pallets);


                        if(original.pallets.length == 0 && current.pallets.length == 0) {
                            return true; // skip to the next pallet
                        }

                        if(original.pallets.length == 0 && current.pallets.length > 0) {
                            add.push(current);
                            return true;
                        }

                        if(original.pallets.length > 0 && current.pallets.length == 0) {
                            destroy.push(current);
                            return true;
                        }


                        //check for update by comparing the strings.
                        if(curr !== orig ){
                            update.push(current);
                            return true;
                        }
                    }




                });

                var results = {add:add,update:update,destroy:destroy};

                //Only one of "add", "update" and "destroy" will have any entries in it.
                for(var action in results){
                    if(results[action].length > 0){
                        return {action: action.toUpperCase(), data: results[action]};
                        //break;
                    }
                }
            }

            return {
                setCellSelectability: setCellSelectability,
                gridSetup: gridSetup,
                cellContentSync: cellContentSync,
                populateGridSquaresFromJSVars: populateGridSquaresFromJSVars,
                palletMenuVisible: palletMenuVisible,
                getChangedPalletSquares: getChangedPalletSquares

            };
        })();
        
        var SingleModeBehavior = (function(){     //module for single-mode behavior

            //setup and behavior
            function palletViewSetup(palletSquare){
                //Set up pallet view:
                // Delete current contents. We'll be replacing/updating them.
                // If pallet has no pallets, say so.
                // Otherwise, get the length of the pallets array (i.e. # of pallets in stack) and make
                // an (n x 1) table with that many rows, one td per row, with the pallet's detail in the row.
                // The table will be deleted each time the dialog is closed.
                // Enable and disable the appropriate action buttons on open

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
                        $('#pallet_view').append("<tr><td id=\"cell_"+i+"\" class=\"pallet_view_pallet\">"+pallet.dest+" "+pallet.pallet_number+"</td></tr>");
                        var thisCell = $("#cell_"+i);

                    }
                    $('#pallet_view td').css("height",cell_height);
                    if(n>1){
                        //if more than one pallet, give the cells borders to separate them
                        $('#pallet_view td').css("border","2px solid black");
                    }
                }

                palletViewSetPermittedActions(palletSquare); //// Enable and disable the appropriate action buttons on open


            }
            
            function palletMenuBehavior(){
                
            }

            function palletViewPalletClick(palletSquare){
                $('.pallet_view_pallet').click(function(event){ //when any pallet td in the pallet view is clicked, referenced by class
                    var $td = $(event.target); //the pallet that was clicked

                    //only allow for selection if we're not currently rearranging the stack with the rearrange button:
                    if($('#rearrange_button').hasClass('data-clickedOn')){ //if we're rearranging

                    }
                    else {
                        $td.toggleClass('pallet_view_pallet_selected'); //select the pallet and highlight it
                        palletViewSetPermittedActions(palletSquare); //disables and enables action buttons depending on how many pallets are selected

                        //depending on whether we're selecting or deselecting the pallet, disable or enable
                        //the rearrange stack button
                        if($(this).hasClass('pallet_view_pallet_selected')){
                            $('#rearrange_button').attr("disabled","true");
                        }
                        else {
                            $('#rearrange_button').removeAttr("disabled");
                        }
                    }


                    //the actions able to be performed on the pallets in the pallet view are dependent on
                    // how many pallets are selected.
                    // # of pallets selected: actions permitted
                    // 0: add
                    // 1: edit, move delete
                    // 2+: delete


                });
            }

            function palletViewSetPermittedActions(palletSquare) {
                //the actions able to be performed on the pallets in the pallet view are dependent on
                // how many pallets are selected.
                // # of pallets selected: actions permitted
                // 0: add
                // 1: edit, delete
                // 2+: delete

                //disable the edit, move, and delete buttons by default.
                $.each(['add','edit','rearrange','delete'],function(index,value){
                    $('#'+value+'_button').attr('disabled',"true");
                });

                var numberOfPalletsSelected = $('.pallet_view_pallet_selected').length;

                switch (numberOfPalletsSelected) {
                    case 0: //when no pallets are selected in the pallet view
                        $('#add_button').removeAttr("disabled"); //enable only the add button

                        //if more than one pallet is in the space, enable rearrange


                        break;
                    case 1: //when 1 pallet is selected in the pallet view
                        $.each(['edit','delete'],function(index,value){ //enable edit and delete
                            $('#'+value+'_button').removeAttr("disabled");
                        });
                        break;
                    default: //when 2+ pallets are selected in the pallet view
                        $('#delete_button').removeAttr("disabled");
                }

                if(palletSquare.pallets == undefined) { //exit function if palletSquare has no pallets,
                    // to avoid following code throwing error.
                    return;
                }

                //if more than one pallet is in the square, enable the rearrange button:
                if(palletSquare.pallets.length > 1){
                    $('#rearrange_button').removeAttr("disabled");
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
                }
                else {
                    $('#destination_code').attr("type","tel");
                    $('#pallet_number').attr("type","tel");
                }
            }

            function sendOrSavePalletSquare(palletSquare,action){ //sending single-mode actions to server, or persisting client-side if no connectivity
                //parameters:
                // palletSquare: The object in $pallet_squares we are sending to the server.
                // action: The pallet action performed that we are communicating to the server.

                // For action=="ADD":
                // Take palletSquare object from $pallet_squares that was acted on.
                // Create an object called data structured like so: {action: action, data: palletSquare}
                // Create a jQuery AJAX event with the POST action,
                // and send to the URL /voyages/:voyage_id/cargo_holds/:id/create_pallet, getting the requisite IDs
                // from the $voyage and $cargo_hold objects in the global namespace.
                // Upon success, replace the $pallet_squares global var with a version containing the new pallet.

                var ajaxParameters = {};
                ajaxParameters.appAction = action;
                ajaxParameters.url = "/voyages/"+$voyage._id+"/cargo_holds/"+$cargo_hold._id+"/";

                switch(action) {
                    case "ADD":
                        ajaxParameters.HTTPAction = "POST";
                        ajaxParameters.url += "add_pallet";
                        ajaxParameters.palletSquare = palletSquare;
                        ajax(ajaxParameters);
                        break;
                    case "UPDATE":
                        ajaxParameters.HTTPAction = "PUT";
                        ajaxParameters.url += "update_pallet";
                        ajaxParameters.palletSquare = palletSquare;
                        ajax(ajaxParameters);
                        break;
                    case "DESTROY":
                        ajaxParameters.HTTPAction = "DELETE";
                        ajaxParameters.url += "destroy_pallet";
                        ajaxParameters.palletSquare = palletSquare;
                        ajax(ajaxParameters);
                        break;
                    default:
                    //do nothing
                }

                function ajax(params) { //function for jquery AJAX call. Passed object containing parameters.
                    $.ajax({
                        type: params.HTTPAction,
                        url: params.url,
                        data: {appAction: params.appAction, palletSquare: params.palletSquare}
                    }).success(function(data){
                            //handled by views/cargo_holds/<action>_pallet.js.erb (e.g. for add, add_pallet.js.erb).
                        });
                }


            }

            function getIndexOfPalletObjectFromPalletViewCell(palletSquare){
                //Given a palletSquare object from $pallet_squares. find the table cell highlighted in the pallet view and,
                // return the pallet object from that palletSquare object's pallets array.
                // This involves using the index on the table cell's id to return the pallet object at the
                // same index in the pallet square. (e.g. the td with id="cell_0" will correspond to
                // PalletSquare.pallets[0]).

                var palletViewCell = $('td.pallet_view_pallet_selected');

                return palletViewCell.attr("id").match(/\d+/)[0];
            }

            function doSubmit(gridSquare,palletSquare){
                //This function pools together the actions required every time the user submits data to the server.

                //First, pass the changed palletSquare.pallets object to the appropriate object in $pallet_squares:
                Helpers.getPalletSquare(palletSquare.name).pallets = palletSquare.pallets;

                //Next, get the changed pallet squares and assign them to a variable:
                var changedPalletSquares = GridBehavior.getChangedPalletSquares();

                //Submit the changes to the server via ajax:
                SingleModeBehavior.sendOrSavePalletSquare(changedPalletSquares.data[0],changedPalletSquares.action);
                //sync the contents of $pallet_squares with the gridSquares
                GridBehavior.cellContentSync(gridSquare,palletSquare);
                //Set up the pallet view to contain the data from the appropriate grid square
                SingleModeBehavior.palletViewSetup(palletSquare);
                //set up the pallet view to listen for more user actions
                SingleModeBehavior.palletViewPalletClick(palletSquare);
            }

            function doPalletSquareRearrange(gridSquare,palletSquare){
                //give pallet view class that highlights it:
                $('#pallet_view').addClass('pallet_view_outline_highlight');

                var onStop = function(e,ui){ //controls actions to be taken when a rearrange is complete (i.e. when the element is released)
                    // instantiate an empty array
                    var newPalletOrder = [];

                    //loop through the pallets in the pallet view,
                    // using the index in their id attributes (e.g. "cell_0", "cell_1", etc)
                    // put the pallet object at the corresponding index in PalletSquare.pallets
                    // into the new array.


                    $('#pallet_view td').each(function(index,value){
                        var thisPalletIndex = Number($(value).attr("id").match(/\d+/)[0]);
                        newPalletOrder.push(palletSquare.pallets[thisPalletIndex]);

                    });

                    //replace palletSquare.pallets with the newly-ordered array
                    palletSquare.pallets = newPalletOrder;
                    
                    
                    //submit this action to the server (or persist client-side if no connection) as an update
                    doSubmit(gridSquare,palletSquare);

                    cancelPalletSquareRearrange(gridSquare,palletSquare);

                    $('#rearrange_button').removeClass("data-clickedOn");

                };

                //make pallet view sortable:
                $('#pallet_view_table_body').sortable({
                    stop: onStop
                });
                $('#pallet_view_table_body').sortable("enable");
            }

            function cancelPalletSquareRearrange(gridSquare,palletSquare){
                //remove the pallet view class that highlights it:
                $('#pallet_view').removeClass('pallet_view_outline_highlight');

                //disable sortable functionality on pallet view
                $('#pallet_view_table_body').sortable("disable");
                $('#pallet_view_table_body').removeClass("ui-sortable");
                $('#pallet_view_table_body').removeClass("ui-sortable-disabled");

                //un-highlight the rearrange button
                $('#rearrange_button').removeClass("pallet_menu_button_highlighted");

                //re-enable the add button
                $('#add_button').removeAttr("disabled");
            }

            //showing events

            function palletMenuOpen() {

                $('#pallet_menu').stop().toggle("slide",{direction: "right"});
                $('#mask_layer').show();
            }

            function palletSubMenuOpen(gridSquare,palletSquare) {

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
                palletSubMenuAddActidoSubmitButtonClick(gridSquare,palletSquare);
                palletSubMenuCancelButtonClick(gridSquare);
                palletViewPalletClick(palletSquare); //listen to pallet view pallet click on page load
                palletMenuDeleteButtonClick(gridSquare,palletSquare);
                palletMenuRearrangeButtonClick(gridSquare,palletSquare);
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

                $('#add_button').unbind("click").bind('click',function(){
                    SingleModeBehavior.palletSubMenuOpen(gridSquare,palletSquare);
                });
            }

            function palletMenuDeleteButtonClick(gridSquare,palletSquare){
                $('#delete_button').unbind('click').bind('click',function(event){

                    var indexOfPalletObjectToBeDeleted = SingleModeBehavior.getIndexOfPalletObjectFromPalletViewCell(palletSquare);


                    //we want to delete the pallet object from the pallet square parent object,
                    // update the grid contents, update the pallet view, and send the data to the server.

                    palletSquare.pallets.splice(indexOfPalletObjectToBeDeleted,1); //remove the object from the palletSquare parent object in $pallet_squares
                    SingleModeBehavior.doSubmit(gridSquare,palletSquare);

                    /*
                    var changedPalletSquares = GridBehavior.getChangedPalletSquares();
                    SingleModeBehavior.sendOrSavePalletSquare(changedPalletSquares.data[0],changedPalletSquares.action);
                    GridBehavior.cellContentSync(gridSquare,palletSquare);
                    SingleModeBehavior.palletViewSetup(palletSquare);
                    SingleModeBehavior.palletViewPalletClick(); //listen to pallet view pallet click as soon as its created.
                    */


                });
            }

            function palletMenuRearrangeButtonClick(gridSquare,palletSquare){
                $('#rearrange_button').unbind("click").bind("click",function(event){
                    $(this).toggleClass("data-clickedOn");

                    if($(this).hasClass("data-clickedOn")){ // behavior for enabling the rearrange action
                        //disable the add button
                        $('#add_button').attr("disabled","true");


                        //highlight the rearrange button
                        $(this).addClass("pallet_menu_button_highlighted");

                        doPalletSquareRearrange(gridSquare,palletSquare);
                    }
                    else {                                  //behavior for disabling the rearrange action

                        cancelPalletSquareRearrange(gridSquare,palletSquare);


                    }
                });
            }

            //single-mode sub-menu (inner menu) buttons

            function palletSubMenuAddActidoSubmitButtonClick(gridSquare,palletSquare){
                //perform validations (coming soon)
                //create JS object with information from form
                //if pallets==undefined create palletSquare.pallets array and push object into pallets array,
                // otherwise just push it ("Push it real good!").
                // if there's a connection to the server, submit the changes since last submit

                $('#inner_submit_button').unbind('click').bind('click',function(){
                    //need to unbind and rebind click event because click was mysteriously being called twice.

                    var destination_code = $('#destination_code').val().toUpperCase();
                    var pallet_number = $('#pallet_number').val().toUpperCase();

                    var object = {dest: destination_code, pallet_number: pallet_number};

                    //palletSquare.pallets.push(object);

                    if(palletSquare.pallets == undefined ) {   //put the object in the array
                        palletSquare.pallets = [object];
                    }
                    else {
                        palletSquare.pallets.push(object);
                    }
                    SingleModeBehavior.doSubmit(gridSquare,palletSquare);
                    SingleModeBehavior.palletSubMenuClose(gridSquare);
                    /*
                    Helpers.getPalletSquare(palletSquare.name).pallets = palletSquare.pallets;


                    //submit it if there's a connection (coming soon)
                    var changedPalletSquares = GridBehavior.getChangedPalletSquares();




                    SingleModeBehavior.sendOrSavePalletSquare(changedPalletSquares.data[0],changedPalletSquares.action);
                    GridBehavior.cellContentSync(gridSquare,palletSquare);
                    SingleModeBehavior.palletSubMenuClose(gridSquare);
                    SingleModeBehavior.palletViewSetup(palletSquare);
                    SingleModeBehavior.palletViewPalletClick(); //listen to pallet view pallet click as soon as its created.
                    */
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
                palletMenuBehavior: palletMenuBehavior,
                palletSubMenuBehavior: palletSubMenuBehavior,
                palletViewPalletClick: palletViewPalletClick,
                palletViewSetPermittedActions: palletViewSetPermittedActions,
                sendOrSavePalletSquare: sendOrSavePalletSquare,
                getIndexOfPalletObjectFromPalletViewCell: getIndexOfPalletObjectFromPalletViewCell,
                doSubmit: doSubmit,
                doPalletSquareRearrange: doPalletSquareRearrange,
                cancelPalletSquareRearrange: cancelPalletSquareRearrange,
                //showing events:
                palletMenuOpen: palletMenuOpen,
                palletSubMenuOpen: palletSubMenuOpen,
                //hiding events
                palletMenuClose: palletMenuClose,
                palletSubMenuClose: palletSubMenuClose,
                //single-mode menu buttons:
                singleModeButtonsEvents: singleModeButtonsEvents,
                palletMenuCloseButtonClick: palletMenuCloseButtonClick,
                palletMenuDoneButtonClick: palletMenuDoneButtonClick,
                palletMenuAddButtonClick: palletMenuAddButtonClick,
                palletMenuDeleteButtonClick: palletMenuDeleteButtonClick,
                palletMenuRearrangeButtonClick: palletMenuRearrangeButtonClick,
                //single-mode sub-menu (inner menu) buttons:
                palletSubMenuAddActidoSubmitButtonClick: palletSubMenuAddActidoSubmitButtonClick,
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

        GridBehavior.gridSetup(); //overlay grid on top of hold picture, set default selectability of cells to true
        GridBehavior.populateGridSquaresFromJSVars();

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

            var $pallet_square = Helpers.getPalletSquare($td.data('row')+$td.data('column'));
            $(this).toggleClass('selected');


            if( MultiModeBehavior.inMultiMode() ) { //functionality for multi-pallet mode
                $('#batch_menu').stop().show("slide",{direction: "right"});
            }
            else {  //functionality for single-pallet mode
                SingleModeBehavior.palletViewSetup($pallet_square); //set up the pallet view
                SingleModeBehavior.palletMenuOpen(true);
                SingleModeBehavior.singleModeButtonsEvents($td,$pallet_square); //all single-mode button events

            };
        });



    });
}