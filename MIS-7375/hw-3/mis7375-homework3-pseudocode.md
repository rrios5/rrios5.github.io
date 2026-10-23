# Homework 3 Pseudocode

**Rogelio Rios**
MIS 7375
October 12, 2026

---

## How I approached it

I built on the same patient registration form from Homework 1. The way I thought about it was pretty simple. Every field gets its own check function in `script.js`, and those functions run on the fly while the patient is typing or when they leave the field, so the warning shows up right away.

Then the **VALIDATE** button calls every one of those same functions one more time and counts how many came back bad. If the count is zero, the **Submit** button shows up. If it is not zero, Submit stays hidden and the error messages stay on the page next to the fields that still need fixing.

I left the HTML checks (`required`, `minlength`, `maxlength`, `pattern`) in the page as a backup, but the JavaScript is what does the real work now.

---

## 1. Helper functions (used by every check)

```text
FUNCTION showError(fieldId, message)
    FIND the error span reserved under fieldId (id = fieldId + "_error")
    SET its text to message
    ADD the "invalid" class to the field so it gets the red border from style.css
END FUNCTION

FUNCTION clearError(fieldId)
    FIND the error span under fieldId
    SET its text to empty
    REMOVE the "invalid" class from the field
END FUNCTION
```

> **Note:** Every field has an empty error span already sitting under it with a set `min-height` in `style.css`, so the form does not jump around when messages show up or go away.

---

## 2. VALIDATE button (main logic)

```text
FUNCTION validateForm()
    SET errorCount = 0
    HIDE the Submit button

    // Your Information
    IF checkFirstName() is false              THEN errorCount = errorCount + 1
    IF checkMiddleInit() is false             THEN errorCount = errorCount + 1
    IF checkLastName() is false               THEN errorCount = errorCount + 1
    IF checkDOB() is false                    THEN errorCount = errorCount + 1
    IF checkSSN() is false                    THEN errorCount = errorCount + 1
    IF checkLanguage() is false               THEN errorCount = errorCount + 1
    IF checkRequiredRadio("sex") is false     THEN errorCount = errorCount + 1

    // Address and Contact
    IF checkAddr1() is false                  THEN errorCount = errorCount + 1
    IF checkAddr2() is false                  THEN errorCount = errorCount + 1
    IF checkCity() is false                   THEN errorCount = errorCount + 1
    IF checkState() is false                  THEN errorCount = errorCount + 1
    IF checkZip() is false                    THEN errorCount = errorCount + 1
    IF checkEmail() is false                  THEN errorCount = errorCount + 1
    IF checkPhone() is false                  THEN errorCount = errorCount + 1

    // Insurance
    IF checkRequiredRadio("has_insurance") is false THEN errorCount = errorCount + 1
    IF checkInsuranceProvider() is false      THEN errorCount = errorCount + 1
    IF checkMemberId() is false               THEN errorCount = errorCount + 1

    // Health History
    IF checkHealthHistory() is false          THEN errorCount = errorCount + 1
    IF checkSymptoms() is false               THEN errorCount = errorCount + 1
    IF checkHealthScale() is false            THEN errorCount = errorCount + 1

    // Patient Portal Account
    IF checkUserId() is false                 THEN errorCount = errorCount + 1
    IF checkPassword() is false               THEN errorCount = errorCount + 1
    IF checkPasswordConfirm() is false        THEN errorCount = errorCount + 1

    // Privacy Acknowledgment
    IF checkHipaa() is false                  THEN errorCount = errorCount + 1

    IF errorCount = 0 THEN
        DISPLAY "Everything looks good. You can submit now."
        SHOW the Submit button
    ELSE
        DISPLAY "Please fix the " + errorCount + " field(s) marked in red."
        KEEP the Submit button hidden
        MOVE focus to the first field that has an error
    END IF
END FUNCTION
```

> **Note:** The checks do not stop at the first error. I want every bad field flagged in one pass so the patient is not fixing things one at a time.

---

## 3. Field checks

