 let responseData = null;

        // Formats the JSON response with indentation
        function formatResponse() {
            const rawResponse = document.getElementById('apiResponse').value.trim();
            try {
                if (rawResponse.startsWith('{') || rawResponse.startsWith('[')) {
                    const jsonResponse = JSON.parse(rawResponse);
                    document.getElementById('apiResponse').value = JSON.stringify(jsonResponse, null, 2);
                    document.getElementById('responseOutput').innerHTML = '';
                    responseData = jsonResponse;
                } else if (rawResponse.startsWith('<')) {
                    // XML response handling
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(rawResponse, "text/xml");
                    document.getElementById('apiResponse').value = formatXML(xmlDoc);
                    document.getElementById('responseOutput').innerHTML = '';
                    responseData = xmlDoc;
                }
            } catch (e) {
                alert('Invalid format!');
            }
        }

        // Pretty prints XML
        function formatXML(xmlDoc) {
            const serializer = new XMLSerializer();
            let formattedXML = serializer.serializeToString(xmlDoc);
            formattedXML = formattedXML.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
            formattedXML = formattedXML.replace(/([<>])\s*(<)/g, '$1\n$2');
            return formattedXML;
        }

        // Visualizes the JSON response as a collapsible tree
        function visualizeResponse() {
            document.getElementById('responseOutput').innerHTML = '';
            if (responseData) {
                if (typeof responseData === 'object') {
                    if (responseData.nodeName === "#document") {
                        // XML visualization
                        visualizeXML(responseData);
                    } else {
                        // JSON visualization
                        visualizeJSON(responseData);
                    }
                }
            }
        }

        // Builds JSON tree structure
        function buildJSONTree(data) {
            const root = document.createElement('div');
            root.classList.add('tree-node');
            if (typeof data === 'object' && data !== null) {
                Object.keys(data).forEach(key => {
                    const childNode = document.createElement('div');
                    childNode.classList.add('tree-node');
                    childNode.innerHTML = `<strong>${key}:</strong>`;
                    const value = data[key];
                    if (typeof value === 'object' && value !== null) {
                        const collapsibleChild = document.createElement('div');
                        collapsibleChild.classList.add('tree-node-children');
                        collapsibleChild.appendChild(buildJSONTree(value));
                        childNode.appendChild(collapsibleChild);
                        childNode.addEventListener('click', () => {
                            collapsibleChild.classList.toggle('collapsed');
                        });
                    } else {
                        childNode.innerHTML += ` ${JSON.stringify(value)}`;
                    }
                    root.appendChild(childNode);
                });
            } else {
                root.innerHTML += ` ${JSON.stringify(data)}`;
            }
            return root;
        }

        // Visualizes JSON data as a collapsible tree
        function visualizeJSON(data) {
            const treeContainer = document.createElement('div');
            treeContainer.appendChild(buildJSONTree(data));
            document.getElementById('responseOutput').appendChild(treeContainer);
        }

        // Builds XML tree structure
        function buildXMLTree(xmlNode) {
            const root = document.createElement('div');
            root.classList.add('tree-node');
            if (xmlNode.nodeType === 1) {
                // Element node
                const elementName = xmlNode.nodeName;
                const elementValue = xmlNode.textContent.trim();
                const elementNode = document.createElement('div');
                elementNode.innerHTML = `<strong>${elementName}:</strong> ${elementValue ? elementValue : ''}`;
                root.appendChild(elementNode);

                Array.from(xmlNode.childNodes).forEach(childNode => {
                    if (childNode.nodeType === 1) {
                        const childTree = buildXMLTree(childNode);
                        root.appendChild(childTree);
                    }
                });
            }
            return root;
        }

        // Visualizes XML data as a tree
        function visualizeXML(xmlDoc) {
            const treeContainer = document.createElement('div');
            Array.from(xmlDoc.documentElement.childNodes).forEach(childNode => {
                if (childNode.nodeType === 1) {
                    treeContainer.appendChild(buildXMLTree(childNode));
                }
            });
            document.getElementById('responseOutput').appendChild(treeContainer);
        }

        // Search functionality for JSON/XML
        function searchInResponse() {
            const searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
            if (!searchQuery) return;

            let found = false;

            if (Array.isArray(responseData) || typeof responseData === 'object') {
                const filteredResponse = filterTree(responseData, searchQuery);
                if (filteredResponse.length > 0) {
                    visualizeResponse();
                    found = true;
                }
            }

            if (!found) {
                document.getElementById('responseOutput').innerHTML = '<p>No results found for "' + searchQuery + '"</p>';
            }
        }

        function filterTree(data, searchQuery) {
            // This will filter matching parts of the response data
            let results = [];
            if (Array.isArray(data)) {
                data.forEach(item => {
                    results = results.concat(filterTree(item, searchQuery));
                });
            } else if (typeof data === 'object') {
                Object.keys(data).forEach(key => {
                    if (key.toLowerCase().includes(searchQuery)) {
                        results.push(data[key]);
                    }
                    if (typeof data[key] === 'object') {
                        results = results.concat(filterTree(data[key], searchQuery));
                    }
                });
            }
            return results;
        }

        // Event listeners for buttons and actions
        document.getElementById('formatBtn').addEventListener('click', formatResponse);
        document.getElementById('parseBtn').addEventListener('click', visualizeResponse);
        document.getElementById('searchInput').addEventListener('input', searchInResponse);
