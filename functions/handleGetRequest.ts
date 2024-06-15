import type { VercelRequest, VercelResponse } from '@vercel/node';

// Function to handle GET requests and generate HTML response
export const handleGetRequest = async ({ request, response }: { request: VercelRequest, response: VercelResponse }): Promise<void> => {
    const pageTitle = 'Serverless AI REST Node';

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
                }
                h1 {
                    color: #bb86fc;
                }
                p {
                    color: #b0bec5;
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
                    font-size: 1em;
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
            </style>
        </head>
        <body>
            <div class="container">
                <div class="row">
                    <div class="col-12 col-md-8 mx-auto">
                        <div class="custom-container">
                            <span class="online-indicator"></span>
                            <h1>${pageTitle}</h1>
                            <p>Welcome to our serverless AI REST node.</p>
                            <div class="footer">
                                <p>🤖 This server ties together OpenAI, Azure, Gemini, and other AIs to provide a seamless response every time.</p>
                                <p>🔐 Requests JWT token verification and is only meant for use by Wal33D.</p>
                            </div>
                            <p class="link">
                                <i class="fa fa-github github-icon"></i> Check out the code on GitHub:
                                <br>
                                <a href="https://github.com/Wal33D/serverless-vercel-function-enhanced.git" target="_blank">https://github.com/Wal33D/serverless-vercel-function-enhanced.git</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    response.setHeader('Content-Type', 'text/html');
    response.send(htmlContent);
};
