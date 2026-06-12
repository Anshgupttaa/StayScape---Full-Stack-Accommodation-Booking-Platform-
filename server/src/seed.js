import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Property from './models/Property.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stayscape';

const c = (url, publicId) => ({ url, publicId });
const baseImg = 'https://images.unsplash.com/photo-';

const pools = {
  Hotel: [
    '1566073771259-6a8506099945', '1542314831-c6a4d14effb2', '1445013518233-4b1ab469d197', 
    '1582719478250-c89a24bb0112', '1566665797739-1674de7a421a', '1590490359683-658d3d23f972'
  ],
  Villa: [
    '1600585154340-be6161a56a0c', '1600596542815-ffad4c1539a9', '1512917774080-9991f1c4c750', 
    '1600607688969-a5bfcd64bd28', '1580587767516-ac4c12579463', '1512918728022-de55140fd0be'
  ],
  Apartment: [
    '1502672260266-1c1c2940844e', '1522708323590-d24dbb6b0267', '1484154218962-a197022b5858', 
    '1560448205-4d9b3e6bb6db', '1554995207-c18c203602cb', '1519710164239-da123dc03ef4'
  ],
  Homestay: [
    '1499696010180-025ef6e1a8f9', '1510798831971-661eb04b3739', '1449844908441-8829872d2607', 
    '1549294413-26f195200c16', '1472224371017-08207f84aaae', '1481437156560-3205f6a55735'
  ]
};

const getImages = (type) => {
  const pool = pools[type] || pools.Apartment;
  return pool.map((id, i) => c(baseImg + id + '?auto=format&fit=crop&w=1200&q=80', id + i));
};

