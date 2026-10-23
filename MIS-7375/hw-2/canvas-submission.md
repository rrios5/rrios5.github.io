# Homework 2 Submission

Rogelio Rios
MIS 7375

## Part 1

**URL:** https://rrios5.github.io/MIS-7375/hw-2/index.html

**Theme:** A new patient registration form for a medical clinic called CougarAid Medical Center. It is the same theme as Homework 1.

## Part 2

### Synopsis

The page is an online sign-up form for new patients at CougarAid Medical Center. The patient fills in:

- their personal information (name, date of birth, SSN)
- address and contact info
- insurance
- a short health history (checkboxes and yes/no questions)
- a 1 to 10 "how do you feel today" slider
- a user ID and password for the patient portal

Then they check the HIPAA privacy acknowledgment. For this homework I added a **REVIEW** button next to Submit. It fills a table to the right of the form with everything the patient entered, and each row says "pass" or "ERROR:" with what's wrong. On a phone the table shows up under the form instead. The form itself never gets rewritten. I also added a **START OVER** button that clears the form and the table.

Most of the checks are done with HTML: `required`, `minlength`/`maxlength`, `min`/`max` on the date, and `pattern` regular expressions. Every field has a `title`, so hovering over it shows what that field needs, including the optional fields. I used JavaScript (in an external `script.js`) only for the things HTML can't do: matching the two passwords, the date range, the slider value, and the extra password and user ID rules. All the styling is in an external `style.css`.

### What I am happy with

- **The date of birth range comes from today's date.** When the page loads, JavaScript sets the date picker's `min` and `max` from the same clock the banner shows, so you can't pick a future date or one more than 120 years ago.
- **The password message updates as you type.** It lists what is still missing (uppercase, number, special character, and so on), and the list shrinks as you go. It also rejects a password that contains your user ID, first name, or last name. "Passwords do not match" shows up right under the confirm box.
- **The review table lines up and is color-coded.** Green for pass, red for errors. The address shows on three lines like a real mailing address. The SSN and password are hidden.
- **The state list is an external file** (`states.js`) with all 50 states, DC, and PR. It starts on "-- Select state --", so the patient has to pick one.
- **The ZIP code and user ID fix themselves.** A ZIP+4 like 77002-1234 gets cut down to 77002, and a user ID like TheJake becomes thejake. The corrected version shows in the field.
- **The JavaScript errors block Submit the same way the HTML ones do,** because I used `setCustomValidity()`. Submit won't go through until everything is fixed.

### What I didn't get working yet

- **Nothing is actually saved.** Submit just loads the thank you page. There is no server or database behind the form yet.
- **The user ID isn't checked for being unique.** That needs a database.
- **The SSN and password aren't encrypted or hashed.** They even show up in the thank you page's URL right now, because the form uses `method="get"`. A real version would need a server and `method="post"`.
- **The insurance provider isn't required when you answer "Yes" to insurance yet.**
- **The ZIP code isn't checked against the state.**
- **The symptoms box blocks double quotes, but it doesn't block HTML tags yet.**

## Part 3

My pseudocode for the page load, each JavaScript check, the REVIEW button, and Submit/Start Over is attached as a PDF: mis7375-homework2-pseudocode.pdf.
