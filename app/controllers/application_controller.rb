class ApplicationController < ActionController::API
  rescue_from StandardError, with: :render_500

  def route_not_found
    render json: {
      error: "Route not found",
      message: "The requested route was not found."
    },
    status: :not_found
  end

  def render_500(exception)
    logger.error "Internal Server Error: #{exception.message}"
    logger.error exception.backtrace.join("\n")
    # Render HTTP 500 status with JSON payload
    render json: {
      error: 'Internal Server Error',
      message: Rails.env.development? ? exception.message : 'An unexpected error occurred.'
    }, status: :internal_server_error

  end
end
