import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

const openaiApiKey = process.env.OPENAI_API_KEY;

// Example dummy function hard coded to return the same weather
// In production, this could be your backend API or an external API
function getCurrentWeather(location: string, unit = "fahrenheit") {
  if (location.toLowerCase().includes("tokyo")) {
    return JSON.stringify({ location: "Tokyo", temperature: "10", unit: "celsius" });
  } else if (location.toLowerCase().includes("san francisco")) {
    return JSON.stringify({ location: "San Francisco", temperature: "72", unit: "fahrenheit" });
  } else if (location.toLowerCase().includes("paris")) {
    return JSON.stringify({ location: "Paris", temperature: "22", unit: "celsius" });
  } else {
    return JSON.stringify({ location, temperature: "unknown" });
  }
}

export const handlePostRequest = async ({
  request,
  response,
}: {
  request: VercelRequest;
  response: VercelResponse;
}): Promise<void> => {
  let status = false;
  let message = "";
  let data = null;

  try {
    if (request.method !== "POST") {
      throw new Error("Only POST requests are supported.");
    }

    const { content } = request.body;

    if (!content) {
      throw new Error("Missing content in the request body.");
    }

    // Step 1: send the conversation and available functions to the model
    const messages = [{ role: "user", content }];
    const tools = [
      {
        type: "function",
        function: {
          name: "get_current_weather",
          description: "Get the current weather in a given location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state, e.g. San Francisco, CA",
              },
              unit: { type: "string", enum: ["celsius", "fahrenheit"] },
            },
            required: ["location"],
          },
        },
      },
    ];

    const openAiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages,
        tools,
        tool_choice: "auto",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    const responseMessage = openAiResponse.data.choices[0].message;

    // Step 2: check if the model wanted to call a function
    const toolCalls = responseMessage.tool_calls;
    if (toolCalls) {
      const availableFunctions = {
        get_current_weather: getCurrentWeather,
      }; // only one function in this example, but you can have multiple
      messages.push(responseMessage); // extend conversation with assistant's reply

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];
        const functionArgs = JSON.parse(toolCall.function.arguments);
        const functionResponse = functionToCall(
          functionArgs.location,
          functionArgs.unit
        );
        messages.push({
            //@ts-ignore
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
        }); // extend conversation with function response
      }

      // Step 3: Call the model again with the function response
      const secondResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4-turbo",
          messages,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
        }
      );

      status = true;
      data = secondResponse.data.choices;
      message = "Request processed successfully.";
    } else {
      status = true;
      message = responseMessage.content;
    }
  } catch (error: any) {
    console.error("Error handling POST request:", error.response ? error.response.data : error.message);
    message = `Error handling POST request: ${error.message}`;
  }

  response.json({
    status,
    message,
    data,
  });
};