> In the checks below, `showError(message)` and `clearError()` are shorthand for calling the helpers with the current field's id.

### Your Information

```text
FUNCTION checkFirstName()
    GET firstname, TRIM spaces
    IF value is empty THEN showError("First name is required."), RETURN false
    IF length > 30    THEN showError("First name must be 30 characters or less."), RETURN false
    IF value has anything other than letters, apostrophes or dashes THEN
        showError("Letters, apostrophes and dashes only."), RETURN false
    END IF
    clearError(), RETURN true
END FUNCTION

FUNCTION checkMiddleInit()
    GET middleinit, TRIM spaces, CONVERT to uppercase, PUT it back in the field
    IF value is empty THEN clearError(), RETURN true        (optional)
    IF value is not a single letter THEN showError("One letter only, no numbers."), RETURN false
    clearError(), RETURN true
END FUNCTION

FUNCTION checkLastName()
    Same logic as checkFirstName on lastname, with "Last name" in the messages.
END FUNCTION

FUNCTION formatDOB()                                        (runs oninput)
    REMOVE everything that is not a digit, CUT to 8 digits
    INSERT a slash after the 2nd digit and after the 4th digit
    PUT the formatted value back in the field
END FUNCTION

FUNCTION checkDOB()
    GET dob, SPLIT on "/" into month, day, year
    IF any piece is missing or not a number THEN showError("Use MM/DD/YYYY."), RETURN false
    IF month < 1 OR month > 12 THEN showError("Month must be 01 to 12."), RETURN false
    BUILD a date from month, day, year
    IF the built date's month or day does not match what was typed THEN
        showError("That date does not exist."), RETURN false   (catches things like 02/30 or 04/31)
    END IF
    IF date is after today THEN
        showError("Date of birth cannot be in the future."), RETURN false
    IF date is more than 120 years before today THEN
        showError("Date of birth cannot be more than 120 years ago."), RETURN false
    clearError(), RETURN true
END FUNCTION

FUNCTION formatSSN()                                        (runs oninput)
    REMOVE everything that is not a digit, CUT to 9 digits
    IF more than 3 digits THEN insert a dash after the 3rd digit
    IF more than 5 digits THEN insert a dash after the 5th digit
    PUT the formatted value back in ssn_plain (type password, so it still shows dots)
END FUNCTION

FUNCTION checkSSN()
    GET ssn_plain, REMOVE the dashes
    IF value is empty THEN showError("SSN is required."), RETURN false
    IF value is not exactly 9 digits THEN showError("SSN must be 9 numbers."), RETURN false
    clearError(), RETURN true
END FUNCTION

FUNCTION checkLanguage()
    GET preferred_language, TRIM spaces
    IF value is empty THEN clearError(), RETURN true        (optional)
    IF length > 20 OR value has anything other than letters and spaces THEN
        showError("Letters only, 20 characters max."), RETURN false
    END IF
    clearError(), RETURN true
END FUNCTION

FUNCTION checkRequiredRadio(groupName)                      (used for sex and has_insurance)
    IF no option in groupName is checked THEN
        showError(groupName, "Please choose one."), RETURN false
    clearError(groupName), RETURN true
END FUNCTION
```

### Address and Contact

