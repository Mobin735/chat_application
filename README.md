
# FinChat Assistant - Developer Guide

This document provides a guide to understanding, running, and troubleshooting the FinChat Assistant application.

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Core Functionality: Chat Interaction](#core-functionality-chat-interaction)
    *   [Initial Interaction (PDF Upload + First Question)](#initial-interaction-pdf-upload--first-question)
    *   [Subsequent Interactions (Follow-up Questions)](#subsequent-interactions-follow-up-questions)
3.  [Key Components](#key-components)
4.  [API Integration (`src/lib/api.ts`)](#api-integration-srclibapits)
    *   [Base URL](#base-url)
    *   [Endpoints](#endpoints)
        *   [`POST /upload_pdf/`](#post-upload_pdf)
        *   [`POST /invoke_query/`](#post-invoke_query)
    *   [Response Cleaning](#response-cleaning)
5.  [State Management in `ChatInterface.tsx`](#state-management-in-chatinterfacetsx)
6.  [Visual Flow Diagram](#visual-flow-diagram)
7.  [Troubleshooting Common Issues](#troubleshooting-common-issues)
    *   [Connection Errors ("Sorry, I couldn't connect...")](#connection-errors-sorry-i-couldnt-connect)
    *   [API Server Errors ("The chatbot reported an error...")](#api-server-errors-the-chatbot-reported-an-error)
    *   [Unreadable API Response](#unreadable-api-response)
    *   [Input Validation Toasts ("PDF Required", "Question Required")](#input-validation-toasts-pdf-required-question-required)
    *   [Session Initialization Error](#session-initialization-error)
    *   [UI Errors (e.g., `cn` is not defined)](#ui-errors-eg-cn-is-not-defined)
8.  [Development Setup](#development-setup)
9.  [Tech Stack](#tech-stack)

## 1. Project Overview

FinChat Assistant is a Next.js web application designed to interact with a financial document. Users can upload a PDF document and ask questions related to its content. The application uses a backend API (FastAPI) to process the document and generate responses.

## 2. Core Functionality: Chat Interaction

The chat interface is the primary way users interact with the application. The flow is divided into two main parts:

### Initial Interaction (PDF Upload + First Question)

1.  **User Action**: The user selects a PDF file using the "Attach document" button and types their first question into the input field.
2.  **Client-Side Validation**:
    *   A PDF file must be selected.
    *   A question must be typed.
    *   If either is missing, a toast notification will appear.
3.  **API Call**: Upon clicking "Send", the `ChatInterface` component calls the `uploadPdfAndInitialQuery` function from `src/lib/api.ts`.
    *   This function sends the PDF file, the user's first question, and a unique `sessionId` (generated on component load) to the `/upload_pdf/` backend endpoint.
4.  **Backend Processing**: The backend processes the PDF, ingests its content, and uses the first question to generate an initial response, associating all data with the provided `sessionId`.
5.  **Response Handling**: The client receives the response, and the bot's answer is displayed in the chat. The `isPdfUploaded` state is set to `true`, and the "Attach document" button is disabled.

### Subsequent Interactions (Follow-up Questions)

1.  **User Action**: The user types a follow-up question into the input field. The PDF upload button is now disabled.
2.  **API Call**: Upon clicking "Send", the `ChatInterface` component calls the `continueConversation` function from `src/lib/api.ts`.
    *   This function sends the user's question and the *same* `sessionId` (used in the initial interaction) to the `/invoke_query/` backend endpoint.
3.  **Backend Processing**: The backend uses the `sessionId` to retrieve the context of the ongoing conversation (including the previously uploaded document's content) and generates a response to the new question.
4.  **Response Handling**: The client receives the response, and the bot's answer is displayed in the chat.

## 3. Key Components

*   **`src/app/(main)/chatbot/page.tsx`**: The main page component that renders the chat interface.
*   **`src/components/chatbot/ChatInterface.tsx`**:
    *   Manages the overall chat state (messages, input values, loading states, `sessionId`, `isPdfUploaded`).
    *   Handles form submissions and orchestrates API calls based on whether it's an initial or subsequent message.
    *   Renders the message list, input field, and document upload button.
*   **`src/components/chatbot/DocumentUpload.tsx`**:
    *   Provides the UI for selecting a PDF file.
    *   Validates file type (PDF only) and size.
    *   Passes the selected file back to `ChatInterface`.
    *   Can be disabled (e.g., after the initial PDF upload).
*   **`src/components/chatbot/MessageBubble.tsx`**:
    *   Renders individual chat messages (from user or bot).
    *   Displays document information if attached to a message.
    *   Formats timestamps.

## 4. API Integration (`src/lib/api.ts`)

This file contains the functions responsible for communicating with the backend API.

### Base URL

*   `API_BASE_URL = 'https://fastapi-render-a7a4.onrender.com'`

### Endpoints

#### `POST /upload_pdf/`

*   **Purpose**: Handles the initial PDF upload and the user's first question.
*   **Function**: `uploadPdfAndInitialQuery(file: File, firstQuestion: string, sessionId: string)`
*   **Request**: `FormData` containing:
    *   `file`: The PDF file itself.
    *   `session_id`: A unique string identifying the chat session.
    *   `user_input`: The user's first question.
*   **Response (Success - 2xx)**: JSON object
    ```json
    {
      "answer": "Bot's response to the first question...",
      "context": ["context string 1", "..."], // Optional
      "history": [{"type": "HumanMessage", "content": "..."}, {"type": "AIMessage", "content": "..."}] // Optional
    }
    ```
*   **Response (Error - 4xx/5xx)**: The function attempts to parse the error and return a user-friendly message.

#### `POST /invoke_query/`

*   **Purpose**: Handles follow-up questions in an existing chat session.
*   **Function**: `continueConversation(question: string, sessionId: string)`
*   **Request**: `FormData` containing:
    *   `session_id`: The unique string identifying the ongoing chat session.
    *   `user_input`: The user's follow-up question.
*   **Response (Success - 2xx)**: JSON object (same structure as `/upload_pdf/`)
    ```json
    {
      "answer": "Bot's response to the follow-up question...",
      "context": ["context string 1", "..."], // Optional
      "history": [{"type": "HumanMessage", "content": "..."}, {"type": "AIMessage", "content": "..."}] // Optional
    }
    ```
*   **Response (Error - 4xx/5xx)**: The function attempts to parse the error and return a user-friendly message.

### Response Cleaning

*   A helper function `cleanApiResponse(text: string)` is used to remove `<think>...</think>` blocks from the `answer` field of the API response before displaying it to the user.

## 5. State Management in `ChatInterface.tsx`

The `ChatInterface` component uses `useState` hooks to manage its state:

*   **`messages: ChatMessage[]`**: An array storing all chat messages (user and bot).
*   **`inputValue: string`**: The current text in the message input field.
*   **`selectedFile: File | null`**: The file selected by the user for the initial upload. Cleared after successful upload.
*   **`isLoading: boolean`**: True when an API call is in progress, used to show loading indicators and disable inputs.
*   **`sessionId: string | null`**: A unique ID generated when the component mounts. It's sent with every API request to maintain conversation context on the backend.
*   **`isPdfUploaded: boolean`**: Tracks if the initial PDF has been successfully uploaded. Controls whether to call `uploadPdfAndInitialQuery` or `continueConversation`, and disables the document upload button.

## 6. Visual Flow Diagram

This diagram illustrates the primary interaction flows:

```
User Action                         Component(s)          API Function (api.ts)        Backend Endpoint                Backend Process              Component Update
--------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. Selects PDF,                     ChatInterface  ---->  uploadPdfAndInitialQuery()  ---> POST /upload_pdf/    ---> Process PDF, Store         ---> Display User Msg
   Types 1st Question,             & DocumentUpload     (File, 1st_Question,          (file, user_input,         Context, Gen. Response         & Bot Response.
   Clicks Send                                           SessionID)                     session_id)                                               Set isPdfUploaded=true,
                                                                                                                                                Disable PDF Upload.

2. Types Follow-up Question,        ChatInterface  ---->  continueConversation()      ---> POST /invoke_query/   ---> Retrieve Context by        ---> Display User Msg
   Clicks Send                                           (Question, SessionID)          (user_input, session_id)   SessionID, Gen. Response       & Bot Response.
```

## 7. Troubleshooting Common Issues

When encountering bugs, always check the **Browser Developer Console** (usually accessed by right-clicking on the page -> Inspect -> Console and Network tabs) for detailed error messages.

### Connection Errors ("Sorry, I couldn't connect...")

These errors typically appear as:
*   "Sorry, I couldn't connect to the document processor. Please check your browser's developer console (Network and Console tabs) for CORS or network errors, and ensure your internet connection is stable."
*   "Sorry, I couldn't connect to the chatbot. Please check your browser's developer console (Network and Console tabs) for CORS or network errors, and ensure your internet connection is stable."

**Possible Causes & Solutions:**

1.  **CORS (Cross-Origin Resource Sharing) Issues**:
    *   **Explanation**: The most common cause. Your backend API (`https://fastapi-render-a7a4.onrender.com`) must explicitly allow requests from the origin where your Next.js app is served (e.g., `http://localhost:9002` during development, or your deployed frontend URL).
    *   **How to Check**: Look for errors in the browser's Console tab like:
        *   `Access to fetch at 'https://...' from origin 'http://localhost:9002' has been blocked by CORS policy...`
        *   `No 'Access-Control-Allow-Origin' header is present on the requested resource.`
    *   **Solution (Backend)**: Configure CORS on your FastAPI server. Example:
        ```python
        # In your FastAPI main.py or equivalent
        from fastapi.middleware.cors import CORSMiddleware

        app = FastAPI() # Your app instance

        origins = [
            "http://localhost:9002", # For local development
            "https://your-deployed-frontend.com", # If deployed
        ]

        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"], # Or specify ["GET", "POST"]
            allow_headers=["*"],
        )
        ```
        Restart your FastAPI server after applying these changes.

2.  **Network Connectivity**:
    *   Ensure your device has a stable internet connection.
    *   Try accessing the API base URL (`https://fastapi-render-a7a4.onrender.com`) directly in your browser. If it's down or unreachable, the app won't be able to connect.

3.  **API Server Down or Unresponsive**:
    *   Verify that your FastAPI application at `https://fastapi-render-a7a4.onrender.com` is running and responding to requests. Check its logs if possible.

4.  **Incorrect API URL**:
    *   Double-check `API_BASE_URL` in `src/lib/api.ts`. It should be `https://fastapi-render-a7a4.onrender.com`.

### API Server Errors ("The chatbot reported an error...")

This message appears when the API server responds with an HTTP error status (e.g., 4xx client error, 5xx server error).
*   Example: "The chatbot reported an error: 500 Internal Server Error (Detail: ...)."
*   **How to Check**:
    *   The error message in the chat might include details from the API response.
    *   Check the Network tab in your browser's developer tools for the specific request; examine its status code and response body.
    *   Check the logs of your FastAPI server for more detailed error information.
*   **Solution**: The issue lies on the backend. Debug the FastAPI application based on the error messages and logs.

### Unreadable API Response

*   Message: "Sorry, I received an unreadable response from the document processor/chatbot. Please try again."
*   **Cause**: The API responded, but its response was not valid JSON, or the expected `answer` field was missing or not a string.
*   **How to Check**:
    *   Use the Network tab in browser dev tools to inspect the raw response from the API.
    *   Ensure your FastAPI endpoints are correctly returning JSON with an `answer` string.
*   **Solution**: Fix the response format in your FastAPI backend.

### Input Validation Toasts ("PDF Required", "Question Required")

*   These are client-side validation messages from `ChatInterface.tsx`.
*   **Cause**: User tried to send the first message without attaching a PDF or without typing a question.
*   **Solution**: Ensure the user provides both a PDF and a question for the initial interaction.

### Session Initialization Error

*   Message: "Session not initialized. Please refresh."
*   **Cause**: The `sessionId` (generated using `crypto.randomUUID()`) failed to initialize in `ChatInterface.tsx`. This is rare.
*   **Solution**: Refreshing the page usually resolves this.

### UI Errors (e.g., `cn` is not defined)

*   **Cause**: A JavaScript error occurred during rendering, often due to a missing import or incorrect component usage. For example, `cn` is a utility function for class names.
*   **How to Check**: The browser console will show a JavaScript error, often pointing to the component and line number.
*   **Solution**: Identify the missing import or incorrect code in the specified component file and fix it. For `cn`, ensure `import { cn } from "@/lib/utils";` is present.

## 8. Development Setup

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will typically be available at `http://localhost:9002`.

4.  Ensure your FastAPI backend is running and accessible at `https://fastapi-render-a7a4.onrender.com`.

## 9. Tech Stack

*   **Frontend**:
    *   Next.js (React Framework)
    *   React
    *   TypeScript
    *   ShadCN UI (UI Components)
    *   Tailwind CSS (Styling)
*   **Backend (External)**:
    *   FastAPI (Python Web Framework) - Expected at `https://fastapi-render-a7a4.onrender.com`
*   **AI/Genkit**: (Currently, the primary AI logic is handled by the external FastAPI backend. Genkit setup is present but not directly used for the core chat PDF Q&A in this version).
```