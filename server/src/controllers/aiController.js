import Property from '../models/Property.js';

// Smart keyword-based AI chat handler (no external API key needed)
export const handleChat = async (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();

  try {
    // ----- INTENT: Search properties -----
    const locationKeywords = ['goa', 'delhi', 'mumbai', 'jaipur', 'manali', 'bangalore', 'bengaluru', 'udaipur', 'kerala', 'shimla', 'ooty', 'kolkata', 'hyderabad', 'agra', 'varanasi', 'rishikesh', 'mussoorie', 'coorg', 'darjeeling', 'lonavala'];
    const typeKeywords = { hotel: 'Hotel', villa: 'Villa', pg: 'PG', room: 'Room', apartment: 'Apartment', homestay: 'Homestay' };
    
    let query = {};
    let searchIntent = false;

    // Detect city
    for (const city of locationKeywords) {  
      if (lowerMsg.includes(city)) {
        query['location.city'] = { $regex: city, $options: 'i' };
        searchIntent = true;
        break;
      }
    }

    // Detect type
    for (const [kw, type] of Object.entries(typeKeywords)) {
      if (lowerMsg.includes(kw)) {
        query.type = type;
        searchIntent = true;
        break;
      }
    }

    // Detect budget / price
    const priceMatch = lowerMsg.match(/under\s*₹?\s*(\d+)|below\s*₹?\s*(\d+)|less than\s*₹?\s*(\d+)|budget\s*of\s*₹?\s*(\d+)/i);
    if (priceMatch) {
      const price = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4]);
      if (price) { query.pricePerNight = { $lte: price }; searchIntent = true; }
    }

    // Detect guests
    const guestsMatch = lowerMsg.match(/(\d+)\s*(guests?|people|persons?)/i);
    if (guestsMatch) {
      query.maxGuests = { $gte: parseInt(guestsMatch[1]) };
      searchIntent = true;
    }

    // Do a general property search if any search intent detected
    if (searchIntent) {
      const properties = await Property.find(query).limit(4);

      if (properties.length === 0) {
        return res.json({
          reply: `I couldn't find any properties matching your request. Try searching for a different city or property type — we have Villas, Hotels, PGs, Rooms, Apartments, and Homestays across India!`,
          properties: []
        });
      }

      const cityName = Object.keys(query).includes('location.city') ? lowerMsg.match(new RegExp(locationKeywords.join('|'), 'i'))?.[0] : null;
      const typeName = query.type || null;

      let reply = `I found ${properties.length} great option${properties.length > 1 ? 's' : ''}`;
      if (cityName) reply += ` in ${cityName.charAt(0).toUpperCase() + cityName.slice(1)}`;
      if (typeName) reply += ` (${typeName} type)`;
      reply += `! Here are my top picks:`;

      return res.json({ reply, properties });
    }

    // ----- INTENT: Greetings -----
    if (lowerMsg.match(/\b(hi|hello|hey|namaste|good morning|good evening)\b/)) {
      return res.json({
        reply: `Namaste! 🙏 Welcome to StayScape AI! I can help you find the perfect stay across India. Try asking me something like:\n• "Find villas in Goa"\n• "Show hotels in Jaipur under ₹3000"\n• "I need a room for 2 guests in Manali"`,
        properties: []
      });
    }

    // ----- INTENT: Pricing / cost questions -----
    if (lowerMsg.match(/\b(price|cost|cheap|affordable|budget|expensive|how much)\b/)) {
      const cheapProperties = await Property.find().sort({ pricePerNight: 1 }).limit(3);
      return res.json({
        reply: `We have stays starting from just ₹${cheapProperties[0]?.pricePerNight || 'a few hundred'} per night! Here are our most affordable options:`,
        properties: cheapProperties
      });
    }

    // ----- INTENT: Recommendations / trending -----
    if (lowerMsg.match(/\b(recommend|best|top|popular|trending|good|suggest)\b/)) {
      const topProperties = await Property.find().sort({ ratingsAverage: -1 }).limit(4);
      return res.json({
        reply: `Here are some of our top-rated properties guests love the most! 🌟`,
        properties: topProperties
      });
    }

    // ----- INTENT: Show all / browse -----
    if (lowerMsg.match(/\b(show all|all properties|browse|explore|see everything|list)\b/)) {
      const all = await Property.find().limit(5);
      return res.json({ reply: `Here's a quick look at some of our featured properties from across India:`, properties: all });
    }

    // ----- Fallback intelligent response -----
    const fallbackReplies = [
      `I can help you find the perfect stay! Try asking me:\n• "Show villas in Goa"\n• "Hotels in Jaipur under ₹5000"\n• "Best rated properties"\n• "Show cheap stays"`,
      `I'm not quite sure what you're looking for. Could you try something like "Find a hotel in Mumbai" or "Show rooms under ₹2000"?`,
      `Let me help you find an amazing stay! Tell me a city (like Goa, Manali, Jaipur), property type (Villa, PG, Hotel), or your budget and I'll search for you! 🏨`
    ];

    return res.json({
      reply: fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)],
      properties: []
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Chat failed', error: error.message });
  }
};
