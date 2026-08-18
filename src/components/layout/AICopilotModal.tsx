import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import type { AICopilotMessage } from '../../types/warehouse';
import { processCopilotQuery } from '../../utils/copilotEngine';
import { Bot, Send, X, ArrowRight } from 'lucide-react';

export const AICopilotModal: React.FC = () => {
  const { 
    products, 
    orders, 
    pickTasks, 
    exceptions, 
    setActivePage, 
    reallocateStock, 
    reorderProduct, 
    dispatchOrder,
    showToast 
  } = useWarehouse();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<AICopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '👋 Hello Supervisor! I am **SmartFlow AI Copilot**. Ask me anything about order prioritization, stock shortages, picker routes, or warehouse bottlenecks.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'Check Stock Conflicts', actionType: 'NAVIGATE', page: 'allocation' },
        { label: 'Show Delayed Urgent Orders', actionType: 'NAVIGATE', page: 'dispatch' }
      ]
    }
  ]);

  const handleSend = (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    const userMsg: AICopilotMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const aiMsg = processCopilotQuery(textToSend, products, orders, pickTasks, exceptions);

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInputText('');
  };

  const executeAction = (action: NonNullable<AICopilotMessage['suggestedActions']>[0]) => {
    if (action.page) setActivePage(action.page);

    if (action.actionType === 'EXECUTE_REALLOCATION' && action.targetId) {
      reallocateStock(action.targetId, 'ORD-1048', 'PRD-102', 3);
      showToast('Action Executed via AI Copilot', 'Reallocated stock to urgent order ORD-1045', 'success');
    } else if (action.actionType === 'EXECUTE_REORDER' && action.targetId) {
      reorderProduct(action.targetId, 30);
      showToast('Action Executed via AI Copilot', 'Replenishment order of 30 units placed', 'success');
    } else if (action.actionType === 'DISPATCH_URGENT' && action.targetId) {
      dispatchOrder(action.targetId, 'FedEx Express Freight');
      showToast('Action Executed via AI Copilot', `Dispatched ${action.targetId} via FedEx Express`, 'success');
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold text-xs rounded-2xl shadow-2xl shadow-blue-500/40 flex items-center gap-2.5 transition-all hover:scale-105 border border-white/20"
      >
        <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white animate-bounce" />
        </div>
        <span>Ask SmartFlow AI Copilot 🤖</span>
      </button>

      {/* Copilot Chat Window Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
            
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    SmartFlow AI Copilot
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Autonomous Warehouse Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl space-y-2 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md font-medium'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Quick Action Execution Buttons inside AI Message */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="pt-2 flex flex-col gap-1.5 border-t border-slate-800">
                        <span className="text-[10px] text-blue-400 font-semibold uppercase">Suggested Action:</span>
                        {msg.suggestedActions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => executeAction(act)}
                            className="w-full py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-left text-[11px] font-bold transition flex items-center justify-between"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Prompt Shortcut Chips */}
            <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-500 font-mono shrink-0">Prompts:</span>
              {[
                'Show stock conflicts',
                'What orders are delayed?',
                'Where is the bottleneck?',
                'Suggest reorders'
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask AI Copilot to check stock, reallocate, or analyze bottlenecks..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
};
