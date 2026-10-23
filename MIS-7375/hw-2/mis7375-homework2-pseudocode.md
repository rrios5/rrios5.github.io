# Homework 2 Pseudocode

**Rogelio Rios**
MIS 7375
October 17, 2026

---

## My approach

Before writing any code, I planned the homework out with the pseudocode below. I started from my Homework 1 registration form and kept it in its own folder, so Homework 1 stays the same.

My plan was to let HTML do as much of the checking as possible and only use JavaScript where HTML can't do the job:

1. **HTML first.** Every field gets a `title` hint, and most checks are done with `required`, `minlength`, `maxlength`, and `pattern` regular expressions.
2. **A few helper functions.** One finds a field by its name, and the others show or clear an error message right under that field. Every JavaScript check reuses them.
3. **JavaScript only where needed.** The date of birth range, blocking double quotes in the symptoms box, the slider value, the password rules, and matching the two passwords.
4. **A REVIEW button.** It runs every check and fills a table next to the form with each value and a pass or ERROR status. The form itself never gets rewritten.
5. **SUBMIT and START OVER.** Submit is blocked until every error is fixed. Start Over clears the form and the table.

## Page load

```text
WHEN the page loads
    CALL showClientDateTime() and repeat it every second      // date and time in the banner
    IF the registration form is on this page THEN
        CALL loadStates("state")                               // states.js fills the state dropdown
        CALL setDobRange()
        CONNECT each check to its field (see "Checking fields as the user types")
    END IF
END WHEN

FUNCTION setDobRange()
    SET today = the visitor's current date
    SET date of birth max = toIsoDate(today)
    SET date of birth min = toIsoDate(today minus 120 years)
END FUNCTION
```

## Helper functions

```text
FUNCTION getField(name)
    RETURN the form field with that name
END FUNCTION

FUNCTION errorSpan(name)
    RETURN the error message spot right under that field
END FUNCTION

FUNCTION showError(name, message)
    MARK the field as invalid so SUBMIT is blocked
    TURN the field's border red
    SHOW message in errorSpan(name)
END FUNCTION

FUNCTION clearError(name)
    MARK the field as valid
    REMOVE the red border
    EMPTY errorSpan(name)
END FUNCTION

FUNCTION toIsoDate(date)
    RETURN date as YYYY-MM-DD
END FUNCTION

FUNCTION formatHealthScale(value)
    IF value <= 3 THEN word = "Poor"
    ELSE IF value <= 6 THEN word = "Okay"
    ELSE word = "Good"
    RETURN value + " / 10 - " + word
END FUNCTION
```

## Checking fields as the user types

```text
WHEN date of birth changes or loses focus, CALL checkDob()
    IF date is only partly typed     THEN showError "Enter a full date as MM/DD/YYYY"
    ELSE IF date is empty            THEN clearError (required handles empty)
    ELSE IF date is after today      THEN showError "Date of birth cannot be in the future"
    ELSE IF date is over 120 yrs ago THEN showError "Date of birth cannot be more than 120 years ago"
    ELSE clearError

WHEN typing in symptoms, CALL checkSymptoms()
    IF text contains a double quote THEN showError "Please don't use double quotes"
    ELSE clearError

WHEN slider moves, CALL updateHealthScale()
    SHOW formatHealthScale(slider value) next to the slider

WHEN typing in password, user ID, first name, or last name, CALL checkPassword() then checkPasswordConfirm()

FUNCTION checkPassword()
    IF password is empty THEN clearError and STOP (required handles empty)
    IF password has a double quote THEN showError "Double quotes are not allowed"
    ELSE IF password is missing any of: 8 characters, uppercase, lowercase, number, special character
        THEN showError "Still needs: " + the missing items
    ELSE IF password contains the user ID, first name, or last name (ignoring case, 3+ letters)
        THEN showError "Password can't contain your user ID / first name / last name"
    ELSE clearError
END FUNCTION

WHEN typing in confirm password, CALL checkPasswordConfirm()
    IF confirm is not empty AND confirm does not equal password THEN showError "Passwords do not match"
    ELSE clearError

FUNCTION runAllChecks()
    CALL checkDob(), checkSymptoms(), checkPassword(), checkPasswordConfirm()
END FUNCTION
```

All other fields (name, SSN, email, phone, address, ZIP, user ID) are checked by HTML `pattern`, `required`, `minlength`, and `maxlength`.

## REVIEW button

```text
WHEN REVIEW is clicked, CALL reviewForm()
    CALL runAllChecks()
    BUILD the rows, grouped under section headings:
        name (first, MI, last together), date of birth as MM/DD/YYYY, SSN hidden
        address (line 1, line 2, city/state/ZIP on separate lines), email, phone
        insurance, each health condition as Y or N, slider as formatHealthScale(value), symptoms
        user ID, password hidden, HIPAA as Y or N
    FOR EACH row, SET status = statusOf(the row's fields)
        (checkboxes and radio buttons with nothing to check get no status)
    EMPTY the review table and ADD every row: field name, value, status
    SCROLL to the review table

FUNCTION statusOf(fields)
    FOR EACH field
        IF field is invalid THEN RETURN "ERROR: " + errorFor(field)
            (add the field's label first if the row has more than one field)
    END FOR
    RETURN "pass"
END FUNCTION

FUNCTION errorFor(field)
    IF field is empty               THEN RETURN "Required"
    ELSE IF a JavaScript check failed THEN RETURN that check's message
    ELSE IF the pattern failed       THEN RETURN the field's title hint
    ELSE RETURN the browser's message
END FUNCTION
```

## SUBMIT and START OVER buttons

```text
WHEN SUBMIT is clicked
    CALL runAllChecks()
    IF any field has an error THEN
        STAY on the page and show the error next to that field
    ELSE
        GO TO thankyou.html
    END IF

WHEN START OVER is clicked
    CLEAR every field
    clearError for date of birth, symptoms, password, and confirm password
    CALL updateHealthScale()       // slider readout back to 5
    CALL clearReview()             // review table back to "Click REVIEW to see your information here."
```
