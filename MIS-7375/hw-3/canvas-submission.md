# Homework 3 Submission

Rogelio Rios
MIS 7375
Note: I am submitting Homework 3 in place of Homework 2.

## Part 1

**URL:** https://rrios5.github.io/MIS-7375/hw-3/index.html

**Theme:** A new patient registration form for a medical clinic called CougarAid Medical Center. It is the same theme as Homework 1.

## Part 2

### Synopsis

The page is an online sign-up form for new patients at CougarAid Medical Center. The patient fills in:

- their personal information
- address and contact info
- insurance
- a short health history
- a 1 to 10 "how do you feel today" slider
- a user ID and password for the patient portal

Then they check the HIPAA privacy acknowledgment. For this homework I added JavaScript checks to every field. When something is wrong, a red message shows up under that field as soon as the patient leaves it, and the message goes away as soon as they fix it. The old Submit button is now a VALIDATE button. VALIDATE runs every check again and counts the errors. Submit only shows up when that count is zero, and it takes the patient to a thank you page. A REVIEW button shows everything that was entered in a table, plus a column that says whether each field passed.

### What I am happy with

- **Date of birth and SSN fill in their own slashes and dashes as you type.** The date check also catches dates that don't exist, like 02/30, and dates in the future or more than 120 years ago.
- **The password message lists what is still missing** (uppercase, number, length, and so on), and the list shrinks as you type.
- **The phone number is only required when you choose Phone call or Text** as your contact method. Once it is valid, it gets formatted as (713) 555-0123.
- **Answering "No" to insurance turns off the provider and member ID fields.** Answering "Yes" makes the provider required.
- **Every field has space set aside for its error message**, so the form doesn't jump around when messages appear.
- **Changing any field after a successful VALIDATE hides Submit again**, so bad data can't slip through.

### What I didn't get working yet

- **Nothing is actually saved.** Submit just loads the thank you page. There is no server or database behind the form yet.
- **The user ID isn't checked for being unique.** That needs a database.
- **The SSN and password aren't encrypted or hashed.** The data dictionary says the server should do that, and there is no server yet.
- **Names can't have spaces.** I followed the "letters, apostrophes and dashes" rule, so a name like "De La Cruz" gets rejected right now. I'd like to allow single spaces.
- **The ZIP code isn't checked against the state.**

## Part 3

My pseudocode for the VALIDATE button and each field check is attached as a PDF: mis7375-homework3-pseudocode.pdf.
