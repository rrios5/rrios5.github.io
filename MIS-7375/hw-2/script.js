/*
Program name: Patient Registration Protocol Scripts
Author: Rogelio Rios
Date created: 09/27/2026
Date last edited: 10/17/2026
Version: 2.0
Description: Shows the web client's day, date, and time in the banner. Homework 2 adds the checks HTML
can't do on its own (date range, password rules and match, no double quotes in the textarea), the slider
readout, the ZIP and user ID clean-up, and the REVIEW table.
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

/* ---------- Helpers ---------- */
// Puts the message in the span under the field AND tells the browser the field is invalid,
// so Submit is blocked by these JavaScript checks the same way it's blocked by a bad pattern
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.setCustomValidity(message);
    field.classList.add("invalid");
    document.getElementById(fieldId + "_error").textContent = message;
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    field.setCustomValidity("");
    field.classList.remove("invalid");
    document.getElementById(fieldId + "_error").textContent = "";
}

// Returns the value of the checked radio button in a group, or "" if none is checked
function getRadioValue(groupName) {
    const checked = document.querySelector('input[name="' + groupName + '"]:checked');
    return checked ? checked.value : "";
}

// Turns a Date into YYYY-MM-DD, the format a date input's value, min, and max use
function toIsoDate(d) {
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + month + "-" + day;
}

/* ---------- Date of birth ---------- */
// Recalculates the allowed range from today's date (the same clock the banner shows):
// max = today, min = 120 years ago today
function setDobRange() {
    const today = new Date();
    const oldest = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    const dob = document.getElementById("dob");
    dob.max = toIsoDate(today);
    dob.min = toIsoDate(oldest);
}

function checkDob() {
    const dob = document.getElementById("dob");

    // badInput = the patient started typing a date but didn't finish it
    if (dob.validity.badInput) {
        showError("dob", "Enter a full date as MM/DD/YYYY.");
        return false;
    }
    // Empty is left to the required attribute
    if (dob.value === "") {
        clearError("dob");
        return true;
    }
    // YYYY-MM-DD strings sort the same way the dates do, so they can be compared directly
    if (dob.value > dob.max) {
        showError("dob", "Date of birth cannot be in the future.");
        return false;
    }
    if (dob.value < dob.min) {
        showError("dob", "Date of birth cannot be more than 120 years ago.");
        return false;
    }

    clearError("dob");
    return true;
}

/* ---------- ZIP and user ID clean-up ---------- */
// A valid ZIP+4 (77002-1234) is cut down to the first 5 digits and put back in the field
function fixZip() {
    const zip = document.getElementById("zip");
    if (/^\d{5}-\d{4}$/.test(zip.value)) {
        zip.value = zip.value.slice(0, 5);
        document.getElementById("zip_error").textContent = "ZIP+4 shortened to " + zip.value + ".";
    } else {
        document.getElementById("zip_error").textContent = "";
    }
}

// Uppercase is allowed while typing, but the user ID is saved (and shown back) in lowercase
function fixUserId() {
    const userid = document.getElementById("userid");
    const lower = userid.value.toLowerCase();
    if (userid.value !== lower) {
        userid.value = lower;
        document.getElementById("userid_error").textContent = "Changed to lowercase: " + lower;
    } else {
        document.getElementById("userid_error").textContent = "";
    }
}

/* ---------- Symptoms ---------- */
// pattern doesn't work on a textarea, so the "no double quotes" rule is checked here
function checkSymptoms() {
    if (document.getElementById("symptoms").value.includes('"')) {
        showError("symptoms", 'Please don\'t use double quotes (").');
        return false;
    }
    clearError("symptoms");
    return true;
}

/* ---------- Health scale slider ---------- */
function formatHealthScale(value) {
    let word = "Good";
    if (value <= 3) {
        word = "Poor";
    } else if (value <= 6) {
        word = "Okay";
    }
    return value + " / 10 — " + word;
}

// Runs on every move of the slider so the rating next to it updates live
function updateHealthScale() {
    const value = Number(document.getElementById("health_scale").value);
    document.getElementById("health_scale_output").value = formatHealthScale(value);
}

