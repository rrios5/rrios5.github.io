/*
Program name: Patient Registration Protocol Scripts
Author: Rogelio Rios
Date created: 09/27/2026
Date last edited: 10/18/2026
Version: 3.0
Description: Shows the web client's day, date, and time in the banner. For HW3 it also checks every field of the
registration form as the patient types or leaves it, and again when they click VALIDATE.
*/

function showClientDateTime() {
    // new Date() reads the visitor's own clock and time zone
    const now = new Date();

    const date = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

    const el = document.getElementById("client-datetime");
    el.textContent = date + " | " + time;
    el.dateTime = now.toISOString();
}

showClientDateTime();
// Refresh every second so the minute rolls over on time
setInterval(showClientDateTime, 1000);

/* ---------- 1. Helper functions (used by every check) ---------- */

// Each field has an empty <span id="fieldId_error"> under it, so the message goes there
function showError(fieldId, message) {
    document.getElementById(fieldId + "_error").textContent = message;
    document.getElementById(fieldId).classList.add("invalid");
}

function clearError(fieldId) {
    document.getElementById(fieldId + "_error").textContent = "";
    document.getElementById(fieldId).classList.remove("invalid");
}

// Returns the value of the checked radio button in a group, or "" if none is checked
function getRadioValue(groupName) {
    const checked = document.querySelector('input[name="' + groupName + '"]:checked');
    if (checked) {
        return checked.value;
    }
    return "";
}

/* ---------- 3. Field checks ---------- */
// Every check returns true if the field is good and false if it isn't, so validateForm() can count them.

// Your Information

// First and last name use the same rules, so they share this function
function checkName(fieldId, label) {
    const value = document.getElementById(fieldId).value.trim();

    if (value === "") {
        showError(fieldId, label + " is required.");
        return false;
    }
    if (value.length > 30) {
        showError(fieldId, label + " must be 30 characters or less.");
        return false;
    }
    if (!/^[A-Za-z'-]+$/.test(value)) {
        showError(fieldId, "Letters, apostrophes and dashes only.");
        return false;
    }
    clearError(fieldId);
    return true;
}

function checkFirstName() {
    return checkName("firstname", "First name");
}

function checkMiddleInit() {
    const field = document.getElementById("middleinit");
    field.value = field.value.trim().toUpperCase();

    // optional, so blank is fine
    if (field.value === "") {
        clearError("middleinit");
        return true;
    }
    if (!/^[A-Z]$/.test(field.value)) {
        showError("middleinit", "One letter only, no numbers.");
        return false;
    }
    clearError("middleinit");
    return true;
}

function checkLastName() {
    return checkName("lastname", "Last name");
}

// Runs on every keystroke so the patient only types numbers and the slashes show up on their own
function formatDOB() {
    const field = document.getElementById("dob");
    const digits = field.value.replace(/\D/g, "").slice(0, 8);

    if (digits.length > 4) {
        field.value = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    } else if (digits.length > 2) {
        field.value = digits.slice(0, 2) + "/" + digits.slice(2);
    } else {
        field.value = digits;
    }
}

function checkDOB() {
    const value = document.getElementById("dob").value;

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        showError("dob", "Use MM/DD/YYYY.");
        return false;
    }

    const parts = value.split("/");
    const month = Number(parts[0]);
    const day = Number(parts[1]);
    const year = Number(parts[2]);

    if (month < 1 || month > 12) {
        showError("dob", "Month must be 01 to 12.");
        return false;
    }

    // JavaScript rolls bad dates over (02/30 turns into 03/02), so if the month or day
    // changed after building the date, the date the patient typed doesn't exist
    const dob = new Date(year, month - 1, day);
    if (dob.getMonth() !== month - 1 || dob.getDate() !== day) {
        showError("dob", "That date does not exist.");
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dob > today) {
        showError("dob", "Date of birth cannot be in the future.");
        return false;
    }

    const oldest = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    if (dob < oldest) {
        showError("dob", "Date of birth cannot be more than 120 years ago.");
        return false;
    }

    clearError("dob");
    return true;
}