const dummyProperties = [
  {
    title: 'Heritage Lake View Palace',
    description: 'Experience royalty in this beautifully restored heritage hotel overlooking Lake Pichola. Features exquisite marble carvings and traditional Rajasthani decor.',
    type: 'Hotel', pricePerNight: 12000,
    location: { address: 'Lake Pichola Banks', city: 'Udaipur', state: 'Rajasthan', country: 'India', coordinates: { lat: 24.5764, lng: 73.6798 } },
    images: getImages('Hotel'),
    amenities: ['Pool', 'Spa', 'Restaurant', 'Wifi', 'Air conditioning'], maxGuests: 2, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.9, ratingsQuantity: 342
  },
  {
    title: 'Luxury Beachfront Villa',
    description: 'Stunning 4-bedroom Portuguese-style villa right on the beaches of South Goa. Perfect for family getaways with private pool and direct beach access.',
    type: 'Villa', pricePerNight: 25000,
    location: { address: 'Palolem Beach Road', city: 'South Goa', state: 'Goa', country: 'India', coordinates: { lat: 15.0100, lng: 74.0232 } },
    images: getImages('Villa'),
    amenities: ['Private Pool', 'Beachfront', 'Chef', 'Wifi', 'Kitchen', 'Air conditioning'], maxGuests: 8, bedroomCount: 4, bathroomCount: 4.5, ratingsAverage: 4.8, ratingsQuantity: 124
  },
  {
    title: 'Modern Tech Park PG',
    description: 'Premium co-living space for IT professionals and students in HSR Layout. Includes high-speed wifi and managed meals.',
    type: 'PG', pricePerNight: 800,
    location: { address: 'HSR Layout Sector 2', city: 'Bangalore', state: 'Karnataka', country: 'India', coordinates: { lat: 12.9081, lng: 77.6476 } },
    images: getImages('Apartment'),
    amenities: ['Meals included', 'Wifi', 'Housekeeping', 'Power Backup'], maxGuests: 1, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.3, ratingsQuantity: 215
  },
  {
    title: 'Cozy Himalayan Homestay',
    description: 'Traditional wooden cottage surrounded by apple orchards with breathtaking views of the snow-capped mountains.',
    type: 'Homestay', pricePerNight: 2500,
    location: { address: 'Old Manali Village', city: 'Manali', state: 'Himachal Pradesh', country: 'India', coordinates: { lat: 32.2518, lng: 77.1828 } },
    images: getImages('Homestay'),
    amenities: ['Mountain View', 'Home-cooked meals', 'Indoor heating', 'Wifi', 'Free parking'], maxGuests: 3, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.7, ratingsQuantity: 89
  },
  {
    title: 'Luxury Apartment in BKC',
    description: 'Ultra-modern 2BHK service apartment in the heart of Mumbai-s corporate hub. Minimalist design with high-end appliances.',
    type: 'Apartment', pricePerNight: 8500,
    location: { address: 'Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: { lat: 19.0658, lng: 72.8665 } },
    images: getImages('Apartment'),
    amenities: ['Wifi', 'Gym', 'Pool', 'Kitchen', 'TV', 'Air conditioning'], maxGuests: 4, bedroomCount: 2, bathroomCount: 2, ratingsAverage: 4.6, ratingsQuantity: 112
  },
  {
    title: 'Boutique Room near Taj Mahal',
    description: 'Beautifully decorated AC room located just a short walk from the iconic Taj Mahal. Ideal for solo travelers or couples.',
    type: 'Room', pricePerNight: 3500,
    location: { address: 'Taj East Gate Road', city: 'Agra', state: 'Uttar Pradesh', country: 'India', coordinates: { lat: 27.1751, lng: 78.0421 } },
    images: getImages('Hotel'),
    amenities: ['Wifi', 'Rooftop cafe', 'Air conditioning', 'Breakfast included'], maxGuests: 2, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.5, ratingsQuantity: 430
  },
  {
    title: 'Royal Palace Suite',
    description: 'Live like royalty in this magnificent marble suite. Features antique furniture and traditional art.',
    type: 'Hotel', pricePerNight: 18000,
    location: { address: 'Amer Road', city: 'Jaipur', state: 'Rajasthan', country: 'India', coordinates: { lat: 26.9124, lng: 75.7873 } },
    images: getImages('Hotel'),
    amenities: ['Butler Service', 'Wifi', 'Air conditioning', 'Pool', 'Breakfast included'], maxGuests: 2, bedroomCount: 1, bathroomCount: 1.5, ratingsAverage: 4.9, ratingsQuantity: 521
  },
  {
    title: 'Munnar Treehouse Retreat',
    description: 'An eco-friendly treehouse nestled high in the canopy of Munnar tea estates. Wake up to the sound of birds.',
    type: 'Villa', pricePerNight: 6500,
    location: { address: 'Chithirapuram', city: 'Munnar', state: 'Kerala', country: 'India', coordinates: { lat: 10.0892, lng: 77.0595 } },
    images: getImages('Villa'),
    amenities: ['Nature walk', 'Balcony', 'Breakfast included', 'Tea Tasting'], maxGuests: 2, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.8, ratingsQuantity: 187
  },
  {
    title: 'Ganges View Yoga Ashram',
    description: 'A serene and simple room overlooking the Holy Ganges. Perfect for those seeking spiritual peace and yoga practice.',
    type: 'Room', pricePerNight: 1200,
    location: { address: 'Laxman Jhula Road', city: 'Rishikesh', state: 'Uttarakhand', country: 'India', coordinates: { lat: 30.1245, lng: 78.3268 } },
    images: getImages('Homestay'),
    amenities: ['Yoga classes', 'River View', 'Vegan Meals', 'Wifi'], maxGuests: 1, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.6, ratingsQuantity: 310
  },
  {
    title: 'South Delhi Designer Loft',
    description: 'A chic, sunlit loft in an upscale neighborhood. Close to trendy cafes and Hauz Khas Village.',
    type: 'Apartment', pricePerNight: 5500,
    location: { address: 'Hauz Khas Village', city: 'New Delhi', state: 'Delhi', country: 'India', coordinates: { lat: 28.5535, lng: 77.1936 } },
    images: getImages('Apartment'),
    amenities: ['Wifi', 'Kitchen', 'Workspace', 'Air conditioning', 'Smart TV'], maxGuests: 3, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.7, ratingsQuantity: 280
  },
  {
    title: 'French Quarter Heritage Home',
    description: 'Step back in time in this restored 18th-century French colonial house.',
    type: 'Villa', pricePerNight: 8000,
    location: { address: 'White Town', city: 'Pondicherry', state: 'Puducherry', country: 'India', coordinates: { lat: 11.9322, lng: 79.8336 } },
    images: getImages('Villa'),
    amenities: ['Courtyard', 'Wifi', 'Air conditioning', 'Bicycle rental', 'Library'], maxGuests: 4, bedroomCount: 2, bathroomCount: 2, ratingsAverage: 4.8, ratingsQuantity: 195
  },
  {
    title: 'Darjeeling Tea Estate Bungalow',
    description: 'A charming colonial-era bungalow set amidst rolling tea gardens.',
    type: 'Villa', pricePerNight: 15000,
    location: { address: 'Glenburn Tea Estate', city: 'Darjeeling', state: 'West Bengal', country: 'India', coordinates: { lat: 27.0360, lng: 88.2627 } },
    images: getImages('Homestay'),
    amenities: ['Mountain View', 'Fireplace', 'Meals included', 'Tea Tasting', 'Library'], maxGuests: 6, bedroomCount: 3, bathroomCount: 3, ratingsAverage: 4.9, ratingsQuantity: 154
  },
  {
    title: 'Nilgiri Hills Colonial Cottage',
    description: 'Quaint stone cottage with an English garden. Perfect for a cozy retreat.',
    type: 'Homestay', pricePerNight: 4000,
    location: { address: 'Botanical Garden Road', city: 'Ooty', state: 'Tamil Nadu', country: 'India', coordinates: { lat: 11.4102, lng: 76.6950 } },
    images: getImages('Homestay'),
    amenities: ['Garden View', 'Fireplace', 'Wifi', 'Kitchen', 'Free parking'], maxGuests: 4, bedroomCount: 2, bathroomCount: 1, ratingsAverage: 4.5, ratingsQuantity: 220
  },
  {
    title: 'Thar Desert Luxury Camp',
    description: 'Experience the magic of the desert in a luxurious Swiss tent.',
    type: 'Villa', pricePerNight: 7500,
    location: { address: 'Sam Sand Dunes', city: 'Jaisalmer', state: 'Rajasthan', country: 'India', coordinates: { lat: 26.9157, lng: 70.9083 } },
    images: getImages('Villa'),
    amenities: ['Desert Safari', 'Cultural nights', 'Meals included', 'Attached washroom', 'Bonfire'], maxGuests: 2, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.8, ratingsQuantity: 367
  },
  {
    title: 'Ghat-side Heritage Guesthouse',
    description: 'A deeply spiritual stay overlooking the ancient ghats.',
    type: 'Room', pricePerNight: 1800,
    location: { address: 'Dashashwamedh Ghat', city: 'Varanasi', state: 'Uttar Pradesh', country: 'India', coordinates: { lat: 25.3109, lng: 83.0076 } },
    images: getImages('Hotel'),
    amenities: ['River View', 'Wifi', 'Rooftop yoga', 'Air conditioning'], maxGuests: 2, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.4, ratingsQuantity: 412
  },
  {
    title: 'ECR Beach Resort Suite',
    description: 'Contemporary beachfront suite with panoramic ocean views.',
    type: 'Villa', pricePerNight: 9000,
    location: { address: 'East Coast Road', city: 'Chennai', state: 'Tamil Nadu', country: 'India', coordinates: { lat: 12.8368, lng: 80.2458 } },
    images: getImages('Hotel'),
    amenities: ['Ocean View', 'Pool', 'Spa', 'Wifi', 'Breakfast included', 'Gym'], maxGuests: 2, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.7, ratingsQuantity: 288
  },
  {
    title: 'Koregaon Park Studio',
    description: 'Trendy studio apartment near Osho Ashram.',
    type: 'Apartment', pricePerNight: 3200,
    location: { address: 'Koregaon Park', city: 'Pune', state: 'Maharashtra', country: 'India', coordinates: { lat: 18.5362, lng: 73.8939 } },
    images: getImages('Apartment'),
    amenities: ['Wifi', 'Kitchen', 'Air conditioning', 'Smart TV', 'Balcony'], maxGuests: 2, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.6, ratingsQuantity: 175
  },
  {
    title: 'Coffee Estate Homestay',
    description: 'Get away from the city chaos in this serene homestay located inside a working coffee estate.',
    type: 'Homestay', pricePerNight: 4500,
    location: { address: 'Madikeri', city: 'Coorg', state: 'Karnataka', country: 'India', coordinates: { lat: 12.4244, lng: 75.7382 } },
    images: getImages('Homestay'),
    amenities: ['Plantation Tour', 'Meals included', 'Bonfire', 'Wifi', 'Free parking'], maxGuests: 4, bedroomCount: 2, bathroomCount: 2, ratingsAverage: 4.8, ratingsQuantity: 210
  },
  {
    title: 'Secluded Wood Cabin',
    description: 'An A-frame wooden cabin surrounded by thick pine forests.',
    type: 'Room', pricePerNight: 5000,
    location: { address: 'Mashobra', city: 'Shimla', state: 'Himachal Pradesh', country: 'India', coordinates: { lat: 31.1309, lng: 77.2025 } },
    images: getImages('Homestay'),
    amenities: ['Mountain View', 'Fireplace', 'Kitchen', 'Pet friendly', 'Free parking'], maxGuests: 2, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.9, ratingsQuantity: 95
  },
  {
    title: 'Premium Hi-Tech Service Apartment',
    description: 'Stylishly furnished service apartment in the heart of Cyberabad.',
    type: 'Apartment', pricePerNight: 4000,
    location: { address: 'HITEC City', city: 'Hyderabad', state: 'Telangana', country: 'India', coordinates: { lat: 17.4483, lng: 78.3785 } },
    images: getImages('Apartment'),
    amenities: ['Smart Home Automation', 'High-speed Wifi', 'Gym', 'Kitchen', 'Cleaning service'], maxGuests: 3, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.5, ratingsQuantity: 185
  }
];

const aiProperties = [
  {
    title: 'Futuristic Cliffside Glass House',
    description: 'An architectural marvel suspended over a cliff with panoramic ocean views at sunset.',
    type: 'Villa', pricePerNight: 35000,
    location: { address: 'Cliff Drive', city: 'Malibu', state: 'California', country: 'USA', coordinates: { lat: 34.0259, lng: -118.7798 } },
    images: [{ url: '/ai_properties/prop_1.png', publicId: 'ai1' }],
    amenities: ['Infinity Pool', 'Smart Home', 'Wifi', 'Air conditioning', 'Chef'], maxGuests: 6, bedroomCount: 3, bathroomCount: 4, ratingsAverage: 5.0, ratingsQuantity: 42
  },
  {
    title: 'Underwater Luxury Pod',
    description: 'A once-in-a-lifetime experience sleeping beneath the waves in a luxury pod surrounded by coral reefs.',
    type: 'Hotel', pricePerNight: 75000,
    location: { address: 'Great Barrier Reef', city: 'Cairns', state: 'Queensland', country: 'Australia', coordinates: { lat: -16.9203, lng: 145.7710 } },
    images: [{ url: '/ai_properties/prop_2.png', publicId: 'ai2' }],
    amenities: ['Submarine tour', 'Scuba gear', 'Chef', 'Air conditioning'], maxGuests: 2, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.9, ratingsQuantity: 18
  },
  {
    title: 'Cyberpunk Neon Apartment',
    description: 'Immerse yourself in the neon glow of this futuristic cyberpunk high-rise apartment.',
    type: 'Apartment', pricePerNight: 12000,
    location: { address: 'Neo-Shinjuku', city: 'Tokyo', state: 'Tokyo', country: 'Japan', coordinates: { lat: 35.6938, lng: 139.7034 } },
    images: [{ url: '/ai_properties/prop_3.png', publicId: 'ai3' }],
    amenities: ['VR Setup', 'Smart Home', 'Wifi', 'Air conditioning'], maxGuests: 2, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.8, ratingsQuantity: 84
  },
  {
    title: 'Enchanted Forest Treehouse',
    description: 'A magical retreat built into an ancient oak tree, surrounded by glowing fairy lights.',
    type: 'Homestay', pricePerNight: 4500,
    location: { address: 'Black Forest', city: 'Baden-Baden', state: 'Baden-Württemberg', country: 'Germany', coordinates: { lat: 48.7610, lng: 8.2400 } },
    images: [{ url: '/ai_properties/prop_4.png', publicId: 'ai4' }],
    amenities: ['Fireplace', 'Nature walk', 'Breakfast included', 'Heater'], maxGuests: 4, bedroomCount: 2, bathroomCount: 1.5, ratingsAverage: 5.0, ratingsQuantity: 110
  },
  {
    title: 'Floating Island Luxury Villa',
    description: 'Reach maximum serenity in this architectural masterpiece on a floating island above the clouds.',
    type: 'Villa', pricePerNight: 150000,
    location: { address: 'Sky Sector 7', city: 'Cloud City', state: 'Stratosphere', country: 'Earth', coordinates: { lat: 0.0, lng: 0.0 } },
    images: [{ url: '/ai_properties/prop_5.png', publicId: 'ai5' }],
    amenities: ['Grav-pad landing', 'Infinity Waterfall', 'Wifi', 'Spa', 'Butler'], maxGuests: 8, bedroomCount: 4, bathroomCount: 5, ratingsAverage: 5.0, ratingsQuantity: 5
  },
  {
    title: 'Martian Habitat Dome',
    description: 'A cozy botanical garden enclosed in a reinforced glass dome on the red planet.',
    type: 'Homestay', pricePerNight: 200000,
    location: { address: 'Colony 1', city: 'Olympus Mons', state: 'Tharsis', country: 'Mars', coordinates: { lat: 18.65, lng: 226.2 } },
    images: [{ url: '/ai_properties/prop_6.png', publicId: 'ai6' }],
    amenities: ['O2 Recycler', 'Hydroponics lab', 'Starlink Wifi', 'Heater'], maxGuests: 4, bedroomCount: 2, bathroomCount: 2, ratingsAverage: 4.6, ratingsQuantity: 22
  },
  {
    title: 'Minimalist Zen Resort',
    description: 'Find inner peace at our geometric Zen resort featuring mist-covered reflection pools.',
    type: 'Hotel', pricePerNight: 8000,
    location: { address: 'Kyoto Hills', city: 'Kyoto', state: 'Kyoto', country: 'Japan', coordinates: { lat: 35.0116, lng: 135.7681 } },
    images: [{ url: '/ai_properties/prop_7.png', publicId: 'ai7' }],
    amenities: ['Hot Spring', 'Meditation Room', 'Wifi', 'Tea Ceremony'], maxGuests: 2, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.9, ratingsQuantity: 340
  },
  {
    title: 'Steampunk Victorian Mansion',
    description: 'A grand mansion packed with brass gears, copper pipes, and ornate mechanical contraptions.',
    type: 'Villa', pricePerNight: 25000,
    location: { address: 'Clockwork Avenue', city: 'London', state: 'England', country: 'UK', coordinates: { lat: 51.5072, lng: -0.1276 } },
    images: [{ url: '/ai_properties/prop_8.png', publicId: 'ai8' }],
    amenities: ['Library', 'Automated Butler', 'Fireplace', 'Wifi'], maxGuests: 10, bedroomCount: 5, bathroomCount: 4, ratingsAverage: 4.7, ratingsQuantity: 67
  },
  {
    title: 'Micro-Living Pod',
    description: 'Experience futuristic urban density in this highly optimized, foldable smart pod.',
    type: 'Apartment', pricePerNight: 3000,
    location: { address: 'Sector 4', city: 'Neo-Seoul', state: 'Seoul', country: 'South Korea', coordinates: { lat: 37.5665, lng: 126.9780 } },
    images: [{ url: '/ai_properties/prop_9.png', publicId: 'ai9' }],
    amenities: ['Smart Walls', 'Fast Wifi', 'Air conditioning', 'Food synth'], maxGuests: 1, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.4, ratingsQuantity: 120
  },
  {
    title: 'Luxury Limestone Cave',
    description: 'An ultra-luxurious dwelling carved naturally into a limestone cave with a private underground pool.',
    type: 'Homestay', pricePerNight: 18000,
    location: { address: 'Cappadocia Valleys', city: 'Goreme', state: 'Nevsehir', country: 'Turkey', coordinates: { lat: 38.6431, lng: 34.8291 } },
    images: [{ url: '/ai_properties/prop_10.png', publicId: 'ai10' }],
    amenities: ['Indoor Pool', 'Fire Pit', 'Wifi', 'Breakfast included'], maxGuests: 2, bedroomCount: 1, bathroomCount: 1, ratingsAverage: 4.9, ratingsQuantity: 215
  }
];

dummyProperties.push(...aiProperties);

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected!');

    console.log('Clearing existing Properties...');
    await Property.deleteMany();
    
    let hostUser = await User.findOne({ email: 'host@stayscape.com' });
    
    if (!hostUser) {
       console.log('Creating dummy Host User...');
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash('password123', salt);
       hostUser = await User.create({
         name: 'StayScape SuperHost',
         email: 'host@stayscape.com',
         password: hashedPassword,
         role: 'host',
         avatar: 'https://ui-avatars.com/api/?name=Super+Host&background=random'
       });
    }

    console.log('Injecting dummy Properties...');
    const propertiesToInsert = dummyProperties.map(prop => ({
      ...prop,
      hostId: hostUser._id
    }));

    await Property.insertMany(propertiesToInsert);
    console.log(`Successfully added ${propertiesToInsert.length} properties!`);

    process.exit();
  } catch (error) {
    console.error('Error with data imports:', error);
    process.exit(1);
  }
};

seedDB();