/* ---------- Passwords ---------- */
// Lists everything the password is still missing, so the message shrinks as the patient types
function checkPassword() {
    const password = document.getElementById("password_plain").value;

    // Empty is left to the required attribute
    if (password === "") {
        clearError("password_plain");
        return true;
    }

    const missing = [];
    if (password.length < 8) missing.push("at least 8 characters");
    if (!/[A-Z]/.test(password)) missing.push("an uppercase letter");
    if (!/[a-z]/.test(password)) missing.push("a lowercase letter");
    if (!/\d/.test(password)) missing.push("a number");
    if (!/[^A-Za-z0-9]/.test(password)) missing.push("a special character");

    if (password.includes('"')) {
        showError("password_plain", 'Double quotes (") are not allowed.');
        return false;
    }
    if (missing.length > 0) {
        showError("password_plain", "Still needs: " + missing.join(", ") + ".");
        return false;
    }

    // The password can't be or contain the user ID, first name, or last name (ignoring case).
    // Parts shorter than 3 letters are skipped so a name like "Al" doesn't block most passwords.
    const lowerPassword = password.toLowerCase();
    const parts = [
        ["user ID", document.getElementById("userid").value],
        ["first name", document.getElementById("firstname").value],
        ["last name", document.getElementById("lastname").value],
    ];
    for (const part of parts) {
        const text = part[1].toLowerCase();
        if (text.length >= 3 && lowerPassword.includes(text)) {
            showError("password_plain", "Password can't contain your " + part[0] + ".");
            return false;
        }
    }

    clearError("password_plain");
    return true;
}

function checkPasswordConfirm() {
    const password = document.getElementById("password_plain").value;
    const confirm = document.getElementById("password_confirm").value;

    if (confirm !== "" && confirm !== password) {
        showError("password_confirm", "Passwords do not match.");
        return false;
    }
    clearError("password_confirm");
    return true;
}

// Runs every JavaScript check, so the custom errors are up to date before Review or Submit
function runAllChecks() {
    fixZip();
    fixUserId();
    checkDob();
    checkSymptoms();
    checkPassword();
    checkPasswordConfirm();
}

/* ---------- REVIEW button ---------- */
// The message for one field: "Required" if it's empty, the title hint if it doesn't match its pattern
// (minus its leading "Required." or "Optional."), otherwise whatever the browser or our JavaScript check says
function errorFor(el) {
    if (el.validity.valueMissing) return "Required";
    if (el.validity.customError) return el.validationMessage;
    if (el.validity.patternMismatch) return el.title.replace(/^(Required|Optional)\. /, "");
    return el.validationMessage;
}

// Checks one or more fields and returns "pass" or "ERROR: ...". When a row covers more than one field
// (like the name), the field's label is added so the patient knows which one to fix.
function statusOf(elements) {
    for (const el of elements) {
        if (!el.checkValidity()) {
            let prefix = "";
            if (elements.length > 1 && el.labels.length > 0) {
                prefix = el.labels[0].textContent.replace("*", "").trim() + ": ";
            }
            return "ERROR: " + prefix + errorFor(el);
        }
    }
    return "pass";
}

