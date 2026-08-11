require "application_system_test_case"

class CitationParserTest < ApplicationSystemTestCase
  test "buildExcerptNodes safely parses <t> and <c> tags" do
    visit "/helix_lab_instruments__p_1000.html"

    result = page.evaluate_script(<<~JS)
      (function() {
        var fragment = buildExcerptNodes('This is <t>test</t> and <c>code</c>.');
        var container = document.createElement('div');
        container.appendChild(fragment);

        var marks = container.querySelectorAll('mark');
        return {
          text: container.textContent,
          markCount: marks.length,
          firstMarkText: marks[0] ? marks[0].textContent : null,
          secondMarkText: marks[1] ? marks[1].textContent : null,
          firstMarkTagName: marks[0] ? marks[0].tagName : null
        };
      })();
    JS

    assert_equal "This is test and code.", result["text"]
    assert_equal 2, result["markCount"]
    assert_equal "test", result["firstMarkText"]
    assert_equal "code", result["secondMarkText"]
    assert_equal "MARK", result["firstMarkTagName"]
  end

  test "buildExcerptNodes returns empty fragment for an empty excerpt" do
    visit "/helix_lab_instruments__p_1000.html"

    result = page.evaluate_script(<<~JS)
      (function() {
        var fragment = buildExcerptNodes('');
        var container = document.createElement('div');
        container.appendChild(fragment);
        return {
          text: container.textContent,
          markCount: container.querySelectorAll('mark').length
        };
      })();
    JS

    assert_equal "", result["text"]
    assert_equal 0, result["markCount"]
  end

  test "buildExcerptNodes preserves unmatched tags as literal text" do
    visit "/helix_lab_instruments__p_1000.html"

    result = page.evaluate_script(<<~JS)
      (function() {
        var fragment = buildExcerptNodes('This has an unmatched <t>open tag and a literal </c> close.');
        var container = document.createElement('div');
        container.appendChild(fragment);
        return {
          text: container.textContent,
          html: container.innerHTML,
          markCount: container.querySelectorAll('mark').length
        };
      })();
    JS

    assert_equal "This has an unmatched <t>open tag and a literal </c> close.", result["text"]
    assert_equal 0, result["markCount"]
    assert_includes result["html"], "&lt;t&gt;"
    assert_includes result["html"], "&lt;/c&gt;"
  end
end
