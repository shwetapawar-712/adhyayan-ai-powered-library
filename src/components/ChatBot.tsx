import { useState, useRef, useEffect } from 'react';
import { useAI } from '@/hooks/useAI';
import { Send, Bot, User, Trash2, Sparkles, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

// Simple markdown renderer for chat messages
const renderMarkdown = (text: string) => {
  return text
    .split('\n')
    .map((line, i) => {
      // Bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (line.startsWith('• ')) {
        return `<div class="flex gap-2 ml-2"><span>•</span><span>${line.slice(2)}</span></div>`;
      }
      // Empty line
      if (line.trim() === '') {
        return '<div class="h-2"></div>';
      }
      return `<div>${line}</div>`;
    })
    .join('');
};

const ChatBot = () => {
  const { messages, isTyping, sendMessage, clearMessages } = useAI();
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (input.trim() && !isTyping) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const quickActions = [
    { label: '🪑 Seats', query: 'What seats are available?' },
    { label: '📚 Books', query: 'How do I borrow books?' },
    { label: '⏰ Times', query: 'When is the library least crowded?' },
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen 
            ? 'bg-muted text-muted-foreground rotate-0' 
            : 'bg-gradient-to-br from-primary to-accent text-primary-foreground'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        {!isOpen && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
            {messages.length - 1}
          </span>
        )}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-background border border-border rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="w-5 h-5 text-primary" />
                <Sparkles className="w-3 h-3 text-accent absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold">AI Library Assistant</h3>
                <span className="text-[10px] text-muted-foreground">Ask about seats, books & more</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearMessages} 
              className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="flex gap-2 p-3 flex-wrap border-b border-border/50 bg-muted/10">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => sendMessage(action.query)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="h-[320px] p-4" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-2 animate-fade-in ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0 border border-primary/20">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-br-md' 
                      : 'bg-muted/60 border border-border/50 rounded-bl-md'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div 
                        className="prose prose-sm prose-invert max-w-none [&_strong]:text-primary [&_strong]:font-semibold"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center flex-shrink-0 border border-accent/20">
                      <User className="w-4 h-4 text-accent" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-2 animate-fade-in">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/20">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted/60 border border-border/50 p-3 rounded-2xl rounded-bl-md">
                    <span className="flex gap-1 items-center">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                      <span className="text-xs text-muted-foreground ml-2">Thinking...</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2 p-4 border-t border-border bg-muted/20">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about seats, books, times..."
              className="bg-background border-border/50 focus:border-primary/50"
              disabled={isTyping}
            />
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
