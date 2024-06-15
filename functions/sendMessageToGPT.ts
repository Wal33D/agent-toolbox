import axios from "axios";
import moment from "moment-timezone";

interface Message {
  role: string;
  content: string;
}

interface OpenAIResponse {
  status: boolean;
  message: string;
  data?: any;
  classification?: string;
  tool?: string;
}

interface OpenAIOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

// Helper function to get current date and time in a formatted string
const getCurrentDateTime = (): string => {
  const now = moment().tz("America/Detroit");
  return now.format("MMMM Do YYYY, h:mm:ss a");
};

// Helper function to get probable location
const getProbableLocation = (): string => {
  // For simplicity, we return one of the possible locations randomly.
  // In a real application, you could use more complex logic to determine the location.
  const locations = [
    "Deals Unlimited Inc. at 8705 Portage Rd, 49002, Portage, Michigan",
    "Home at 8440 Valleywood Lane, Portage, MI 49024",
    "Farm in PawPaw on 36 1/2st, PawPaw, MI",
  ];
  const randomIndex = Math.floor(Math.random() * locations.length);
  return locations[randomIndex];
};

// Helper function to construct a dynamic message with current information
const constructDynamicMessage = (): Message => {
  const formattedDateTime = getCurrentDateTime();
  const probableLocation = getProbableLocation();

  const content = `Current date and time: ${formattedDateTime}. Probable location: ${probableLocation}.`;

  const role = "assistant";
  return { role, content };
};

// Helper function to construct system messages
const constructSystemMessages = (): Message[] => {
  return [
    { role: "system", content: "You are a helpful assistant." },
    {
      role: "system",
      content:
        "Your name is Hussein's Assistant, a friendly and intelligent assistant created by Waleed as a gift for his Baba(Dad), Hussein.",
    },
    {
      role: "system",
      content:
        "Hussein is a Palestinian who loves fun, happy, smart, and witty people and stories.",
    },
    {
      role: "system",
      content:
        "Hussein is married to Denice, and they have been together forever.",
    },
    {
      role: "system",
      content:
        "Waleed is the creator of this AI assistant for a Father's Day gift.",
    },
    {
      role: "system",
      content:
        "Hussein has another son named Brahim, who is younger than Waleed by one year.",
    },
    {
      role: "system",
      content: "Hussein also has a beloved Husky dog named Glacia.",
    },
    {
      role: "system",
      content:
        "You are here to assist Hussein by saving his thoughts, ideas, and stories in a database for later.",
    },
    {
      role: "system",
      content:
        "You are cheerful, witty, and always ready to engage in fun and intelligent conversations.",
    },
    {
      role: "system",
      content:
        "You can recall stories and conversations to make Hussein feel connected and supported.",
    },
    constructDynamicMessage(),
  ];
};

export const sendMessageToGPT = async ({
  userContent,
  options = {},
}: {
  userContent: string;
  options?: OpenAIOptions;
}): Promise<OpenAIResponse> => {
  let status = false;
  let message = "";
  let data = null;
  // Classify the request
  const classificationResponse = await classifyRequest({
    userContent: userContent,
  });

  if (!classificationResponse.status) {
    throw new Error(classificationResponse.message);
  }

  const {
    temperature = 0.7,
    max_tokens = 4000,
    top_p = 1,
    frequency_penalty = 0,
    presence_penalty = 0,
  } = options;

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OpenAI API key is not set in the environment variables."
      );
    }

    const messages: Message[] = [
      ...constructSystemMessages(),
      { role: "user", content: userContent },
    ];

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: messages,
        temperature,
        max_tokens,
        top_p,
        frequency_penalty,
        presence_penalty,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (response.status === 200) {
      status = true;
      data = response.data;
      message = "Response received successfully.";
    } else {
      message = `Failed to receive a response: ${response.statusText}`;
    }
  } catch (error: any) {
    message = `Error: ${error.message}`;
  }

  return {
    status,
    message,
    data,
    classification: classificationResponse.classification,
    tool: classificationResponse.tool,
  };
};

interface ClassificationResponse {
  status: boolean;
  message: string;
  classification?: string;
  tool?: string;
}

// Function to classify the request and determine the appropriate tool
export const classifyRequest = async ({
  userContent,
}: {
  userContent: string;
}): Promise<ClassificationResponse> => {
  let status = false;
  let message = "";
  let classification = "";
  let tool = "";

  try {
    const apiKey = process.env.OPENAI_API_KEY;


    const messages: Message[] = [
      { role: "system", content: "You are a classifier assistant." },
      {
        role: "user",
        content: `Classify the following request and suggest the appropriate tool if any: ${userContent}`,
      },
    ];

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: messages,
        temperature: 0.7,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (response.status === 200) {
      const assistantMessage = response.data.choices[0].message.content;
      console.log("assistantMessage", assistantMessage)
      const parsedResponse = assistantMessage.match(
        /classification: (.+?), tool: (.+)/
      );

      if (parsedResponse) {
        classification = parsedResponse[1];
        tool = parsedResponse[2];
      }

      status = true;
      message = "Classification successful.";
    } else {
      message = `Failed to classify the request: ${response.statusText}`;
    }
  } catch (error: any) {
    message = `Error: ${error.message}`;
  }

  return { status, message, classification, tool };
};
