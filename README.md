# ChatAI

A simple React-based chat application with support for OpenAI chat completions and HuggingFace image generation.

## Features

- **Multi-chat support:** Start, delete, and switch between multiple chat sessions.
- **Text chat:** Uses OpenAI's GPT-4o-mini for conversational AI.
- **Image generation:** Uses HuggingFace's SDXL model to generate images from prompts.
- **Chat history:** All messages (text and images) are stored per chat.
- **Responsive UI:** Sidebar can be toggled for mobile and desktop.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [json-server](https://github.com/typicode/json-server) (for local chat storage)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/mvicsa/ChatAI.git
   cd ChatAI
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```

4. **Start the local backend (json-server):**
   ```sh
   npx json-server --watch db.json --port 3000
   ```
   > Make sure you have a `db.json` file in the root directory with at least:
   > ```json
   > { "messages": [] }
   > ```

5. **Run the React app:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser:**  
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

## Usage

- **Start a new chat:** Click "+ New Chat" in the sidebar.
- **Delete a chat:** Click the trash icon next to a chat.
- **Send a message:** Type your prompt and press the send button.
- **Switch chat type:** Use the dropdown to select "Default" (text) or "Generate Image".
- **Sidebar toggle:** Use the sidebar toggle button on mobile or small screens.

## API Keys

- **OpenAI:** Required for text chat. Get your key from [OpenAI](https://platform.openai.com/).
- **HuggingFace:** The image generation uses a demo key. For production, use your own HuggingFace API key.

## Project Structure

```
src/
  Components/
    AIResponse.jsx
  App.jsx
  main.jsx
db.json
```

## License

MIT

---

**Note:**  
This project is for educational/demo purposes. Do not expose your API keys in public repositories or deploy without