// Adds the dashes as they type (XXX-XX-XXXX). The field is type="password" so it still shows dots.
function formatSSN() {
    const field = document.getElementById("ssn_plain");
    const digits = field.value.replace(/\D/g, "").slice(0, 9);

    if (digits.length > 5) {
        field.value = digits.slice(0, 3) + "-" + digits.slice(3, 5) + "-" + digits.slice(5);
    } else if (digits.length > 3) {
        field.value = digits.slice(0, 3) + "-" + digits.slice(3);
    } else {
        field.value = digits;
    }
}

function checkSSN() {
    const value = document.getElementById("ssn_plain").value.replace(/-/g, "");

    if (value === "") {
        showError("ssn_plain", "SSN is required.");
        return false;
    }
    if (!/^\d{9}$/.test(value)) {
        showError("ssn_plain", "SSN must be 9 numbers.");
        return false;
    }
    clearError("ssn_plain");
    return true;
}

function checkLanguage() {
    const value = document.getElementById("preferred_language").value.trim();

    // optional
    if (value === "") {
        clearError("preferred_language");
        return true;
    }
    if (value.length > 20 || !/^[A-Za-z ]+$/.test(value)) {
        showError("preferred_language", "Letters only, 20 characters max.");
        return false;
    }
    clearError("preferred_language");
    return true;
}

// Used for sex and has_insurance. The fieldset id matches the group name.
function checkRequiredRadio(groupName) {
    if (getRadioValue(groupName) === "") {
        showError(groupName, "Please choose one.");
        return false;
    }
    clearError(groupName);
    return true;
}

// Address and Contact

