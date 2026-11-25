
"use client";

import { useState, type FormEvent } from "react";
import {
  Sparkles,
  Send,
  Plus,
  Bot,
  User,
  ArrowUpRight,
} from "lucide-react";
import AppLayout from "../../components/AppLayout";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "Quelles sont mes arrivées aujourd'hui ?",
  "Résume les tâches en attente",
  "Quel est mon chiffre d'affaires ?",
  "Aide-moi à organiser ma journée",
];

export default function AssistantPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = message.trim();
    if (!content) return;

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        role: "user",
        content,
      },
      {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "L'interface est prête ! La connexion au moteur d'intelligence artificielle sera ajoutée dans une prochaine étape.",
      },
    ]);

    setMessage("");
  };

  return (
    <AppLayout>
      <div className="mx-auto flex min-h-[calc(100vh-100px)] max-w-[1600px] flex-col px-4 pb-28 pt-8 sm:px-6 sm:pt-10 lg:px-12 lg:pb-10 xl:px-16">

        <section className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#172d4d] text-white shadow-lg shadow-[#172d4d]/15">
              <Sparkles size={23} strokeWidth={1.7} />
            </div>

            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#101e33]">
                Assistant IA
              </h2>
              <p className="mt-1 text-sm text-[#697586]">
                Votre assistant intelligent de gestion.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-[#e2e7ef] bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-[#edf0f4] px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f4f9] text-[#29466b]">
                <Bot size={21} />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#172d4d]">
                  Gîte Assistant
                </p>
                <p className="mt-0.5 text-xs text-[#8993a2]">
                  Votre espace de conversation
                </p>
              </div>
            </div>

            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-2 rounded-xl border border-[#e2e7ef] px-3 py-2 text-xs font-medium text-[#697586] transition hover:bg-[#f5f7fa]"
            >
              <Plus size={15} />
              Nouvelle conversation
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-10">

            {messages.length === 0 ? (
              <div className="mx-auto w-full max-w-2xl text-center">

                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#172d4d] to-[#5279a8] text-white shadow-xl shadow-[#172d4d]/15">
                  <Sparkles size={30} strokeWidth={1.5} />
                </div>

                <h3 className="text-2xl font-semibold tracking-tight text-[#172d4d] sm:text-3xl">
                  Comment puis-je vous aider ?
                </h3>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#8993a2]">
                  Retrouvez prochainement un assistant capable de vous
                  accompagner dans la gestion quotidienne de vos établissements.
                </p>

                <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setMessage(suggestion)}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-[#e2e7ef] bg-[#fafbfc] p-4 text-sm text-[#39465a] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#aabbd0] hover:bg-white hover:shadow-md"
                    >
                      <span>{suggestion}</span>
                      <ArrowUpRight
                        size={16}
                        className="shrink-0 text-[#9aa6b5] transition group-hover:text-[#29466b]"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className={`flex gap-3 ${
                      item.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        item.role === "assistant"
                          ? "bg-[#172d4d] text-white"
                          : "bg-[#edf1f6] text-[#29466b]"
                      }`}
                    >
                      {item.role === "assistant" ? (
                        <Bot size={18} />
                      ) : (
                        <User size={18} />
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                        item.role === "assistant"
                          ? "border border-[#e2e7ef] bg-[#fafbfc] text-[#39465a]"
                          : "bg-[#172d4d] text-white"
                      }`}
                    >
                      {item.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-[#edf0f4] bg-[#fcfcfd] p-4 sm:p-6">
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-[#dce2ea] bg-white p-2 shadow-sm transition focus-within:border-[#7892b2] focus-within:shadow-md"
            >
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Écrivez votre message..."
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-[#252a32] outline-none placeholder:text-[#a0a9b5]"
              />

              <button
                type="submit"
                disabled={!message.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#172d4d] text-white transition hover:bg-[#29466b] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Envoyer le message"
              >
                <Send size={18} />
              </button>
            </form>

            <p className="mt-3 text-center text-[11px] text-[#a0a9b5]">
              Version interface — connexion IA à venir.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
