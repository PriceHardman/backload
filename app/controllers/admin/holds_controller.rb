class Admin::HoldsController < ApplicationController

  def show
    puts params.inspect
    @vessel = Vessel.find(params[:vessel_id])
    @hold = @vessel.holds.find(params[:id])
    gon.watch.hold = @hold
  end

  def new
    @vessel = Vessel.find(params[:vessel_id])
    @hold = Hold.new
  end

  def create
    @vessel = Vessel.find(params[:vessel_id])
    @hold = @vessel.holds.create!(params[:hold])
    redirect_to admin_vessel_hold_url(@vessel,@hold)
  end

  def edit
    @vessel = Vessel.find(params[:vessel_id])
    @hold = @vessel.holds.find(params[:id])
  end

  def update
    @vessel = Vessel.find(params[:vessel_id])
    @hold = @vessel.holds.find(params[:id])
    @hold.update_attributes(params[:hold])
    redirect_to admin_vessel_hold_url(@vessel,@hold)
  end

  def edit_selectable_cells
    @vessel = Vessel.find(params[:vessel_id])
    @hold = @vessel.holds.find(params[:id])

  end

  def update_selectable_cells
    @vessel = Vessel.find(params[:vessel_id])
    @hold = @vessel.holds.find(params[:id])
    @changed_cells = JSON.parse(params[:selectable_cells]) #hash of selectable cells objects, referenced by name
    #gon.watch.hold = @hold

    @changed_cells.each do |key,value|
      cell = @hold.selectable_cells.where(name: key)[0]
      cell.update_attributes(name: value["name"], selectable: value["selectable"])
      cell.save
    end
  end
end