// Address line 1 and 2 have the same rules, except line 2 can be left blank
function checkAddress(fieldId, required) {
    const value = document.getElementById(fieldId).value.trim();

    if (value === "") {
        if (required) {
            showError(fieldId, "Address is required.");
            return false;
        }
        clearError(fieldId);
        return true;
    }
    if (value.length < 2 || value.length > 30) {
        showError(fieldId, "Address must be 2 to 30 characters.");
        return false;
    }
    if (!/^[A-Za-z0-9 .,#-]+$/.test(value)) {
        showError(fieldId, "Please remove special characters.");
        return false;
    }
    clearError(fieldId);
    return true;
}

function checkAddr1() {
    return checkAddress("addr1", true);
}

function checkAddr2() {
    return checkAddress("addr2", false);
}

function checkCity() {
    const value = document.getElementById("city").value.trim();

    if (value === "") {
        showError("city", "City is required.");
        return false;
    }
    if (value.length < 2 || value.length > 30) {
        showError("city", "City must be 2 to 30 characters.");
        return false;
    }
    if (!/^[A-Za-z .'-]+$/.test(value)) {
        showError("city", "Letters only.");
        return false;
    }
    clearError("city");
    return true;
}

function checkState() {
    // the blank "-- Select state --" option has value ""
    if (document.getElementById("state").value === "") {
        showError("state", "Please pick a state.");
        return false;
    }
    clearError("state");
    return true;
}

function checkZip() {
    const value = document.getElementById("zip").value.trim();

    if (value === "") {
        showError("zip", "ZIP code is required.");
        return false;
    }
    if (!/^\d{5}$/.test(value)) {
        showError("zip", "ZIP code must be 5 numbers.");
        return false;
    }
    clearError("zip");
    return true;
}

function checkEmail() {
    const field = document.getElementById("email");
    const value = field.value.trim().toLowerCase();
    // only write it back if it changed, otherwise the cursor jumps to the end while typing
    if (field.value !== value) {
        field.value = value;
    }

    if (value === "") {
        showError("email", "Email is required.");
        return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(value)) {
        showError("email", "Email must look like name@domain.com.");
        return false;
    }
    clearError("email");
    return true;
}

function checkPhone() {
    const field = document.getElementById("phone1");
    const digits = field.value.replace(/\D/g, "");
    const contactPref = getRadioValue("contact_pref");

    if (digits === "") {
        // phone is optional, unless they want us to call or text them
        if (contactPref === "P" || contactPref === "T") {
            showError("phone1", "We need a phone number to call or text you.");
            return false;
        }
        clearError("phone1");
        return true;
    }
    if (digits.length !== 10) {
        showError("phone1", "Phone must be 10 digits.");
        return false;
    }
    // US area codes and exchanges can't start with 0 or 1
    if (digits[0] === "0" || digits[0] === "1" || digits[3] === "0" || digits[3] === "1") {
        showError("phone1", "That is not a valid US number.");
        return false;
    }

    field.value = "(" + digits.slice(0, 3) + ") " + digits.slice(3, 6) + "-" + digits.slice(6);
    clearError("phone1");
    return true;
}

// Insurance

function checkInsuranceProvider() {
    const hasInsurance = getRadioValue("has_insurance");
    const provider = document.getElementById("insurance_provider").value;

    if (hasInsurance === "Y" && provider === "") {
        showError("insurance_provider", "Please pick your insurance provider.");
        return false;
    }
    clearError("insurance_provider");
    return true;
}

function checkMemberId() {
    const field = document.getElementById("member_id");
    const value = field.value.trim().toUpperCase();
    if (field.value !== value) {
        field.value = value;
    }

    // optional
    if (value === "") {
        clearError("member_id");
        return true;
    }
    if (value.length > 20 || !/^[A-Z0-9-]+$/.test(value)) {
        showError("member_id", "Letters, numbers and dashes only, as shown on your card.");
        return false;
    }
    clearError("member_id");
    return true;
}

// If they don't have insurance there's nothing to fill in, so the two insurance fields get cleared and turned off
function toggleInsurance() {
    const provider = document.getElementById("insurance_provider");
    const memberId = document.getElementById("member_id");

    if (getRadioValue("has_insurance") === "N") {
        provider.value = "";
        memberId.value = "";
        provider.disabled = true;
        memberId.disabled = true;
        clearError("insurance_provider");
        clearError("member_id");
    } else {
        provider.disabled = false;
        memberId.disabled = false;
    }
}

// Health History

function checkHealthHistory() {
    const noneChecked = document.getElementById("hx_none").checked;
    const conditionChecked = document.querySelectorAll('#hx input[type="checkbox"]:checked:not(#hx_none)').length > 0;

    // zero boxes is fine since it's "check all that apply"
    if (noneChecked && conditionChecked) {
        showError("hx", "You checked None of the above along with a condition. Please pick one or the other.");
        return false;
    }
    clearError("hx");
    return true;
}

function checkSymptoms() {
    const value = document.getElementById("symptoms").value;

    // optional
    if (value === "") {
        clearError("symptoms");
        return true;
    }
    if (value.includes("<") || value.includes(">")) {
        showError("symptoms", "Please do not use < or >.");
        return false;
    }
    if (value.length > 500) {
        showError("symptoms", "Please keep it under 500 characters.");
        return false;
    }
    clearError("symptoms");
    return true;
}

function updateSymptomsCount() {
    const left = 500 - document.getElementById("symptoms").value.length;
    document.getElementById("symptoms_count").textContent = left + " characters left";
}

// Copies the slider value into the <output> so the patient sees the number as they slide (was inline in HW1)
function updateHealthScale() {
    document.getElementById("health_scale_output").value = document.getElementById("health_scale").value;
}

function checkHealthScale() {
    const value = Number(document.getElementById("health_scale").value);

    if (value < 1 || value > 10) {
        showError("health_scale", "Please pick a number from 1 to 10.");
        return false;
    }
    clearError("health_scale");
    return true;
}

// Patient Portal Account

function checkUserId() {
    const field = document.getElementById("userid");
    const value = field.value.trim();

    if (value === "") {
        showError("userid", "User ID is required.");
        return false;
    }
    if (/^[0-9]/.test(value)) {
        showError("userid", "User ID cannot start with a number.");
        return false;
    }
    if (value.length < 5 || value.length > 20) {
        showError("userid", "User ID must be 5 to 20 characters.");
        return false;
    }
    if (!/^[A-Za-z0-9_-]+$/.test(value)) {
        showError("userid", "No spaces or special characters. Dash and underscore are ok.");
        return false;
    }
    clearError("userid");
    return true;
}

// Builds a list of everything the password is still missing, so the list shrinks as they type
function checkPassword() {
    const password = document.getElementById("password_plain").value;
    const userId = document.getElementById("userid").value.trim();
    const missing = [];

    if (password.length < 8) {
        missing.push("at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
        missing.push("1 uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
        missing.push("1 lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
        missing.push("1 number");
    }
    if (userId !== "" && password.toLowerCase() === userId.toLowerCase()) {
        missing.push("cannot match your User ID");
    }

    if (missing.length > 0) {
        showError("password_plain", "Password needs: " + missing.join(", "));
        return false;
    }
    clearError("password_plain");
    return true;
}

function checkPasswordConfirm() {
    const password = document.getElementById("password_plain").value;
    const confirm = document.getElementById("password_confirm").value;

    if (confirm === "") {
        showError("password_confirm", "Please re-enter your password.");
        return false;
    }
    if (confirm !== password) {
        showError("password_confirm", "Passwords do not match.");
        return false;
    }
    clearError("password_confirm");
    return true;
}

// Privacy Acknowledgment

function checkHipaa() {
    if (!document.getElementById("hipaa_ack").checked) {
        showError("hipaa_ack", "Please acknowledge the privacy notice.");
        return false;
    }
    clearError("hipaa_ack");
    return true;
}

/* ---------- 2. VALIDATE button (main logic) ---------- */
// Doesn't stop at the first error. Every bad field gets flagged in one pass so the patient
// isn't fixing things one at a time.
function validateForm() {
    let errorCount = 0;
    const submitBtn = document.getElementById("submit_btn");
    const msg = document.getElementById("validate_msg");
    submitBtn.hidden = true;

    // Your Information
    if (!checkFirstName()) errorCount++;
    if (!checkMiddleInit()) errorCount++;
    if (!checkLastName()) errorCount++;
    if (!checkDOB()) errorCount++;
    if (!checkSSN()) errorCount++;
    if (!checkLanguage()) errorCount++;
    if (!checkRequiredRadio("sex")) errorCount++;

    // Address and Contact
    if (!checkAddr1()) errorCount++;
    if (!checkAddr2()) errorCount++;
    if (!checkCity()) errorCount++;
    if (!checkState()) errorCount++;
    if (!checkZip()) errorCount++;
    if (!checkEmail()) errorCount++;
    if (!checkPhone()) errorCount++;

    // Insurance
    if (!checkRequiredRadio("has_insurance")) errorCount++;
    if (!checkInsuranceProvider()) errorCount++;
    if (!checkMemberId()) errorCount++;

    // Health History
    if (!checkHealthHistory()) errorCount++;
    if (!checkSymptoms()) errorCount++;
    if (!checkHealthScale()) errorCount++;

    // Patient Portal Account
    if (!checkUserId()) errorCount++;
    if (!checkPassword()) errorCount++;
    if (!checkPasswordConfirm()) errorCount++;

    // Privacy Acknowledgment
    if (!checkHipaa()) errorCount++;

    if (errorCount === 0) {
        msg.textContent = "Everything looks good. You can submit now.";
        msg.className = "msg-good";
        submitBtn.hidden = false;
    } else {
        msg.textContent = "Please fix the " + errorCount + " field(s) marked in red.";
        msg.className = "msg-bad";

        // jump to the first problem. For a radio/checkbox group the red outline is on the
        // fieldset, so focus the first input inside it instead.
        const firstBad = document.querySelector(".invalid");
        if (firstBad.tagName === "FIELDSET") {
            firstBad.querySelector("input").focus();
        } else {
            firstBad.focus();
        }
    }

    return errorCount;
}

/* ---------- REVIEW button ---------- */
// Shows everything that was entered in a table. The last column runs the same checks as VALIDATE,
// which is mostly there for debugging.
function reviewForm() {
    // SSN and passwords are never shown, only whether something was typed
    function hidden(fieldId) {
        return document.getElementById(fieldId).value === "" ? "" : "●●●●●●";
    }

    const conditions = [];
    document.querySelectorAll('#hx input[type="checkbox"]:checked').forEach(function (box) {
        conditions.push(box.parentElement.textContent.trim());
    });

    const rows = [
        ["First Name", document.getElementById("firstname").value, checkFirstName()],
        ["Middle Initial", document.getElementById("middleinit").value, checkMiddleInit()],
        ["Last Name", document.getElementById("lastname").value, checkLastName()],
        ["Date of Birth", document.getElementById("dob").value, checkDOB()],
        ["SSN", hidden("ssn_plain"), checkSSN()],
        ["Preferred Language", document.getElementById("preferred_language").value, checkLanguage()],
        ["Sex", getRadioValue("sex"), checkRequiredRadio("sex")],
        ["Address Line 1", document.getElementById("addr1").value, checkAddr1()],
        ["Address Line 2", document.getElementById("addr2").value, checkAddr2()],
        ["City", document.getElementById("city").value, checkCity()],
        ["State", document.getElementById("state").value, checkState()],
        ["ZIP Code", document.getElementById("zip").value, checkZip()],
        ["Email", document.getElementById("email").value, checkEmail()],
        ["Mobile Phone", document.getElementById("phone1").value, checkPhone()],
        ["Contact Method", getRadioValue("contact_pref"), true],
        ["Has Insurance", getRadioValue("has_insurance"), checkRequiredRadio("has_insurance")],
        ["Insurance Provider", document.getElementById("insurance_provider").value, checkInsuranceProvider()],
        ["Member ID", document.getElementById("member_id").value, checkMemberId()],
        ["Health History", conditions.join(", "), checkHealthHistory()],
        ["Flu Vaccine", getRadioValue("flu_vaccinated"), true],
        ["Tobacco Use", getRadioValue("tobacco_use"), true],
        ["Symptoms", document.getElementById("symptoms").value, checkSymptoms()],
        ["Health Scale", document.getElementById("health_scale").value, checkHealthScale()],
        ["User ID", document.getElementById("userid").value, checkUserId()],
        ["Password", hidden("password_plain"), checkPassword()],
        ["Confirm Password", hidden("password_confirm"), checkPasswordConfirm()],
        ["HIPAA Acknowledged", document.getElementById("hipaa_ack").checked ? "Yes" : "No", checkHipaa()],
    ];

    // built with textContent instead of innerHTML so whatever the patient typed can't turn into HTML
    const table = document.createElement("table");
    const header = table.insertRow();
    ["Field", "Value", "OK?"].forEach(function (text) {
        const th = document.createElement("th");
        th.textContent = text;
        header.appendChild(th);
    });

    rows.forEach(function (row) {
        const tr = table.insertRow();
        tr.insertCell().textContent = row[0];
        tr.insertCell().textContent = row[1];
        const ok = tr.insertCell();
        ok.textContent = row[2] ? "✔" : "✘ fix";
        ok.className = row[2] ? "msg-good" : "msg-bad";
    });

    const output = document.getElementById("review_output");
    output.textContent = "";
    output.appendChild(table);
}

/* ---------- 4. When each check runs (on the fly) ---------- */
// thankyou.html loads this same file but has no form, so only hook things up if the form is on the page
const form = document.getElementById("registration-form");

// While typing, only re-check a field that's already red, so the error goes away as soon as it's
// fixed but the patient isn't yelled at halfway through typing. Leaving the field runs the full check.
function checkOnTheFly(fieldId, checkFn) {
    const field = document.getElementById(fieldId);
    field.addEventListener("input", function () {
        if (field.classList.contains("invalid")) {
            checkFn();
        }
    });
    field.addEventListener("blur", checkFn);
}

if (form) {
    checkOnTheFly("firstname", checkFirstName);
    checkOnTheFly("middleinit", checkMiddleInit);
    checkOnTheFly("lastname", checkLastName);
    checkOnTheFly("preferred_language", checkLanguage);
    checkOnTheFly("addr1", checkAddr1);
    checkOnTheFly("addr2", checkAddr2);
    checkOnTheFly("city", checkCity);
    checkOnTheFly("email", checkEmail);
    checkOnTheFly("member_id", checkMemberId);
    checkOnTheFly("userid", checkUserId);
    checkOnTheFly("dob", checkDOB);
    checkOnTheFly("ssn_plain", checkSSN);
    checkOnTheFly("zip", checkZip);
    checkOnTheFly("phone1", checkPhone);

    // these fields get reformatted as they type
    document.getElementById("dob").addEventListener("input", formatDOB);
    document.getElementById("ssn_plain").addEventListener("input", formatSSN);
    document.getElementById("zip").addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "");
    });
    document.getElementById("phone1").addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 10);
    });

    // dropdowns
    document.getElementById("state").addEventListener("change", checkState);
    document.getElementById("insurance_provider").addEventListener("change", checkInsuranceProvider);

    // radio groups
    document.querySelectorAll('input[name="sex"]').forEach(function (radio) {
        radio.addEventListener("change", function () {
            checkRequiredRadio("sex");
        });
    });
    document.querySelectorAll('input[name="has_insurance"]').forEach(function (radio) {
        radio.addEventListener("change", function () {
            toggleInsurance();
            checkRequiredRadio("has_insurance");
            checkInsuranceProvider();
        });
    });
    // picking Phone call or Text makes the phone number required
    document.querySelectorAll('input[name="contact_pref"]').forEach(function (radio) {
        radio.addEventListener("change", checkPhone);
    });

    // health history checkboxes
    document.querySelectorAll('#hx input[type="checkbox"]').forEach(function (box) {
        box.addEventListener("change", checkHealthHistory);
    });

    document.getElementById("symptoms").addEventListener("input", function () {
        checkSymptoms();
        updateSymptomsCount();
    });

    document.getElementById("health_scale").addEventListener("input", function () {
        updateHealthScale();
        checkHealthScale();
    });

    // password gets checked on every keystroke so the "missing" list shrinks as they type
    document.getElementById("password_plain").addEventListener("input", function () {
        checkPassword();
        if (document.getElementById("password_confirm").value !== "") {
            checkPasswordConfirm();
        }
    });
    document.getElementById("password_confirm").addEventListener("input", checkPasswordConfirm);
    // the password can't equal the User ID, so changing the User ID re-checks the password too
    document.getElementById("userid").addEventListener("input", function () {
        if (document.getElementById("password_plain").value !== "") {
            checkPassword();
        }
    });

    document.getElementById("hipaa_ack").addEventListener("change", checkHipaa);

    /* ---------- 5. Buttons ---------- */
    document.getElementById("validate_btn").addEventListener("click", validateForm);
    document.getElementById("review_btn").addEventListener("click", reviewForm);

    // If anything changes after a good VALIDATE, hide Submit again so they have to re-validate
    form.addEventListener("input", function () {
        document.getElementById("submit_btn").hidden = true;
    });
    form.addEventListener("change", function () {
        document.getElementById("submit_btn").hidden = true;
    });

    // Run the checks one last time, then go to the thank-you page. Done in JavaScript instead of letting
    // the form submit, because a GET form would put the SSN and password in the URL.
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (validateForm() === 0) {
            window.location.href = "thankyou.html";
        }
    });

    // The reset event fires before the fields are actually cleared, so wait a tick before cleaning up
    form.addEventListener("reset", function () {
        setTimeout(function () {
            document.querySelectorAll(".error").forEach(function (span) {
                span.textContent = "";
            });
            document.querySelectorAll(".invalid").forEach(function (el) {
                el.classList.remove("invalid");
            });
            document.getElementById("health_scale_output").value = 5;
            document.getElementById("insurance_provider").disabled = false;
            document.getElementById("member_id").disabled = false;
            updateSymptomsCount();
            document.getElementById("submit_btn").hidden = true;
            document.getElementById("validate_msg").textContent = "";
            document.getElementById("review_output").textContent = "";
        }, 0);
    });
}