```text
FUNCTION checkAddr1()
    GET addr1, TRIM spaces
    IF value is empty THEN showError("Address is required."), RETURN false
    IF length < 2 OR length > 30 THEN showError("Address must be 2 to 30 characters."), RETURN false
    IF value has characters other than letters, numbers, spaces, periods, commas, dashes or # THEN
        showError("Please remove special characters."), RETURN false
    END IF
    clearError(), RETURN true
END FUNCTION

FUNCTION checkAddr2()
    GET addr2, TRIM spaces
    IF value is empty THEN clearError(), RETURN true        (optional)
    OTHERWISE run the same length and character checks as checkAddr1
END FUNCTION

FUNCTION checkCity()
    GET city, TRIM spaces
    IF value is empty THEN showError("City is required."), RETURN false
    IF length < 2 OR length > 30 THEN showError("City must be 2 to 30 characters."), RETURN false
    IF value has anything other than letters, spaces, periods, apostrophes or dashes THEN
        showError("Letters only."), RETURN false
    END IF
    clearError(), RETURN true
END FUNCTION

FUNCTION checkState()
    IF the selected option is the blank "-- Select state --" option THEN
        showError("Please pick a state."), RETURN false
    END IF
    clearError(), RETURN true
END FUNCTION

FUNCTION checkZip()
    GET zip, TRIM spaces
    IF value is empty THEN showError("ZIP code is required."), RETURN false
    IF value is not exactly 5 digits THEN showError("ZIP code must be 5 numbers."), RETURN false
    clearError(), RETURN true
END FUNCTION

FUNCTION checkEmail()
    GET email, TRIM spaces, CONVERT to lowercase, PUT it back in the field
    IF value is empty THEN showError("Email is required."), RETURN false
    IF value does not match name@domain.tld THEN
        showError("Email must look like name@domain.com."), RETURN false
    clearError(), RETURN true
END FUNCTION

FUNCTION checkPhone()
    GET phone1, REMOVE everything that is not a digit
    GET the checked contact_pref value
    IF value is empty THEN
        IF contact_pref is Phone call (P) OR Text (T) THEN
            showError("We need a phone number to call or text you."), RETURN false
        END IF
        clearError(), RETURN true                           (otherwise optional)
    END IF
    IF value is not exactly 10 digits THEN showError("Phone must be 10 digits."), RETURN false
    IF the area code or the next 3 digits start with 0 or 1 THEN
        showError("That is not a valid US number."), RETURN false
    REFORMAT the field as (713) 555-0123
    clearError(), RETURN true
END FUNCTION
```

### Insurance

```text
FUNCTION checkInsuranceProvider()
    GET the checked has_insurance value and the insurance_provider selection
    IF has_insurance is Yes (Y) AND provider is blank THEN
        showError("Please pick your insurance provider."), RETURN false
    END IF
    clearError(), RETURN true
END FUNCTION

FUNCTION checkMemberId()
    GET member_id, TRIM spaces, CONVERT to uppercase
    IF value is empty THEN clearError(), RETURN true        (optional)
    IF length > 20 OR value has anything other than letters, numbers or dashes THEN
        showError("Letters, numbers and dashes only, as shown on your card."), RETURN false
    END IF
    clearError(), RETURN true
END FUNCTION

FUNCTION toggleInsurance()                                  (runs onchange on has_insurance)
    IF has_insurance is No (N) THEN
        CLEAR and DISABLE insurance_provider and member_id, clearError on both
    ELSE
        ENABLE insurance_provider and member_id
    END IF
END FUNCTION
```

### Health History

```text
FUNCTION checkHealthHistory()
    IF hx_none is checked AND any other hx_ box is also checked THEN
        showError("You checked None of the above along with a condition. Please pick one or the other."), RETURN false
    END IF
    clearError(), RETURN true
END FUNCTION
```

> **Note:** Zero boxes checked is a valid answer since it is "check all that apply." The `flu_vaccinated`, `tobacco_use` and `contact_pref` radio groups are optional, so nothing to check there beyond what the browser already does.

```text
FUNCTION checkSymptoms()
    GET symptoms
    IF value is empty THEN clearError(), RETURN true        (optional)
    IF value contains < or > THEN showError("Please do not use < or >."), RETURN false
    IF length > 500 THEN showError("Please keep it under 500 characters."), RETURN false
    clearError(), RETURN true
END FUNCTION

FUNCTION updateHealthScale()                                (runs oninput, moved out of the HTML into script.js)
    GET health_scale value
    SET health_scale_output to that value so the patient sees the number as they slide
END FUNCTION

FUNCTION checkHealthScale()
    IF value < 1 OR value > 10 THEN showError("Please pick a number from 1 to 10."), RETURN false
    clearError(), RETURN true
END FUNCTION
```

### Patient Portal Account

