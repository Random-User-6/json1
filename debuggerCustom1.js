(function () {
    console.log("Monitoring for 'Q:' updates...");

    function updateQueryModules() {
        document.querySelectorAll("li.state_list_item").forEach(li => {  // ✅ Restrict to .state_list_item
            if (li.textContent.includes("Q:") && !li.querySelector(".queryModule")) {
                console.log("Found 'Q:' in a .state_list_item, updating...");
                li.innerHTML = `<span class="queryModule">${li.innerHTML}</span>`;
            }
        });
    }

    // MutationObserver to detect changes in the document
    const observer = new MutationObserver(() => {
        console.log("Page content changed. Checking for new 'Q:' elements...");
        updateQueryModules(); // Scan and update dynamically
    });

    // Start observing the entire page for new changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial check in case elements are already present
    updateQueryModules();
})();


document.addEventListener("mousedown", function () {
    // Select all list items
    const listItems = document.querySelectorAll("li");

    listItems.forEach(li => {
        // Check if this <li> contains "response data:" or "request data:"
        //if (li.textContent.includes("\"{\"")) { //checks for the opening curly brace in debugger output for KV lists/JSON data
        if (li.textContent.match(/response data:|request headers:|request data:|parsing result:/) || li.textContent.includes("\"{\"")) { //checks for the interesting keys

            // Find the span element that contains the raw JSON
            const span = li.querySelector("span");

            if (span) {
                try {
                    // Extract and clean up the JSON string from the span's text
                    let rawData = span.textContent.trim();

                    // Remove extra quotes around the JSON if they exist
                    if (rawData.startsWith('"') && rawData.endsWith('"')) {
                        rawData = rawData.slice(1, -1);
                    }

                    // Parse the JSON
                    const parsedData = JSON.parse(rawData);

                    // Function to format JSON with dark blue keys and normal values
                    const formatJSON = (obj) => {
                        if (typeof obj !== 'object' || obj === null) {
                            return obj; // If it's not an object, just return the value
                        }

                        // Recursively process the object
                        const formattedObj = {};
                        for (const [key, value] of Object.entries(obj)) {
                            if (typeof value === 'object' && value !== null) {
                                formattedObj[key] = formatJSON(value); // Recursively handle nested objects
                            } else {
                                formattedObj[key] = value; // Directly set value for non-objects
                            }
                        }

                        return formattedObj;
                    };

                    // Function to convert formatted JSON to HTML with key coloring
                    const convertToHTML = (obj) => {
                        let htmlString = '{<br>';
                        for (const [key, value] of Object.entries(obj)) {
                            // Wrap the key with <span> to color it dark blue
                            htmlString += `  <span style="color: red;">"${key}"</span>: `;

                            // Check if value is an object or an array, format it accordingly
                            if (typeof value === 'object' && value !== null) {
                                // Recursively format nested objects
                                htmlString += convertToHTML(value);
                            } else {
                                // Simple value (string, number, etc.)
                                htmlString += `"${value}"`;
                            }

                            htmlString += ',<br>';
                        }
                        htmlString = htmlString.slice(0, -5);  // Remove the last comma and line break
                        htmlString += '<br>}';

                        return htmlString;
                    };

                    // Format the JSON
                    const formattedData = formatJSON(parsedData);

                    // Replace the raw JSON with the formatted JSON in HTML format
                    span.innerHTML = convertToHTML(formattedData);

                    // Apply styling for better readability
                    span.style.display = "block";
                    span.style.backgroundColor = "#1a2e9b";
                    span.style.padding = "10px";
                    span.style.borderRadius = "5px";
                    span.style.whiteSpace = "pre-wrap"; // Ensures proper wrapping
                    span.style.fontFamily = "monospace"; // Makes JSON more readable
            
                } catch (error) {
                    console.error("Error parsing data:", error);
                }
            }
        }
    });
});

(function () {
    console.log("Monitoring for 'Global.unique_id' updates...");

    // Identify the target div containing the checkbox
    const differenceDiv = document.querySelector("#difference").parentElement;

    if (!differenceDiv) {
        console.error("Target div not found!");
        return;
    }

    // Create a span for the Unique ID if it doesn’t exist
    let uniqueIdSpan = document.getElementById("unique-id-span");

    if (!uniqueIdSpan) {
        uniqueIdSpan = document.createElement("span");
        uniqueIdSpan.id = "unique-id-span";
        uniqueIdSpan.style.color = "red";
        uniqueIdSpan.style.fontWeight = "bold";
        uniqueIdSpan.style.marginLeft = "auto"; // Pushes it to the right
        uniqueIdSpan.style.float = "right"; // Right-justify
        uniqueIdSpan.textContent = "Waiting for Global Unique ID...";
        differenceDiv.appendChild(uniqueIdSpan);
        console.log("Added <span> for displaying Global.unique_id.");
    }

    // Find the save button to place the text below it
    const saveButton = document.getElementById("save_btn");

    if (saveButton) {
        // Create a small "Edited by J. Young" label if it doesn’t exist
        let editedBy = document.getElementById("edited-by-label");

        if (!editedBy) {
            editedBy = document.createElement("p");
            editedBy.id = "edited-by-label";
            editedBy.textContent = "Edited by J. Young";
            editedBy.style.fontSize = "12px";
            editedBy.style.fontStyle = "italic";
            editedBy.style.color = "#555";
            editedBy.style.marginTop = "5px";
            editedBy.style.marginLeft = "0"; // Left-align under Save button
            editedBy.style.textAlign = "left"; // Ensures left justification

            // Insert it directly after the save button
            saveButton.insertAdjacentElement("afterend", editedBy);
            console.log("Added 'Edited by J. Young' label below Save button.");
        }
    } else {
        console.warn("Save button not found!");
    }

    // Function to find and update Global.unique_id dynamically
    function updateUniqueId() {
        const listItems = document.querySelectorAll("li");

        listItems.forEach(li => {
            // Ensure "Global.unique_id:" is **at the start** of the <li> text
            if (li.firstChild && li.firstChild.nodeType === Node.TEXT_NODE && li.firstChild.nodeValue.trim() === "Global.unique_id:") {
                console.log("Found 'Global.unique_id:' in an <li>.");

                // Find the <span> inside the <li>
                const span = li.querySelector("span.json-string");
                if (span) {
                    const uniqueId = span.textContent.trim().replace(/"/g, ""); // Remove extra quotes
                    console.log("Extracted Unique ID:", uniqueId);

                    // Only update <span> if the value changed
                    if (uniqueIdSpan.textContent !== `Global Unique ID: ${uniqueId}`) {
                        uniqueIdSpan.textContent = `Global Unique ID: ${uniqueId}`;
                        console.log("Updated span with:", uniqueId);
                    }
                }
            }
        });
    }

    // MutationObserver to detect when the main content reloads
    const observer = new MutationObserver(() => {
        console.log("Main content changed. Checking for new data...");
        updateUniqueId(); // Scan for new unique_id immediately
    });

    // Start observing the entire page for new changes
    observer.observe(document.body, { childList: true, subtree: true });
    console.log("Started observing for dynamic content updates.");

    // Initial check in case the data is already loaded
    updateUniqueId();
})();


