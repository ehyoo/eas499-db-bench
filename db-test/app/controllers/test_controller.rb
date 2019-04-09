class TestController < ApplicationController
  def test_endpoint
    render json: "hello world my name is edward"
  end
end
