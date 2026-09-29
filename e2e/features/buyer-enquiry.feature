Feature: Buyer enquiry journey

  Scenario: Buyer submits a product enquiry and admin sees it in Leads
    Given a buyer opens the published catalogue
    And the buyer browses the available products
    When the buyer submits an enquiry for a product
    Then the buyer sees the enquiry confirmation
    And the admin sees the enquiry in Leads with the requested product and quantity