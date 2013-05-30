class VoyagesController < ApplicationController

  def index
    @current_voyages = Voyage.where(load_status: "in_progress").order_by(sailing_date: :desc)
  end

  def show
    @voyage = Voyage.find(params[:id])
    @cargo_holds = @voyage.cargo_holds
  end

  def new
    @voyage = Voyage.new
    @vessels = Vessel.all.sort_by{ |vessel| vessel.name } # for populating the dropdown menu on the creation form
  end

  def create
    @voyage = Voyage.new(params[:voyage])
    @voyage.save
  end

end
