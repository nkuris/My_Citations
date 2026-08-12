# frozen_string_literal: true

if defined?(Rails::LineFiltering)
  module Rails
    module LineFiltering
      def run(*args)
        if args.length == 3
          super
        else
          reporter, options = args
          options = (options || {}).dup
          options[:filter] = Rails::TestUnit::Runner.compose_filter(self, options[:filter])
          super(reporter, options)
        end
      end
    end
  end
end
