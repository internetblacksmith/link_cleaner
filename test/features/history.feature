# features/history.feature
Feature: History Management
  As a user
  I want to view my URL cleaning history
  So that I can see previously cleaned URLs

  Background:
    Given the app is launched
    And I have cleaned the following URLs:
      | original_url                                    | cleaned_url              | chars_saved |
      | https://example.com?utm_source=test            | https://example.com      | 20          |
      | https://site.com/page?fbclid=abc&id=123       | https://site.com/page?id=123 | 11      |

  @history
  Scenario: View history list
    When I tap the history icon
    Then I should be on the history screen
    And I should see 2 history items
    And the first item should show "site.com"
    And the first item should show "11 chars saved"

  @history
  Scenario: View history item details
    When I tap the history icon
    And I tap the first history item
    Then I should see a details dialog
    And the dialog should show the original URL
    And the dialog should show the cleaned URL
    And the dialog should show the parameters list

  @history
  Scenario: Clear history
    When I tap the history icon
    And I tap "Clear"
    And I confirm the clear action
    Then I should see "No history yet"
    And I should see "Your cleaned URLs will appear here"

  @history @statistics
  Scenario: History updates statistics
    Given I am on the settings screen
    Then I should see "Total URLs Cleaned" with value "2"
    And I should see "Characters Saved" with value "31"