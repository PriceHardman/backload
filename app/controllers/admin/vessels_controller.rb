class Admin::VesselsController < ApplicationController

  def index
    @vessels = Vessel.all.sort_by{ |vessel| vessel.name }
  end

  def show
    @vessel = Vessel.find(params[:id])
  end

  def edit
    @vessel = Vessel.find(params[:id])
  end

  def update
    @vessel = Vessel.find(params[:id])
    @vessel.update_attributes(params[:vessel])
    redirect_to @vessel
  end

  def new
    @vessel = Vessel.new
  end

  def create
    @vessel = Vessel.new(params[:vessel])
    @vessel.save
    redirect_to admin_vessel_url(@vessel)
  end

  def destroy
    @vessel = Vessel.find(params[:id])
    @vessel.destroy
    redirect_to admin_vessels_url
  end
end
