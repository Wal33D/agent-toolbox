import type { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (request: VercelRequest, response: VercelResponse) => {
	try {
		const pageTitle = 'AI Toolbelt Serverless Collection';

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
					ul {
						list-style: none;
						padding: 0;
					}
					ul li {
						margin: 5px 0;
					}
					ul li::before {
						content: "";
						display: inline-block;
						width: 1.2em;
						margin-left: -1.2em;
					}
					ul li span {
						font-size: 1.5em;
						margin-right: 10px;
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
								<p>Welcome to the AI Toolbelt Serverless Collection of single-purpose functions for use with my personal AI.</p>
								<div class="footer">
									<p>🤖 This server provides a collection of serverless functions, including:</p>
									<ul>
										<li><span>🌦️</span>Get Weekly Weather Forecast</li>
										<li><span>🌐</span>IP Address Lookup</li>
										<li><span>🔍</span>Google Image Search</li>
										<li><span>📷</span>Upload Image to Cloudinary</li>
										<li><span>🗺️</span>Google Address Resolver</li>
										<li><span>📞</span>Parse and Validate Phone Numbers</li>
										<li><span>📸</span>Take Website Screenshot</li>
									</ul>
									<p>🔐 Requests require JWT token verification and are intended for personal use by Wal33D.</p>
									<p>To use these tools, send a POST request to <code>tool.aquataze.com/belt</code> with the <code>functionName</code> set to the name of the tool you want to use.</p>
								</div>
								<p class="link">
									<i class="fa fa-github github-icon"></i> Check out the code on GitHub:
									<br>
									<a href="https://github.com/Wal33D/sms-ai.git" target="_blank">https://github.com/Wal33D/sms-ai.git</a>
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
	} catch (error: any) {
		response.status(500).json({
			status: false,
			message: `Error: ${error.message}`,
		});
	}
};

export default handler;
