Feature: Automated Bug Flows

  Scenario: Admin publishes a future-dated catalogue and sees Live status
    Given the "admin" user is signed in
    When the admin publishes a catalogue with a future validity date
    Then the catalogue status is Live on the dashboard

  Scenario: Staff cannot delete a product
    Given the "staff" user is signed in
    When the staff user opens the actions for a product
    Then the staff user does not see a Delete option

  Scenario: Staff cannot publish a catalogue
    Given the "staff" user is signed in
    When the staff user opens the new catalogue form
    Then the staff user does not see an option to publish the catalogue