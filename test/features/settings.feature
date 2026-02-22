# features/settings.feature
Feature: Settings and Themes
  As a user
  I want to customize app settings
  So that I can use the app according to my preferences

  Background:
    Given the app is launched

  @settings @theme
  Scenario: Change theme to dark mode
    When I navigate to settings
    And I tap on "Theme"
    And I select "Dark" theme
    Then the app should use dark theme
    And the theme preference should be saved

  @settings @theme
  Scenario: Theme follows system setting
    When I navigate to settings
    And I tap on "Theme"
    And I select "System" theme
    And the device is in dark mode
    Then the app should use dark theme

  @settings @statistics
  Scenario: View statistics
    Given I have cleaned 5 URLs
    And I have saved 150 characters total
    And I have removed 8 trackers
    When I navigate to settings
    Then I should see "Total URLs Cleaned" with value "5"
    And I should see "Characters Saved" with value "150"
    And I should see "Trackers Removed" with value "8"

  @settings @data
  Scenario: Clear all data
    Given I have history and statistics data
    When I navigate to settings
    And I tap "Clear All Data"
    And I confirm the action
    Then I should see "All data cleared" message
    And the statistics should show "0" for all values
    When I navigate to history
    Then I should see "No history yet"

  @settings
  Scenario: View app information
    When I navigate to settings
    Then I should see "Version" with value "1.0.0"
    And I should see "Privacy" section
    And I should see "All data is stored locally on your device"