function reviewForm() {
    runAllChecks();

    function byId(id) {
        return document.getElementById(id);
    }
    // For radio groups, checking any one button checks the whole group
    function radio(name) {
        return document.querySelector('input[name="' + name + '"]');
    }
    // Shows the label text of the checked radio button instead of its 1-letter code
    function radioText(name) {
        const checked = document.querySelector('input[name="' + name + '"]:checked');
        return checked ? checked.parentElement.textContent.trim() : "";
    }
    function yesNo(id) {
        return byId(id).checked ? "Y" : "N";
    }
    // SSN and passwords are never shown, only whether something was typed
    function hidden(id) {
        return byId(id).value === "" ? "" : "●●●●●●●● (hidden)";
    }

    // Date inputs hold YYYY-MM-DD, so flip it to MM/DD/YYYY for display
    let dobText = "";
    if (byId("dob").value !== "") {
        const parts = byId("dob").value.split("-");
        dobText = parts[1] + "/" + parts[2] + "/" + parts[0];
    }

    const name = [byId("firstname").value, byId("middleinit").value, byId("lastname").value]
        .filter(Boolean).join(" ");
    const address = [
        byId("addr1").value,
        byId("addr2").value,
        byId("city").value + ", " + byId("state").value + " " + byId("zip").value,
    ].filter(Boolean).join("\n");

    // Each row: [label, value, status]. A row with just a label is a section heading.
    // Status is null for optional choices that have nothing to check.
    const rows = [
        ["Your Information"],
        ["First, MI, Last Name", name, statusOf([byId("firstname"), byId("middleinit"), byId("lastname")])],
        ["Date of Birth", dobText, statusOf([byId("dob")])],
        ["Social Security Number", hidden("ssn_plain"), statusOf([byId("ssn_plain")])],
        ["Preferred Language", byId("preferred_language").value, statusOf([byId("preferred_language")])],
        ["Sex", radioText("sex"), statusOf([radio("sex")])],

        ["Address & Contact"],
        ["Address", address, statusOf([byId("addr1"), byId("addr2"), byId("city"), byId("state"), byId("zip")])],
        ["Email Address", byId("email").value, statusOf([byId("email")])],
        ["Phone Number", byId("phone1").value, statusOf([byId("phone1")])],
        ["Contact Method", radioText("contact_pref"), null],

        ["Insurance"],
        ["Has Insurance", radioText("has_insurance"), statusOf([radio("has_insurance")])],
        ["Insurance Provider", byId("insurance_provider").value, null],
        ["Member ID", byId("member_id").value, statusOf([byId("member_id")])],

        ["Requested Info"],
        ["Asthma", yesNo("hx_asthma"), null],
        ["Diabetes", yesNo("hx_diabetes"), null],
        ["High Blood Pressure", yesNo("hx_hypertension"), null],
        ["Heart Disease", yesNo("hx_heart_disease"), null],
        ["High Cholesterol", yesNo("hx_high_cholesterol"), null],
        ["Thyroid Disorder", yesNo("hx_thyroid"), null],
        ["Cancer", yesNo("hx_cancer"), null],
        ["None of the Above", yesNo("hx_none"), null],
        ["Flu Vaccine Up to Date?", radioText("flu_vaccinated"), null],
        ["Tobacco Use", radioText("tobacco_use"), null],
        ["How You Feel Today", formatHealthScale(Number(byId("health_scale").value)), null],
        ["Described Symptoms", byId("symptoms").value, statusOf([byId("symptoms")])],

        ["Patient Portal Account"],
        ["User ID", byId("userid").value, statusOf([byId("userid")])],
        ["Password", hidden("password_plain"), statusOf([byId("password_plain"), byId("password_confirm")])],
        ["HIPAA Acknowledged", byId("hipaa_ack").checked ? "Y" : "N", statusOf([byId("hipaa_ack")])],
    ];

    // Built with textContent instead of innerHTML so whatever the patient typed can't turn into HTML
    const tbody = document.querySelector("#review_table tbody");
    tbody.textContent = "";
    rows.forEach(function (row) {
        const tr = tbody.insertRow();
        if (row.length === 1) {
            const th = document.createElement("th");
            th.colSpan = 3;
            th.className = "review-section";
            th.textContent = row[0];
            tr.appendChild(th);
            return;
        }
        tr.insertCell().textContent = row[0];
        const value = tr.insertCell();
        value.textContent = row[1];
        value.className = "review-value";
        const status = tr.insertCell();
        if (row[2] !== null) {
            status.textContent = row[2];
            status.className = row[2] === "pass" ? "pass" : "fail";
        }
    });

    // On a phone the table is below the form, so bring it into view
    document.getElementById("review_area").scrollIntoView({ behavior: "smooth", block: "start" });
}

// Puts the review table back to its starting message (used by Start Over)
function clearReview() {
    const tbody = document.querySelector("#review_table tbody");
    tbody.textContent = "";
    const cell = tbody.insertRow().insertCell();
    cell.colSpan = 3;
    cell.className = "review-empty";
    cell.textContent = "Click REVIEW to see your information here.";
}

/* ---------- When each check runs ---------- */
// thankyou.html loads this same file but has no form, so only hook things up if the form is on the page
const form = document.getElementById("registration-form");

if (form) {
    loadStates("state");
    setDobRange();

    document.getElementById("dob").addEventListener("change", checkDob);
    document.getElementById("dob").addEventListener("blur", checkDob);
    document.getElementById("zip").addEventListener("blur", fixZip);
    document.getElementById("userid").addEventListener("blur", fixUserId);
    document.getElementById("symptoms").addEventListener("input", checkSymptoms);
    document.getElementById("health_scale").addEventListener("input", updateHealthScale);

    // The password is re-checked on every keystroke, and again when the user ID or a name changes,
    // since those can make an OK password not OK anymore
    ["password_plain", "userid", "firstname", "lastname"].forEach(function (id) {
        document.getElementById(id).addEventListener("input", function () {
            checkPassword();
            checkPasswordConfirm();
        });
    });
    document.getElementById("password_confirm").addEventListener("input", checkPasswordConfirm);

    document.getElementById("review_button").addEventListener("click", reviewForm);

    // click fires before the browser runs its checks, so the JavaScript errors are set in time to block Submit
    document.getElementById("submit_button").addEventListener("click", runAllChecks);

    // reset fires before the fields are cleared, so wait a moment and then clear the errors and the table
    form.addEventListener("reset", function () {
        setTimeout(function () {
            ["dob", "symptoms", "password_plain", "password_confirm"].forEach(clearError);
            document.getElementById("zip_error").textContent = "";
            document.getElementById("userid_error").textContent = "";
            updateHealthScale();
            clearReview();
        }, 0);
    });
}
