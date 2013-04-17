require 'test_helper'

class SailingsControllerTest < ActionController::TestCase
  setup do
    @sailing = sailings(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:sailings)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create sailing" do
    assert_difference('Sailing.count') do
      post :create, sailing: { direction: @sailing.direction, sailing_date: @sailing.sailing_date, vessel: @sailing.vessel, voyage: @sailing.voyage }
    end

    assert_redirected_to sailing_path(assigns(:sailing))
  end

  test "should show sailing" do
    get :show, id: @sailing
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @sailing
    assert_response :success
  end

  test "should update sailing" do
    put :update, id: @sailing, sailing: { direction: @sailing.direction, sailing_date: @sailing.sailing_date, vessel: @sailing.vessel, voyage: @sailing.voyage }
    assert_redirected_to sailing_path(assigns(:sailing))
  end

  test "should destroy sailing" do
    assert_difference('Sailing.count', -1) do
      delete :destroy, id: @sailing
    end

    assert_redirected_to sailings_path
  end
end
