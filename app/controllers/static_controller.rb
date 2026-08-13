class StaticController < ApplicationController
  # Serve a static HTML file from the public directory as the root page.
  # Rendering the file directly avoids layout wrapping and serves the raw HTML.
  def home
  render file: Rails.root.join("public", "helix_lab_instruments__p_1000.html"), layout: false
  end
end
