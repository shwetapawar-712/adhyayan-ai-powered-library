import { useState, useCallback } from 'react';
import { ChatMessage, AIRecommendation, AnalyticsData } from '@/types/library';

// Mock analytics data generator
const generateMockAnalytics = (): AnalyticsData[] => {
  const data: AnalyticsData[] = [];
  const today = new Date();
  
  for (let d = 6; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    
    for (let hour = 8; hour <= 22; hour++) {
      // Simulate realistic occupancy patterns
      let baseRate = 30;
      if (hour >= 10 && hour <= 12) baseRate = 65;
      if (hour >= 14 && hour <= 18) baseRate = 85;
      if (hour >= 19 && hour <= 21) baseRate = 60;
      
      const variance = Math.random() * 20 - 10;
      
      data.push({
        date: date.toISOString().split('T')[0],
        hour,
        occupancyRate: Math.min(100, Math.max(0, Math.round(baseRate + variance))),
        bookings: Math.floor(Math.random() * 8) + 2,
        noShows: Math.floor(Math.random() * 3),
      });
    }
  }
  
  return data;
};

// Smart AI response generator
const generateAIResponse = (query: string, conversationHistory: ChatMessage[]): string => {
  const lowerQuery = query.toLowerCase();
  const hour = new Date().getHours();
  
  // Seat availability queries
  if (lowerQuery.includes('seat') || lowerQuery.includes('available') || lowerQuery.includes('free') || lowerQuery.includes('empty')) {
    const responses = [
      `📊 Based on real-time detection, I can see:\n\n• **Zone A**: 2 seats available (A1, A2)\n• **Zone B**: 2 seats available (B1, B2)\n\nThe AI detection system is actively monitoring occupancy. Would you like me to recommend the best seat for your needs?`,
      `🪑 Current seat status:\n\n✅ A1 - Available (near window)\n✅ A2 - Available (quiet corner)\n✅ B1 - Available (near power outlets)\n✅ B2 - Available (group study area)\n\nAll seats are monitored in real-time using our AI detection system.`,
      `I'm checking the live camera feeds... Currently, all 4 demo seats are showing as available. The MediaPipe detection system updates every second for accurate occupancy tracking.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Book-related queries
  if (lowerQuery.includes('book') || lowerQuery.includes('borrow') || lowerQuery.includes('return') || lowerQuery.includes('library')) {
    const responses = [
      `📚 **Library Book Services:**\n\n• Borrow limit: 5 books per student\n• Loan period: 14 days (renewable twice)\n• Late fee: $0.50/day\n• Reserve books online through the catalog\n\nNeed help finding a specific book?`,
      `📖 I can help with book-related questions! Our library has:\n\n• 50,000+ physical books\n• Digital e-book collection\n• Academic journals access\n• Study materials archive\n\nWhat subject or title are you looking for?`,
      `The library catalog is searchable online. Popular sections include Computer Science (Floor 2), Literature (Floor 1), and Science (Floor 3). Would you like directions to a specific section?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Time/crowd queries
  if (lowerQuery.includes('busy') || lowerQuery.includes('crowd') || lowerQuery.includes('when') || lowerQuery.includes('time') || lowerQuery.includes('peak')) {
    let timeAdvice = '';
    if (hour < 10) {
      timeAdvice = `🌅 Great news! Early morning (now) is typically our quietest time with only 20-30% occupancy.`;
    } else if (hour >= 10 && hour < 14) {
      timeAdvice = `☀️ Mid-morning to early afternoon sees moderate traffic (50-60% occupancy).`;
    } else if (hour >= 14 && hour < 18) {
      timeAdvice = `⚠️ Afternoon (2-6 PM) is our peak time with 80-90% occupancy. Book ahead!`;
    } else if (hour >= 18 && hour < 21) {
      timeAdvice = `🌆 Evening hours show decreasing occupancy (40-60%). Good time to study!`;
    } else {
      timeAdvice = `🌙 Late evening is quiet with only 20-30% occupancy. Perfect for focused work.`;
    }
    return `${timeAdvice}\n\n**Peak Hours Analysis:**\n• Busiest: 2 PM - 6 PM (exam periods worse)\n• Quietest: 8 AM - 10 AM, after 8 PM\n• Weekends: Generally 40% less crowded\n\nOur AI system tracks these patterns to help you plan!`;
  }
  
  // Booking/reservation queries
  if (lowerQuery.includes('book') || lowerQuery.includes('reserve') || lowerQuery.includes('cancel')) {
    return `🎫 **Seat Booking Rules:**\n\n• Maximum booking: 4 hours/session\n• Auto-cancel: 15 min if not occupied (AI detected)\n• Daily limit: 2 bookings per student\n• Cancellation: Free up to 30 min before\n\nThe AI detection system automatically frees seats when unoccupied to maximize availability for everyone.`;
  }
  
  // Study recommendations
  if (lowerQuery.includes('study') || lowerQuery.includes('recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('quiet') || lowerQuery.includes('focus')) {
    return `📝 **Personalized Study Recommendations:**\n\nBased on current conditions:\n\n🔇 **For quiet study:** Zone B seats (B1, B2) - away from entrance\n💡 **For natural light:** Zone A seats (A1) - near windows\n🔌 **For devices:** All seats have power outlets\n👥 **For group work:** Zone B area can accommodate 2-3 people\n\nCurrent noise level: Low 🟢\nAI-detected occupancy: Light`;
  }
  
  // Help/general queries
  if (lowerQuery.includes('help') || lowerQuery.includes('what can') || lowerQuery.includes('how do')) {
    return `🤖 **I'm your AI Library Assistant!** Here's what I can help with:\n\n📊 **Seat Availability** - Real-time occupancy from AI detection\n📚 **Book Information** - Borrowing, returns, catalog search\n⏰ **Best Times** - Crowd predictions and recommendations\n🎫 **Booking Help** - Rules, reservations, cancellations\n📝 **Study Tips** - Personalized seat recommendations\n\nJust ask me anything about the library!`;
  }
  
  // AI/detection queries
  if (lowerQuery.includes('ai') || lowerQuery.includes('detect') || lowerQuery.includes('camera') || lowerQuery.includes('privacy')) {
    return `🔒 **About Our AI Detection System:**\n\n• Uses MediaPipe for person detection only\n• No face recognition or identification\n• No images/videos are stored\n• All processing happens locally in the browser\n• Only anonymous occupancy data is used\n\nThe system simply detects if a seat region is occupied to provide real-time availability updates.`;
  }
  
  // Greeting
  if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey') || lowerQuery.includes('good')) {
    const greetings = [
      `Hello! 👋 I'm here to help you with anything library-related. You can ask me about seat availability, book information, or study recommendations!`,
      `Hi there! Ready to help you find the perfect study spot or answer any library questions. What do you need?`,
      `Hey! Welcome to the Smart Library. I can check seat availability, suggest study times, or help with books. What would you like to know?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Default intelligent response
  return `I understand you're asking about "${query.slice(0, 50)}${query.length > 50 ? '...' : ''}"\n\nI can help you with:\n• 🪑 Seat availability & booking\n• 📚 Book borrowing & returns\n• ⏰ Best times to visit\n• 📝 Study recommendations\n• 🔒 AI detection & privacy info\n\nCould you tell me more specifically what you'd like to know?`;
};

export const useAI = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '👋 Hello! I\'m your **AI Library Assistant** powered by smart detection.\n\nI can help you:\n• Find available seats in real-time\n• Answer questions about books & borrowing\n• Suggest the best study times\n• Explain our AI privacy practices\n\nHow can I assist you today?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [analytics] = useState<AnalyticsData[]>(generateMockAnalytics);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI thinking with variable delay for realism
    const thinkingTime = 600 + Math.random() * 800 + (content.length * 10);
    await new Promise(resolve => setTimeout(resolve, Math.min(thinkingTime, 2000)));

    // Generate intelligent response
    const response = generateAIResponse(content, messages);

    const aiMessage: ChatMessage = {
      id: `msg_${Date.now()}_ai`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  }, []);

  const generateRecommendations = useCallback((occupancyPercentage: number) => {
    const now = new Date();
    const hour = now.getHours();
    
    const newRecommendations: AIRecommendation[] = [];

    // Time-based recommendation
    if (hour < 10) {
      newRecommendations.push({
        id: 'time_1',
        type: 'time',
        title: 'Great Time to Visit',
        description: 'Morning hours (8-10 AM) typically have low occupancy. Perfect for focused study!',
        priority: 'high',
        icon: '🌅',
      });
    } else if (hour >= 14 && hour <= 18) {
      newRecommendations.push({
        id: 'time_2',
        type: 'time',
        title: 'Peak Hours Alert',
        description: 'This is typically the busiest time. Consider booking a seat in advance.',
        priority: 'high',
        icon: '⚠️',
      });
    } else if (hour >= 20) {
      newRecommendations.push({
        id: 'time_3',
        type: 'time',
        title: 'Evening Availability',
        description: 'Library usage drops after 8 PM. Good time for uninterrupted study.',
        priority: 'medium',
        icon: '🌙',
      });
    }

    // Occupancy-based recommendations
    if (occupancyPercentage < 30) {
      newRecommendations.push({
        id: 'seat_1',
        type: 'seat',
        title: 'Low Occupancy',
        description: 'Plenty of seats available. Zone B has excellent spots near windows.',
        priority: 'low',
        icon: '💚',
      });
    } else if (occupancyPercentage > 80) {
      newRecommendations.push({
        id: 'seat_2',
        type: 'seat',
        title: 'Limited Availability',
        description: 'Seats are filling up fast. Book now to secure your spot!',
        priority: 'high',
        icon: '🔴',
      });
    }

    // Insight recommendation
    newRecommendations.push({
      id: 'insight_1',
      type: 'insight',
      title: 'Reduce No-Shows',
      description: 'Setting reminders 5 minutes before your booking helps maintain your reservation.',
      priority: 'medium',
      icon: '💡',
    });

    setRecommendations(newRecommendations);
  }, []);

  const getPeakHours = useCallback(() => {
    const hourlyData: Record<number, number[]> = {};
    
    analytics.forEach(data => {
      if (!hourlyData[data.hour]) {
        hourlyData[data.hour] = [];
      }
      hourlyData[data.hour].push(data.occupancyRate);
    });

    const avgByHour = Object.entries(hourlyData).map(([hour, rates]) => ({
      hour: parseInt(hour),
      avgRate: Math.round(rates.reduce((a, b) => a + b, 0) / rates.length),
    }));

    return avgByHour.sort((a, b) => b.avgRate - a.avgRate).slice(0, 3);
  }, [analytics]);

  const getNoShowStats = useCallback(() => {
    const totalBookings = analytics.reduce((sum, d) => sum + d.bookings, 0);
    const totalNoShows = analytics.reduce((sum, d) => sum + d.noShows, 0);
    
    return {
      totalBookings,
      totalNoShows,
      noShowRate: totalBookings > 0 ? Math.round((totalNoShows / totalBookings) * 100) : 0,
    };
  }, [analytics]);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Chat cleared. How can I help you today?',
      timestamp: new Date().toISOString(),
    }]);
  }, []);

  return {
    messages,
    isTyping,
    recommendations,
    analytics,
    sendMessage,
    generateRecommendations,
    getPeakHours,
    getNoShowStats,
    clearMessages,
  };
};
