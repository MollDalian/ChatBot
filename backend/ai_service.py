from typing import AsyncGenerator, Optional, List, Dict
import torch
import threading
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
from openai import OpenAI, OpenAIError
from datetime import datetime


class AIService:
    """Service for handling AI model interactions with support for OpenAI and local models."""
    
    def __init__(self):
        """Initialize the AI service. DialoGPT loads lazily when needed."""
        self.fallback_model_name: str = "microsoft/DialoGPT-medium"
        self.fallback_tokenizer: Optional[AutoTokenizer] = None
        self.fallback_model: Optional[AutoModelForCausalLM] = None
        self._model_loaded: bool = False
    
    def _load_dialogpt_model(self) -> None:
        """Lazy load DialoGPT model only when needed (when no API key provided)."""
        if not self._model_loaded:
            print(f"Loading DialoGPT model ({self.fallback_model_name})...")
            self.fallback_tokenizer = AutoTokenizer.from_pretrained(self.fallback_model_name)
            self.fallback_model = AutoModelForCausalLM.from_pretrained(self.fallback_model_name)
            self.fallback_model.eval()
            
            if torch.cuda.is_available():
                self.fallback_model.to("cuda")
            
            self._model_loaded = True
            print("DialoGPT model loaded successfully.")
    
    async def generate_response(
        self,
        prompt: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        api_key: Optional[str] = None,
        model: str = "gpt-3.5-turbo"
    ) -> AsyncGenerator[str, None]:
        """
        Generate AI response using OpenAI (if API key provided) or DialoGPT (fallback).
        
        Args:
            prompt: User's message
            chat_history: List of previous messages [{"role": "user"|"assistant", "content": "..."}]
            api_key: Optional OpenAI API key (if None, uses DialoGPT)
            model: OpenAI model name (default: gpt-3.5-turbo)
            
        Yields:
            Response tokens as they are generated
        """
        history = chat_history or []
        if api_key:
            async for token in self._generate_openai_response(prompt, history, api_key, model):
                yield token
        else:
            async for token in self._generate_dialogpt_response(prompt, history):
                yield token
    
    async def _generate_openai_response(
        self,
        prompt: str,
        chat_history: List[Dict[str, str]],
        api_key: str,
        model: str
    ) -> AsyncGenerator[str, None]:
        """Generate response using OpenAI API."""
        try:
            client = OpenAI(api_key=api_key)
            
            # Build messages with history
            messages = []
            if chat_history:
                for msg in chat_history[-10:]:  # Last 10 messages for context
                    role = "assistant" if msg["user"] == "bot" else "user"
                    messages.append({"role": role, "content": msg["message"]})
            
            messages.append({"role": "user", "content": prompt})
            
            # Stream response
            stream = client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True,
                temperature=0.7,
                max_tokens=500
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except OpenAIError as e:
            yield f"OpenAI Error: {str(e)}. Please check your API key."
        except Exception as e:
            yield f"Error: {str(e)}"
    
    async def _generate_dialogpt_response(
        self,
        prompt: str,
        chat_history: List[Dict[str, str]]
    ) -> AsyncGenerator[str, None]:
        """Generate response using DialoGPT (free fallback)."""
        try:
            # Lazy load the model only when needed
            self._load_dialogpt_model()
            
            # Ensure models are loaded (for type checker)
            assert self.fallback_tokenizer is not None, "Tokenizer failed to load"
            assert self.fallback_model is not None, "Model failed to load"
            
            # Build conversation history
            conversation = ""
            if chat_history:
                for msg in chat_history[-5:]:  # Last 5 messages
                    if msg["user"] == "user":
                        conversation += f"{msg['message']}{self.fallback_tokenizer.eos_token}"
                    else:
                        conversation += f"{msg['message']}{self.fallback_tokenizer.eos_token}"
            
            conversation += prompt + self.fallback_tokenizer.eos_token
            
            # Tokenize
            input_ids = self.fallback_tokenizer.encode(
                conversation,
                return_tensors="pt",
                truncation=True,
                max_length=1000
            )
            
            if torch.cuda.is_available():
                input_ids = input_ids.to("cuda")
            
            # Generate with streaming
            streamer = TextIteratorStreamer(
                self.fallback_tokenizer,
                skip_prompt=True,
                skip_special_tokens=True
            )
            
            thread = threading.Thread(
                target=self.fallback_model.generate,
                kwargs={
                    "input_ids": input_ids,
                    "max_new_tokens": 100,
                    "do_sample": True,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "pad_token_id": self.fallback_tokenizer.eos_token_id,
                    "streamer": streamer,
                }
            )
            thread.start()
            
            for token_text in streamer:
                if token_text.strip():
                    yield token_text
            
            thread.join()
            
        except Exception as e:
            yield f"Error: {str(e)}"


# Global AI service instance
ai_service = AIService()
