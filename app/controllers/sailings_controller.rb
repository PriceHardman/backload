class SailingsController < ApplicationController
  # GET /sailings
  # GET /sailings.json
  def index
    @sailings = Sailing.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @sailings }
    end
  end

  # GET /sailings/1
  # GET /sailings/1.json
  def show
    @sailing = Sailing.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @sailing }
    end
  end

  # GET /sailings/new
  # GET /sailings/new.json
  def new
    @sailing = Sailing.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @sailing }
    end
  end

  # GET /sailings/1/edit
  def edit
    @sailing = Sailing.find(params[:id])
  end

  # POST /sailings
  # POST /sailings.json
  def create
    @sailing = Sailing.new(params[:sailing])

    respond_to do |format|
      if @sailing.save
        format.html { redirect_to @sailing, notice: 'Sailing was successfully created.' }
        format.json { render json: @sailing, status: :created, location: @sailing }
      else
        format.html { render action: "new" }
        format.json { render json: @sailing.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /sailings/1
  # PUT /sailings/1.json
  def update
    @sailing = Sailing.find(params[:id])

    respond_to do |format|
      if @sailing.update_attributes(params[:sailing])
        format.html { redirect_to @sailing, notice: 'Sailing was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @sailing.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /sailings/1
  # DELETE /sailings/1.json
  def destroy
    @sailing = Sailing.find(params[:id])
    @sailing.destroy

    respond_to do |format|
      format.html { redirect_to sailings_url }
      format.json { head :no_content }
    end
  end
end
