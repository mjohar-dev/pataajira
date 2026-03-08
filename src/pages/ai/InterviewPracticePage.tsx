import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Send, Loader2, Bot, User } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const InterviewPracticePage = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI interview coach. Tell me the role you're preparing for and I'll start asking you interview questions. I'll provide feedback after each answer." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await supabase.functions.invoke("ai-tools", {
        body: { type: "interview-practice", messages: newMessages },
      });
      if (response.error) throw response.error;
      setMessages([...newMessages, { role: "assistant", content: response.data.content }]);
    } catch (err: any) {
      toast.error(err.message || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Interview Practice</h1>
          <p className="text-muted-foreground">Practice with an AI interviewer</p>
        </div>
      </div>

      <Card className="flex flex-col h-[60vh]">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10"><Bot className="h-4 w-4 text-primary" /></div>}
              <div className={`max-w-[80%] rounded-lg p-3 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
              {m.role === "user" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted"><User className="h-4 w-4" /></div>}
            </div>
          ))}
          {loading && <div className="flex gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div><div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">Thinking...</div></div>}
        </CardContent>
        <div className="border-t border-border p-4 flex gap-2">
          <Input placeholder="Type your answer..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()} disabled={loading} />
          <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon"><Send className="h-4 w-4" /></Button>
        </div>
      </Card>
    </div>
  );
};

export default InterviewPracticePage;
