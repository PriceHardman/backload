class CargoHoldsController < ApplicationController

  def show
    @voyage = Voyage.find(params[:voyage_id])
    @vessel_template = Vessel.find_by(name: @voyage.vessel)
    @cargo_hold = @voyage.cargo_holds.find(params[:id])
    @hold_template = @vessel_template.holds.find_by(name: @cargo_hold.name)
  end

  def add_pallet
    @voyage = Voyage.find(params[:voyage_id])
    @cargo_hold = @voyage.cargo_holds.find(params[:id])
    @pallet_square = @cargo_hold.pallet_squares.find(params[:palletSquare][:_id])

    @new_pallets = []
    params[:palletSquare][:pallets].each do |key,value|
      @new_pallets << Pallet.new(dest: value[:dest], pallet_number: value[:pallet_number])
    end
    @pallet_square.pallets.push(@new_pallets)



  end

  def update_pallet
    @voyage = Voyage.find(params[:voyage_id])
    @cargo_hold = @voyage.cargo_holds.find(params[:id])
    @pallet_square = @cargo_hold.pallet_squares.find(params[:palletSquare][:_id])

    @pallet_square.pallets.clear #delete the old pallets. We're overwriting them with the updated ones.
    @new_pallets = []
    params[:palletSquare][:pallets].each do |key,value|
      @new_pallets << Pallet.new(dest: value[:dest], pallet_number: value[:pallet_number])
    end
    @pallet_square.pallets.push(@new_pallets)


  end

  def destroy_pallet
    @voyage = Voyage.find(params[:voyage_id])
    @cargo_hold = @voyage.cargo_holds.find(params[:id])
    @pallet_square = @cargo_hold.pallet_squares.find(params[:palletSquare][:_id])

    @pallet_square.pallets.clear

  end
end
