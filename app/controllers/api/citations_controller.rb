  module Api
    class CitationsController < ApplicationController
      rescue_from StandardError, with: :render_internal_error

      SORT_ORDERS = %w[asc desc].freeze

      def index
        citations = Citation.all
        citations = apply_filters(citations)
        citations = citations.order(date: validated_sort_order)

        render json: citations
      end

      def show
        @citation = Citation.find(params[:id])
        render json: @citation
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Citation not found" }, status: :not_found
      end

      private

      def apply_filters(scope)
        permitted = params.permit(:journal)
        scope = scope.where(journal: permitted[:journal]) if permitted[:journal].present?
        scope

      def validated_sort_order
        order = params[:order].to_s.downcase
        SORT_ORDERS.include?(order) ? order : 'desc'
      end

      def render_internal_error(exception)
        render json: { error: exception.message }, status: :internal_server_error
      end
    end
  end
  