class HoldTemplatesController < ApplicationController
  # GET /hold_templates
  # GET /hold_templates.json

  def index
    @hold_templates = HoldTemplate.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @hold_templates }
    end
  end

  # GET /hold_templates/1
  # GET /hold_templates/1.json
  def show
    @hold_template = HoldTemplate.find(params[:id])
    gon.hold_template = @hold_template

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @hold_template }
    end
  end

  # GET /hold_templates/new
  # GET /hold_templates/new.json
  def new
    @hold_template = HoldTemplate.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @hold_template }
    end
  end

  # GET /hold_templates/1/edit
  def edit
    @hold_template = HoldTemplate.find(params[:id])
    gon.hold_template = @hold_template
  end

  def edit_selectable_cells
    @hold_template = HoldTemplate.find(params[:id])
    gon.hold_template = @hold_template
  end

  # POST /hold_templates
  # POST /hold_templates.json
  def create
    @hold_template = HoldTemplate.new(params[:hold_template])

    respond_to do |format|
      if @hold_template.save
        format.html { redirect_to @hold_template, notice: 'Hold template was successfully created.' }
        format.json { render json: @hold_template, status: :created, location: @hold_template }
      else
        format.html { render action: "new" }
        format.json { render json: @hold_template.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /hold_templates/1
  # PUT /hold_templates/1.json
  def update
    @hold_template = HoldTemplate.find(params[:id])

    respond_to do |format|
      if @hold_template.update_attributes(params[:hold_template])
        format.html { redirect_to @hold_template, notice: 'Hold template was successfully updated.' }
        format.json { head :no_content }
        format.js
      else
        format.html { render action: "edit" }
        format.json { render json: @hold_template.errors, status: :unprocessable_entity }
      end
    end
  end

  def update_selectable_cells
    @hold_template = HoldTemplate.find(params[:id])

    @hold_template.update_attribute(:selectable_cells, params[:hold_template][:selectable_cells].split(","))
    redirect_to @hold_template
  end

  # DELETE /hold_templates/1
  # DELETE /hold_templates/1.json
  def destroy
    @hold_template = HoldTemplate.find(params[:id])
    @hold_template.destroy

    respond_to do |format|
      format.html { redirect_to hold_templates_url }
      format.json { head :no_content }
    end
  end
end
