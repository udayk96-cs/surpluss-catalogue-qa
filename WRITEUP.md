Task 1 - Automating the flows with Bugs 

Full E2E run of automated-bug-flows.feature confirms the tests expose the reported behavior: future-dated catalogues show “Expired,” staff can see the product Delete option, and staff can see the publish option. The existing buyer enquiry journey still passes. Test suite fails intentionally until those bugs are fixed.

I did not automate the login rate-limiting bug because I ran out of time and have limited experience testing this type of authentication behavior. I would add this test next.


Task 2 - Unit and Integration Tests
I added Vitest tests for discount calculations and three enquiry checks: a valid enquiry is accepted, contact details are required, and quantity must be above zero. These tests pass. I also tested catalogue status; the future and past expiry tests fail because of the status bug listed in FINDINGS.md. I did not test spreadsheet imports due to limited time.

Task 3 — API and Access-Control Tests 
I did not complete Task 3 API and server-action tests due to lack of time and limited experience in API Automation. I could have written that with help of AI but I am not confident enough on this point, hence skipping this task for now but I can brush up my skills and improve in this aspect as well. 


Task 4 — One End-to-End Journey Using Playwright 

The test follows one buyer enquiry from start to finish. It opens the seeded, published catalogue, selects the first available product, and waits for that product’s page to load before opening the enquiry form. It fills in a unique buyer name and a test phone number, submits the form, and checks the confirmation, reference number, product, and quantity.

Next, it signs in with the seeded admin account, searches Leads using the unique buyer name, and checks that the new lead has the right reference, catalogue, product count, quantity, and status. It also opens the lead to verify the saved product and quantity.
For a pull request run, I would use a separate database seeded for the test and keep Playwright traces and screenshots when a test fails.


Note - I have used cucumber BDD format in order to make the tests more readable and easily manageable. Feature files and the step implementation files are prsent in separate sub-folders under the e2e test which improves overall managing of test suite. 



Task 5 — Write-Up

## 1. Strategy

I tried testing the Login functionality basic tests first and foremost to ensure user is not able to login with incorrect credentials. 

User recieves error for incorrect email ID and Password to ensure unatuthorized user is not able to access the application's admin or staff portal. 
Only product catalogue's should be visible to the user. 

Then, I tested the user actions after logging in as admin first since it is the most critical and important part of the business as management of product catalogue prices is directly related to the revenue of the organization.

Later, I testing the staff user actions and found few issues which I have reported in the Findings.md file. 


## 2. The riskiest part of this product

I would protect the user roles and catalogue publishing flow first. A staff user should not be able to publish a catalogue or permanently delete products if those actions are meant for admins only. If these checks are missing, confidential prices could be shared publicly or product data could be deleted without approval. I would check permissions in the server actions as well as in the UI.

## 3. What I left out, and why

I did not automate repeated failed login attempts, spreadsheet imports, or every API validation case. I had limited time, so I focused on staff permissions, catalogue status, and the complete buyer enquiry flow. I also did not test email, WhatsApp, or image upload because those services are not configured in this local project.




## 4. AI tool usage

I used Copilot to organize the bug descriptions and reproduction steps. I also used it to help structure the Playwright tests in Cucumber format. I reviewed the steps and ran the tests to check that they matched the actual application flow. AI has been used in the process of setting up this project as well in local since I faced few errors related to Docker & Prism library which were fixed after applying steps & suggestions received from AI. 

## 5. One thing this codebase gets wrong

One thing I noticed is that staff can see actions such as deleting a product or publishing a catalogue, even though these actions should be for admins only. I would make sure the app checks the user's role before carrying out the action, not just hide the option on the screen. I would also test the same action with both staff and admin accounts.

---

## Notes

1> The Automated Bug Flows feature test cases are expected to fail until the bugs are fixed. This is intentional and by design.

2> While setting up the working system on local I faced multiple issue for which I took help of Microsoft Copilot. 
Once such example is while running docker on windows I was unable to run the container which was due to missing installation of WSL (Windows Subsystem for Linux) 


3> While running the command npm run db:seed i encountered below error. To resolve this, I used command npx prisma generate to install prisma. 

> surpluss-catalogue-qa@0.1.0 db:seed
> prisma db seed

Loaded Prisma config from prisma.config.ts.

Running seed command `tsx prisma/seed.ts` ...
node:internal/modules/cjs/loader:1564
  const err = new Error(message);
              ^

Error: Cannot find module '../src/generated/prisma/client'
Require stack:



4> Due to timing contraints and busy work schedule, I was not able to explore the APP more deeply to find more bugs but I have tried to target the critical funtionalities related to user authorization & actions  are tested to ensure basic works right. 
FYI - I recieved the assessment email on 28th September and submission window is 30th September EOD hence I am unable to complete the API tests as well for now but have ensured the UI Automated test written are most critical onces and execute without flakiness . 


5> Path of the UI Automation case feature file is - https://github.com/udayk96-cs/surpluss-catalogue-qa/tree/main/e2e/features
Path of Vitest is as follows - 
https://github.com/udayk96-cs/surpluss-catalogue-qa/blob/main/src/lib/catalogue-status.test.ts
https://github.com/udayk96-cs/surpluss-catalogue-qa/blob/main/src/lib/pricing.test.ts
https://github.com/udayk96-cs/surpluss-catalogue-qa/blob/main/src/lib/schemas/enquiry.test.ts
