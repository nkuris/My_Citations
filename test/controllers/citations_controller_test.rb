require "test_helper"

class CitationsControllerTest < ActionDispatch::IntegrationTest
  setup do
    Citation.delete_all
  end

  test "index returns citations ordered by date descending by default" do
    Citation.create!(article_title: "A", journal: "J", doi: "10.1", date: Date.parse("2024-01-01"), authors: [ "Alice" ], short: "<t>P</t>", long: "<t>P</t>")
    Citation.create!(article_title: "B", journal: "J", doi: "10.2", date: Date.parse("2025-01-01"), authors: [ "Bob" ], short: "<t>P</t>", long: "<t>P</t>")

    get api_citations_url
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal [ "B", "A" ], body.map { |citation| citation["article_title"] }
  end

  test "index returns citations ordered by date ascending when order=asc" do
    Citation.create!(article_title: "A", journal: "J", doi: "10.1", date: Date.parse("2024-01-01"), authors: [ "Alice" ], short: "<t>P</t>", long: "<t>P</t>")
    Citation.create!(article_title: "B", journal: "J", doi: "10.2", date: Date.parse("2025-01-01"), authors: [ "Bob" ], short: "<t>P</t>", long: "<t>P</t>")

    get api_citations_url(order: :asc)
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal [ "A", "B" ], body.map { |citation| citation["article_title"] }
  end

  test "index falls back to date descending for an invalid order parameter" do
    Citation.create!(article_title: "A", journal: "J", doi: "10.1", date: Date.parse("2024-01-01"), authors: [ "Alice" ], short: "<t>P</t>", long: "<t>P</t>")
    Citation.create!(article_title: "B", journal: "J", doi: "10.2", date: Date.parse("2025-01-01"), authors: [ "Bob" ], short: "<t>P</t>", long: "<t>P</t>")

    get api_citations_url(order: :invalid)
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal [ "B", "A" ], body.map { |citation| citation["article_title"] }
  end
end
