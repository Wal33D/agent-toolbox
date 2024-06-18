import { tools } from '../functions/handleToolOptions';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (request: VercelRequest, response: VercelResponse) => {
	try {
		const pageTitle = 'AI Serverless Toolbelt';

		// Create HTML content
		const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${pageTitle}</title>
                <link rel="icon" href="https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico" type="image/x-icon">
                <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');
                    
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #121212;
                        color: #e0e0e0;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }
                    .custom-container {
                        text-align: center;
                        background: #1e1e1e;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
                        margin: 10px;
                        width: 100%;
                        max-width: 600px;
                    }
                    h1 {
                        color: #bb86fc;
                        font-size: 1.5em;
                    }
                    p {
                        color: #b0bec5;
                        font-size: 1em;
                    }
                    .online-indicator {
                        position: absolute;
                        top: 20px;
                        right: 35px;
                        width: 10px;
                        height: 10px;
                        background-color: #00e676;
                        border-radius: 50%;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 0.9em;
                    }
                    .code {
                        background: #333;
                        padding: 2px 5px;
                        border-radius: 3px;
                        color: #76ff03;
                    }
                    .link {
                        margin-top: 20px;
                        font-size: 0.9em;
                        color: #b0bec5;
                    }
                    .github-icon {
                        margin-right: 5px;
                        color: #76ff03;
                    }
                    .link a {
                        color: #76ff03;
                        text-decoration: none;
                    }
                    .link a:hover {
                        text-decoration: underline;
                    }
                    .search-bar {
                        width: 100%;
                        padding: 10px;
                        margin-bottom: 20px;
                        border-radius: 5px;
                        border: 1px solid #333;
                        background-color: #333;
                        color: #fff;
                        font-size: 1em;
                    }
                    .tools-container {
                        border: 1px solid #333;
                        border-radius: 5px;
                        height: 300px;
                        overflow-y: auto;
                        margin-top: 10px;
                        padding: 10px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: flex-start;
                    }
                    .tool-item {
                        width: 100%;
                        margin: 10px 0;
                        padding: 10px;
                        border-radius: 5px;
                        background-color: #333;
                        color: #fff;
                        display: block;
                        cursor: pointer;
                        font-size: 1em;
                    }
                    .no-tools {
                        text-align: center;
                        width: 100%;
                    }
                    .modal {
                        display: none;
                        position: fixed;
                        z-index: 1;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        overflow: auto;
                        background-color: rgb(0,0,0);
                        background-color: rgba(0,0,0,0.4);
                        padding-top: 60px;
                    }
                    .modal-content {
                        background-color: #1e1e1e;
                        margin: 5% auto;
                        padding: 20px;
                        border: 1px solid #888;
                        width: 90%;
                        max-width: 600px;
                        border-radius: 10px;
                        color: #e0e0e0;
                    }
                    .close {
                        color: #aaa;
                        float: right;
                        font-size: 28px;
                        font-weight: bold;
                    }
                    .close:hover,
                    .close:focus {
                        color: #fff;
                        text-decoration: none;
                        cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="row">
                        <div class="col-12 col-md-8 mx-auto">
                            <div class="custom-container">
                                <span class="online-indicator"></span>
                                <h1>${pageTitle}</h1>
                                <p>Welcome to the AI Toolbelt Serverless Collection of single-purpose functions for use with my personal AI.</p>
                                <input type="text" id="searchBar" class="search-bar" placeholder="Search tools...">
                                <div id="toolsContainer" class="tools-container"></div>
                                <div class="footer">
                                    <p>🔐 Requests require JWT token verification and are intended for personal use by Wal33D.</p>
                                    <p>To use these tools, send a POST request to <code>tool.aquataze.com/belt</code> with the <code>functionName</code> set to the name of the tool you want to use.</p>
                                </div>
                                <p class="link">
                                    <i class="fa fa-github github-icon"></i> Check out the code on GitHub:
                                    <br>
                                    <a href="https://github.com/Wal33D/toolbelt.git" target="_blank">https://github.com/Wal33D/toolbelt.git</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- The Modal -->
                <div id="myModal" class="modal">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <h2 id="modalTitle"></h2>
                        <p id="modalDescription"></p>
                        <h4>Parameters:</h4>
                        <ul id="modalParameters"></ul>
                    </div>
                </div>

                <script>
                    const tools = ${JSON.stringify(tools)};

                    const renderTools = (toolsToRender) => {
                        const toolsContainer = document.getElementById('toolsContainer');
                        toolsContainer.innerHTML = '';

                        toolsToRender.forEach(tool => {
                            const toolItem = document.createElement('div');
                            toolItem.className = 'tool-item';
                            toolItem.innerHTML = \`<span>🔧</span> <strong>\${tool.function.name}</strong><br>\${tool.function.description}\`;
                            toolItem.onclick = () => openModal(tool);
                            toolsContainer.appendChild(toolItem);
                        });

                        if (toolsToRender.length === 0) {
                            toolsContainer.innerHTML = '<p class="no-tools">No tools found</p>';
                        }
                    };

                    const openModal = (tool) => {
                        document.getElementById('modalTitle').textContent = tool.function.name;
                        document.getElementById('modalDescription').textContent = tool.function.description;

                        const parameters = tool.function.parameters.properties;
                        const modalParameters = document.getElementById('modalParameters');
                        modalParameters.innerHTML = '';

                        for (const param in parameters) {
                            const paramItem = document.createElement('li');
                            paramItem.textContent = \`\${param}: \${parameters[param].description}\`;
                            modalParameters.appendChild(paramItem);
                        }

                        const modal = document.getElementById('myModal');
                        modal.style.display = "block";
                    };

                    const closeModal = () => {
                        const modal = document.getElementById('myModal');
                        modal.style.display = "none";
                    };

                    document.querySelector('.close').onclick = closeModal;
                    window.onclick = (event) => {
                        const modal = document.getElementById('myModal');
                        if (event.target === modal) {
                            closeModal();
                        }
                    };

                    // Display all tools initially
                    renderTools(tools);

                    document.getElementById('searchBar').addEventListener('input', function() {
                        const searchValue = this.value.toLowerCase();
                        if (searchValue.length < 2) {
                            renderTools(tools);
                            return;
                        }

                        const filteredTools = tools.filter(tool => {
                            return tool.function.name.toLowerCase().includes(searchValue) || tool.function.description.toLowerCase().includes(searchValue);
                        });

                        renderTools(filteredTools);
                    });
                </script>
            </body>
            </html>
        `;

		response.setHeader('Content-Type', 'text/html');
		response.send(htmlContent);
	} catch (error: any) {
		response.status(500).json({
			status: false,
			message: `Error: ${error.message}`,
		});
	}
};

export default handler;
