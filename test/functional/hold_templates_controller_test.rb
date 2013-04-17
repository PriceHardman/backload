require 'test_helper'

class HoldTemplatesControllerTest < ActionController::TestCase
  setup do
    @hold_template = hold_templates(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:hold_templates)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create hold_template" do
    assert_difference('HoldTemplate.count') do
      post :create, hold_template: {  }
    end

    assert_redirected_to hold_template_path(assigns(:hold_template))
  end

  test "should show hold_template" do
    get :show, id: @hold_template
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @hold_template
    assert_response :success
  end

  test "should update hold_template" do
    put :update, id: @hold_template, hold_template: {  }
    assert_redirected_to hold_template_path(assigns(:hold_template))
  end

  test "should destroy hold_template" do
    assert_difference('HoldTemplate.count', -1) do
      delete :destroy, id: @hold_template
    end

    assert_redirected_to hold_templates_path
  end
end
