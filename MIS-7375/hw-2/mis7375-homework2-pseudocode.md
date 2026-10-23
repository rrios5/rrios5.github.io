# Homework 2 Pseudocode

**Rogelio Rios**
MIS 7375
October 17, 2026

---

## How I approached it

I started from my Homework 1 patient registration form and copied it into a new `hw-2` folder, so Homework 1 stays the way I turned it in.

The plan for this homework was **HTML first, JavaScript only where HTML can't do it.** Most of the checks are HTML attributes on the fields themselves (`required`, `minlength`, `maxlength`, `min`, `max`, and `pattern` regular expressions). Every field also has a `title` that pops up when you hover over it and tells you what the field wants.

JavaScript (in `script.js`) only handles the things HTML can't do:

- comparing the two password boxes
- making sure the password doesn't contain the user ID or the patient's name
- working out the date of birth range from today's date
- showing the slider's value as it moves
- blocking double quotes in the symptoms box (`pattern` doesn't work on a textarea)
- converting the user ID to lowercase and cutting a ZIP+4 down to 5 digits

When a JavaScript check fails, it calls `setCustomValidity()`. That makes the browser treat the field as invalid, the same way it treats a bad pattern, so the Submit button gets blocked by both kinds of checks.

The **REVIEW** button fills a table to the right of the form (below it on a phone) with everything that was entered, plus a pass or ERROR status for each row. The form itself is never rewritten.

---

## 1. HTML pattern rules (no JavaScript needed)

| Field | Rule in plain English | `pattern` |
|---|---|---|
| First Name | Required, 1 to 30 letters, apostrophes, dashes | `^[A-Za-z'\-]{1,30}$` |
| Middle Initial | Optional, 1 letter | `^[A-Za-z]?$` |
| Last Name | Required, 1 to 30 letters, apostrophes, dashes, digits 2 to 5 | `^[A-Za-z2-5'\-]{1,30}$` |
| Date of Birth | Required, `min` = 120 years ago, `max` = today | (date input, set by `setDobRange`) |
| SSN | Required, 9 digits, dashes optional, hidden (`type="password"`) | `^\d{3}-?\d{2}-?\d{4}$` |
| Email | Required, name@domain.tld | `^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$` |
| Phone | Optional, 000-000-0000, can't start with 0 or 1 | `^[2-9]\d{2}-\d{3}-\d{4}$` |
| Address Line 1 | Required, 2 to 30 characters | `minlength="2" maxlength="30"` |
| Address Line 2 | Optional, 2 to 30 characters if used | `minlength="2" maxlength="30"` |
| City | Required, 2 to 30 letters, spaces, `.`, `'`, `-` | `^[A-Za-z .'\-]+$` |
| State | Required, blank first option so they have to choose | `required` |
| ZIP | Required, 5 digits or ZIP+4 | `^\d{5}(-\d{4})?$` |
| User ID | Required, 5 to 30, starts with a letter, letters, numbers, `_`, `-`, no spaces | `^[A-Za-z][A-Za-z0-9_\-]{4,29}$` |
| Password | Required, 8 to 30, upper, lower, number, special, no `"` | `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[^"]{8,30}$` |
| HIPAA box | Must be checked | `required` |

---

## 2. When the page loads

```text
WHEN the page finishes loading
    CALL showClientDateTime()          // date and time in the banner, refreshed every second
    IF the registration form is on this page THEN
        CALL loadStates("state")       // from states.js, the external state list
        CALL setDobRange()
        CONNECT each JavaScript check to its field (see section 5)
    END IF
END WHEN

FUNCTION loadStates(selectId)
    FOR EACH [code, name] IN the STATES list (50 states + DC + PR)
        ADD an option to the dropdown showing name, with value = code
    END FOR
END FUNCTION

FUNCTION setDobRange()
    SET today = the visitor's current date
    SET dob.max = today                         (as YYYY-MM-DD)
    SET dob.min = today minus 120 years         (as YYYY-MM-DD)
END FUNCTION
```

---

## 3. Helper functions

```text
FUNCTION showError(fieldId, message)
    TELL the browser the field is invalid with message (setCustomValidity)
    ADD the "invalid" class so the field gets a red border
    PUT message in the error span under the field (id = fieldId + "_error")
END FUNCTION

FUNCTION clearError(fieldId)
    TELL the browser the field is fine (setCustomValidity(""))
    REMOVE the "invalid" class
    EMPTY the error span under the field
END FUNCTION
```

---

## 4. The JavaScript checks

```text
FUNCTION checkDob()
    IF the date was only partly typed THEN
        showError("dob", "Enter a full date as MM/DD/YYYY.")
    ELSE IF the date is empty THEN
        clearError("dob")                     // the required attribute handles empty
    ELSE IF the date is after dob.max THEN
        showError("dob", "Date of birth cannot be in the future.")
    ELSE IF the date is before dob.min THEN
        showError("dob", "Date of birth cannot be more than 120 years ago.")
    ELSE
        clearError("dob")
    END IF
END FUNCTION

FUNCTION fixZip()
    IF zip looks like 12345-6789 THEN
        SET zip = its first 5 digits
        SHOW "ZIP+4 shortened to 12345." under the field
    END IF
END FUNCTION

FUNCTION fixUserId()
    IF the user ID has any uppercase letters THEN
        SET userid = userid in lowercase
        SHOW "Changed to lowercase: ..." under the field
    END IF
END FUNCTION

FUNCTION checkSymptoms()
    IF the symptoms text contains a double quote (") THEN
        showError("symptoms", "Please don't use double quotes.")
    ELSE
        clearError("symptoms")
    END IF
END FUNCTION

FUNCTION updateHealthScale()
    SET value = the slider's current number
    IF value <= 3 THEN word = "Poor"
    ELSE IF value <= 6 THEN word = "Okay"
    ELSE word = "Good"
    SHOW value + " / 10 - " + word next to the slider
END FUNCTION

FUNCTION checkPassword()
    IF the password is empty THEN clearError and STOP   // required handles empty
    SET missing = empty list
    IF shorter than 8 characters     THEN ADD "at least 8 characters" to missing
    IF no uppercase letter           THEN ADD "an uppercase letter" to missing
    IF no lowercase letter           THEN ADD "a lowercase letter" to missing
    IF no number                     THEN ADD "a number" to missing
    IF no special character          THEN ADD "a special character" to missing

    IF the password contains " THEN
        showError("Double quotes are not allowed.")
    ELSE IF missing is not empty THEN
        showError("Still needs: " + missing joined with commas)
    ELSE IF the password (ignoring case) contains the user ID, first name, or last name
            (only counting ones that are 3+ letters long) THEN
        showError("Password can't contain your user ID / first name / last name.")
    ELSE
        clearError("password_plain")
    END IF
END FUNCTION

FUNCTION checkPasswordConfirm()
    IF confirm is not empty AND confirm is not equal to password THEN
        showError("password_confirm", "Passwords do not match.")
    ELSE
        clearError("password_confirm")
    END IF
END FUNCTION

FUNCTION runAllChecks()
    CALL fixZip, fixUserId, checkDob, checkSymptoms, checkPassword, checkPasswordConfirm
END FUNCTION
```

---

## 5. When each check runs (on the fly)

| Event | What runs |
|---|---|
| Date of birth changes or loses focus | `checkDob()` |
| ZIP loses focus | `fixZip()` |
| User ID loses focus | `fixUserId()` |
| Typing in symptoms | `checkSymptoms()` |
| Moving the slider (`oninput`) | `updateHealthScale()` |
| Typing in password, user ID, first name, or last name | `checkPassword()` then `checkPasswordConfirm()` |
| Typing in confirm password | `checkPasswordConfirm()` |
| Clicking REVIEW | `reviewForm()` |
| Clicking SUBMIT | `runAllChecks()`, then the browser checks every field |
| Clicking START OVER | clear the form, the error messages, and the review table |

> **Note:** Errors show up in red right under the field they belong to. Each error span has a set height in `style.css`, so the form doesn't jump around when a message appears or goes away.

---

## 6. REVIEW button

```text
FUNCTION reviewForm()
    CALL runAllChecks()                        // so ZIP and user ID are cleaned up first

    BUILD a list of rows. Each row = [label, value, status]:
        "YOUR INFORMATION" section heading
        First, MI, Last Name   -> first + MI + last joined with spaces
        Date of Birth          -> flipped from YYYY-MM-DD to MM/DD/YYYY
        Social Security Number -> "●●●●●●●● (hidden)" if something was typed
        Preferred Language, Sex
        "ADDRESS & CONTACT" section heading
        Address                -> line 1, line 2, and "City, ST ZIP" on separate lines
        Email Address, Phone Number, Contact Method
        "INSURANCE" section heading
        Has Insurance, Insurance Provider, Member ID
        "REQUESTED INFO" section heading
        each health condition  -> Y or N
        Flu Vaccine, Tobacco Use, How You Feel Today, Described Symptoms
        "PATIENT PORTAL ACCOUNT" section heading
        User ID (lowercase), Password (hidden), HIPAA Acknowledged

    FOR EACH row's status
        FOR EACH field in that row
            IF the browser says the field is invalid THEN
                IF it's empty            THEN message = "Required"
                ELSE IF a JavaScript check failed THEN message = that check's message
                ELSE IF the pattern failed  THEN message = the field's title hint
                status = "ERROR: " + message
                STOP checking this row
            END IF
        END FOR
        IF nothing failed THEN status = "pass"
    END FOR

    EMPTY the review table body
    FOR EACH row
        ADD a table row using textContent (so typed text can never turn into HTML)
        COLOR the status green for pass, red for ERROR
    END FOR
    SCROLL the table into view
END FUNCTION
```

---

## 7. SUBMIT and START OVER

```text
WHEN SUBMIT is clicked
    CALL runAllChecks()
    THE BROWSER checks every required, minlength, maxlength, min, max, and pattern rule,
        plus every JavaScript error set by setCustomValidity
    IF anything is invalid THEN
        STAY on the page and point to the first bad field with its message
    ELSE
        GO TO thankyou.html
    END IF
END WHEN

WHEN START OVER is clicked
    RESET every field to its starting value (state back to "-- Select state --", slider back to 5)
    CLEAR every error message
    PUT the review table back to "Click REVIEW to see your information here."
END WHEN
```