```text
FUNCTION checkUserId()
    GET userid, TRIM spaces
    IF value is empty THEN showError("User ID is required."), RETURN false
    IF first character is a number THEN showError("User ID cannot start with a number."), RETURN false
    IF length < 5 OR length > 20 THEN showError("User ID must be 5 to 20 characters."), RETURN false
    IF value has anything other than letters, numbers, dashes or underscores THEN
        showError("No spaces or special characters. Dash and underscore are ok."), RETURN false
    END IF
    clearError(), RETURN true
END FUNCTION

FUNCTION checkPassword()
    GET password_plain and userid
    SET missing = empty list
    IF length < 8                THEN ADD "at least 8 characters" to missing
    IF no uppercase letter       THEN ADD "1 uppercase letter" to missing
    IF no lowercase letter       THEN ADD "1 lowercase letter" to missing
    IF no number                 THEN ADD "1 number" to missing
    IF password equals userid (ignoring case) THEN ADD "cannot match your User ID" to missing
    IF missing is not empty THEN showError("Password needs: " + missing), RETURN false
    clearError(), RETURN true
END FUNCTION

FUNCTION checkPasswordConfirm()
    IF password_confirm is empty THEN showError("Please re-enter your password."), RETURN false
    IF password_confirm does not equal password_plain THEN
        showError("Passwords do not match."), RETURN false
    clearError(), RETURN true
END FUNCTION
```

### Privacy Acknowledgment

```text
FUNCTION checkHipaa()
    IF hipaa_ack is not checked THEN
        showError("Please acknowledge the privacy notice."), RETURN false
    clearError(), RETURN true
END FUNCTION
```

---

## 4. When each check runs (on the fly)

All of these get hooked up in `script.js` when the page loads, so there is no JavaScript sitting inline in the HTML.

| Field(s) | Event | What runs |
|---|---|---|
| `firstname`, `middleinit`, `lastname`, `preferred_language`, `addr1`, `addr2`, `city`, `email`, `member_id`, `userid` | `oninput` / `onblur` | `oninput` clears the error as soon as the value becomes good; `onblur` runs the full check when the patient leaves the field |
| `dob` | `oninput` / `onblur` | `formatDOB` / `checkDOB` |
| `ssn_plain` | `oninput` / `onblur` | `formatSSN` / `checkSSN` |
| `zip`, `phone1` | `oninput` / `onblur` | Strips anything that is not a number / runs the full check |
| `state`, `insurance_provider` | `onchange` | Their check function |
| `sex` | `onchange` | `checkRequiredRadio("sex")` |
| `has_insurance` | `onchange` | `toggleInsurance` and `checkInsuranceProvider` |
| `contact_pref` | `onchange` | Re-runs `checkPhone`, since picking Phone or Text makes the phone number required |
| `hx_` checkboxes | `onchange` | `checkHealthHistory` |
| `symptoms` | `oninput` | `checkSymptoms` and shows a live "characters left" count |
| `health_scale` | `oninput` | `updateHealthScale` |
| `password_plain` | `oninput` | `checkPassword` so the list of what is missing shrinks as they type; re-runs `checkPasswordConfirm` if the confirm box already has something in it |
| `password_confirm` | `oninput` | `checkPasswordConfirm` |
| `userid` | `oninput` | Also re-runs `checkPassword`, since the password cannot equal the User ID |
| `hipaa_ack` | `onchange` | `checkHipaa` |

Every field also has a `title` attribute and placeholder or hint text so the patient knows the rule before they start typing.

---

## 5. Buttons

- **VALIDATE** replaces the old Submit button and runs `validateForm`.
- The real **Submit** button starts out hidden.

```text
IF the patient changes any field after a successful VALIDATE THEN
    HIDE the Submit button again (they have to re-validate so nothing bad slips through)
END IF

WHEN Submit is clicked THEN
    LOAD thankyou.html, which says "Thank you for your submission. We will be contacting you shortly."

WHEN Clear Form is clicked THEN
    RESET every field
    clearError on every field
    SET health_scale_output back to 5
    HIDE the Submit button
```
