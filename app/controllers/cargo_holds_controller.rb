class CargoHoldsController < ApplicationController

  def show
    @voyage = Voyage.find(params[:voyage_id])
    @vessel_template = Vessel.find_by(name: @voyage.vessel)
    @cargo_hold = @voyage.cargo_holds.find(params[:id])
    @hold_template = @vessel_template.holds.find_by(name: @cargo_hold.name)
  end
end
