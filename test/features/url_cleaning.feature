# features/url_cleaning.feature
Feature: URL Cleaning
  As a user
  I want to clean tracking parameters from URLs
  So that I can share clean URLs without tracking

  Background:
    Given the app is launched
    And I am on the home screen

  @smoke @core
  Scenario: Clean a URL with tracking parameters
    When I share the URL "https://example.com/page?utm_source=google&utm_medium=cpc&id=123&ref=social"
    Then I should see the cleaned URL section
    And I should see 4 parameters listed
    And I should see "utm_source" marked as a tracker
    And I should see "utm_medium" marked as a tracker
    And I should see "ref" marked as a tracker
    And the cleaned URL should be "https://example.com/page?utm_source=google&utm_medium=cpc&id=123&ref=social"
    And I should see "0 chars saved" indicator

  @core
  Scenario: Remove all tracking parameters
    When I share the URL "https://example.com?utm_campaign=test&fbclid=abc&id=123"
    And I tap "Clear All"
    Then the cleaned URL should be "https://example.com"
    And I should see "36 chars saved" indicator

  @core
  Scenario: Toggle individual parameters
    When I share the URL "https://example.com?source=app&id=123&tracking=yes"
    And I toggle the parameter "tracking"
    Then the cleaned URL should be "https://example.com?source=app&id=123"
    And I should see "13 chars saved" indicator

  @core
  Scenario: Share cleaned URL
    When I share the URL "https://example.com?utm_source=test"
    And I tap the "Share" button
    Then the share dialog should appear
    And the shared text should be "https://example.com?utm_source=test"

  @core
  Scenario: Copy cleaned URL to clipboard
    When I share the URL "https://example.com?tracking=enabled"
    And I tap the "Copy" button
    Then I should see "URL copied to clipboard" message
    And the clipboard should contain "https://example.com?tracking=enabled"

  @core
  Scenario: Handle URL without parameters
    When I share the URL "https://example.com/page"
    Then I should see "This URL has no tracking parameters!"
    And I should see "The URL is already clean"
    And the cleaned URL should be "https://example.com/page"

  @validation
  Scenario: Handle invalid URL
    When I share the text "not a valid url"
    Then I should see an error message "Invalid URL format"

  @tracker_detection
  Scenario Outline: Detect various tracking parameters
    When I share the URL "https://example.com?<parameter>=value"
    Then I should see "<parameter>" marked as a tracker
    And the tracker should show category "<category>"

    Examples:
      | parameter | category         |
      | utm_source| Google Analytics |
      | fbclid    | Facebook         |
      | gclid     | Google Ads       |
      | msclkid   | Microsoft        |
      | mc_cid    | Mailchimp        |
      | __hstc    | HubSpot          |