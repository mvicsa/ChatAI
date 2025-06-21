import axios from "axios";
import { useEffect, useState } from "react"
import AIResponse from "./Components/AIResponse";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

function App() {
  const api_chat_key = import.meta.env.VITE_OPENAI_API_KEY;
  const api_image_key = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [asideToggle, setAsideToggle] = useState(false);
  const [chatType, setChatType] = useState("default");
  console.log(chatType)

  useEffect(() => {
    const getMessages = async () => {
      const res = await axios.get("http://localhost:3000/messages");
      setMessages(res.data);
    };
    getMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let chatIndex = currentChat;
    let chatId = null;
    let isNewChat = false;

    if (currentChat === null || messages.length === 0) {
      const newChat = {
        id: String(Date.now()),
        details: []
      };
      const res = await axios.post("http://localhost:3000/messages", newChat);
      chatId = res.data.id || newChat.id;
      setMessages(prev => [...prev, { ...newChat, id: chatId }]);
      chatIndex = messages.length;
      setCurrentChat(chatIndex);
      isNewChat = true;
    }

    if (isNewChat) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const updatedMessages = isNewChat
      ? [...messages, { id: chatId, details: [] }]
      : messages;

    let updatedChat = {
      ...updatedMessages[chatIndex],
      details: [
        ...updatedMessages[chatIndex].details,
        {
          role: "user",
          content: inputValue,
          type: chatType === "image" ? "default" : chatType,
        }
      ]
    };

    setMessages(prevMessages =>
      prevMessages.map((chat, idx) => idx === chatIndex ? updatedChat : chat)
    );

    if (chatType === "default") {
      let loadingMessage = {
        role: "assistant",
        content: "Loading...",
        type: "default",
        loading: true
      };
      let loadingChat = {
        ...updatedChat,
        details: [
          ...updatedChat.details,
          loadingMessage
        ]
      };
      setMessages(prevMessages =>
        prevMessages.map((chat, idx) => idx === chatIndex ? loadingChat : chat)
      );

      // Text chat logic
      const res = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4o-mini",
        messages: [...updatedChat.details],
        // max_completion_tokens: 50,
        temperature: 0.9,
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${api_chat_key}`
        }
      });

      const newMessage = {
        role: "assistant",
        content: res.data.choices[0].message.content,
        type: "default"
      };

      let finalChat = {
        ...updatedChat,
        details: [
          ...updatedChat.details,
          newMessage
        ]
      };
      setMessages(prevMessages =>
        prevMessages.map((chat, idx) => idx === chatIndex ? finalChat : chat)
      );

      await axios.put(
        `http://localhost:3000/messages/${updatedChat.id}`,
        finalChat
      );
    } else if (chatType === "image") {
      let loadingMessage = {
        role: "assistant",
        content: "Generating image...",
        type: "default",
        loading: true
      };
      let loadingChat = {
        ...updatedChat,
        details: [
          ...updatedChat.details,
          loadingMessage
        ]
      };
      setMessages(prevMessages =>
        prevMessages.map((chat, idx) => idx === chatIndex ? loadingChat : chat)
      );

      try {
        const response = await fetch("https://router.huggingface.co/nebius/v1/images/generations", {
          headers: {
            Authorization: `Bearer ${api_image_key}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            response_format: "b64_json",
            prompt: inputValue,
            model: "stability-ai/sdxl",
          }),
        });

        const result = await response.json();

        if (result && result.data && result.data[0]?.b64_json) {
          const imageUrl = `data:image/png;base64,${result.data[0].b64_json}`;

          const imageMessage = {
            role: "assistant",
            content: imageUrl,
            type: "image"
          };

          let finalChat = {
            ...updatedChat,
            details: [
              ...updatedChat.details,
              imageMessage
            ]
          };

          setMessages(prevMessages =>
            prevMessages.map((chat, idx) => idx === chatIndex ? finalChat : chat)
          );

          await axios.put(
            `http://localhost:3000/messages/${updatedChat.id}`,
            finalChat
          );
        } else {
          const errorMessage = {
            role: "assistant",
            content: "Error: No image data returned.",
            type: "default"
          };
          let finalChat = {
            ...updatedChat,
            details: [
              ...updatedChat.details,
              errorMessage
            ]
          };
          setMessages(prevMessages =>
            prevMessages.map((chat, idx) => idx === chatIndex ? finalChat : chat)
          );
        }
      } catch (error) {
        console.log(error);
        const errorMessage = {
          role: "assistant",
          content: "Error generating image. Please try again.",
          type: "default"
        };
        let finalChat = {
          ...updatedChat,
          details: [
            ...updatedChat.details,
            errorMessage
          ]
        };
        setMessages(prevMessages =>
          prevMessages.map((chat, idx) => idx === chatIndex ? finalChat : chat)
        );
      }
    }

    setInputValue("");
  };

  const handleNewChat = async () => {
    const newChat = {
      id: String(Date.now()),
      details: []
    };

    await axios.post("http://localhost:3000/messages", newChat);
    setMessages(prev => [...prev, newChat]);
    setCurrentChat(messages.length);
  };

  return (
    <div className="flex min-h-dvh bg-neutral-900 text-md">
      <aside className={`flex flex-col w-[300px] border-e-1 bg-neutral-900 border-neutral-800 p-4 fixed h-dvh z-10 ${asideToggle ? "left-0 md:-left-[300px]" : "-left-[300px] md:left-0"} transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white mb-4">
            Chat GPT
          </h1>
          <button className="absolute -right-[30px] top-4 z-10 flex items-center justify-center bg-neutral-900 text-white shadow hover:bg-neutral-800 w-[30px] h-[30px] cursor-pointer border-1 border-neutral-800 rounded-e-sm" onClick={() => setAsideToggle((prev) => !prev)} type="button" >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </button>
        </div>
        <button
          className="mb-4 w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
          onClick={handleNewChat}
          type="button"
        >
          + New Chat
        </button>
        <div className="flex-1 overflow-y-auto">
          {
            messages.map((chat, idx) => (
              <div
                key={chat.id}
                className={`chat-item py-3 px-4 mb-2 hover:bg-neutral-800 transition rounded cursor-pointer ${currentChat === idx ? "bg-neutral-800" : ""}`}
                onClick={() => {
                  setCurrentChat(idx)
                  setAsideToggle(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-white ">Chat { chat.id }</h2>
                  <button
                    className="ml-2 p-1 transition text-white cursor-pointer text-2xl"
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await axios.delete(`http://localhost:3000/messages/${chat.id}`);
                      setMessages(prev => {
                        const updated = prev.filter((_, i) => i !== idx);
                        if (currentChat === idx) {
                          return updated.length > 0 ? (setCurrentChat(0), updated) : (setCurrentChat(null), updated);
                        } else if (currentChat > idx) {
                          setCurrentChat(currentChat - 1);
                        }
                        return updated;
                      });
                    }}
                    title="Delete Chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </aside>
      <div className={`flex flex-col justify-between p-6 pb-0 w-full ms-auto transition-all duration-300 ease-in-out ${asideToggle ? "w-full" : "md:w-[calc(100%-300px)]"}`}>
        <div className="flex flex-col items-start max-w-[800px] w-full mx-auto overflow-hidden">
          { 
            messages[currentChat]?.details?.map((message, idx) => (
              <div
                key={idx}
                className={
                  message.role === "user"
                    ? "mb-6 self-end bg-neutral-800 border-1 border-neutral-700 py-3 px-4 rounded-2xl rounded-br-none text-white"
                    : "mb-6 w-full overflow-hidden"
                }
              >
                {message.type === "image" ? (
                  <img
                    src={message.content}
                    alt="Generated"
                    className="rounded max-w-xs my-2"
                    style={{ background: "#222" }}
                  />
                ) : message.loading ? (
                  <div className="italic text-neutral-400 flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-neutral-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {message.content}
                  </div>
                ) : message.role === "user" ? (
                  <pre>{message.content}</pre>
                ) : (
                  <AIResponse className="text-white" text={message.content} />
                )}
              </div>
            ))
          }
        </div>
        <div className=" sticky bottom-0 pb-6 bg-neutral-900">
          <form 
            className="chat-input max-w-[800px] w-full p-3 bg-neutral-800 border-1 border-neutral-700 text-white rounded-xl mx-auto mt-4 jus text-end"
            onSubmit={handleSubmit}
          >
            <textarea
              type="text"
              placeholder="Type your message..."
              rows="2"
              className="w-full outline-0 p-2 resize-none"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            ></textarea>
            <div className="flex items-end justify-between mt-2">  
              <Select defaultValue={chatType} onValueChange={(value) => setChatType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Type</SelectLabel>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="image">Generate Image</SelectItem>
                    <SelectItem value="audio" disabled>Generate Audio (Soon)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <button className="mt-2 p-3 bg-neutral-700 border-1 border-neutral-600 text-white rounded-full transition cursor-pointer hover:bg-neutral-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
