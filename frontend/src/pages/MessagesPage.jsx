import React, { useState, useEffect } from 'react';
import { messageAPI } from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await messageAPI.getAllConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    try {
      const response = await messageAPI.getConversation(conversation.otherUser._id);
      setMessages(response.data.messages || []);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await messageAPI.sendMessage(selectedConversation.otherUser._id, messageText);
      setMessageText('');
      // Refresh messages
      const response = await messageAPI.getConversation(selectedConversation.otherUser._id);
      setMessages(response.data.messages || []);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="min-h-screen bg-light py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-dark mb-8">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white rounded-lg shadow-lg overflow-hidden min-h-96">
          {/* Conversations List */}
          <div className="lg:col-span-1 border-r border-gray-200 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-secondary">Loading...</div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.otherUser._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 text-left border-b border-gray-200 hover:bg-light transition ${
                    selectedConversation?.otherUser._id === conv.otherUser._id
                      ? 'bg-light border-l-4 border-l-primary'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                      {conv.otherUser.firstName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-dark truncate">
                        {conv.otherUser.firstName} {conv.otherUser.lastName}
                      </p>
                      <p className="text-sm text-secondary truncate">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-secondary">
                No conversations yet
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center bg-light">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {selectedConversation.otherUser.firstName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-dark">
                      {selectedConversation.otherUser.firstName}{' '}
                      {selectedConversation.otherUser.lastName}
                    </p>
                    <p className="text-sm text-secondary">Active now</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${
                          msg.sender._id === user?.id
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.sender._id === user?.id
                              ? 'bg-primary text-white'
                              : 'bg-light text-dark'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender._id === user?.id
                                ? 'text-red-100'
                                : 'text-secondary'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-secondary py-8">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="bg-primary hover:bg-red-500 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition font-medium"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center bg-gradient-to-br from-light to-white">
                <div className="max-w-sm">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-2xl font-bold text-dark mb-3">No Conversation Selected</h2>
                  <p className="text-secondary mb-6">
                    Select a conversation from the list on the left to view and continue messaging.
                  </p>
                  
                  {conversations.length === 0 ? (
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-left">
                      <p className="text-sm text-dark mb-3">
                        <strong>No conversations yet?</strong>
                      </p>
                      <ul className="text-sm text-secondary space-y-2 list-inside list-disc">
                        <li>Connect with room owners or students</li>
                        <li>Browse rooms and send inquiries</li>
                        <li>Receive messages from others</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="text-sm text-secondary">
                      👈 Click on a conversation to get started
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
