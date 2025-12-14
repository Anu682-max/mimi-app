// Sample users for testing discover feature
export const sampleUsers = [
  {
    id: 'user-1',
    firstName: 'Ariuka',
    lastName: 'Batkhuyag',
    age: 24,
    gender: 'female',
    bio: 'Зураг зурах дуртай, аялал хийх хоббитой 🎨✈️',
    occupation: 'Graphic Designer',
    city: 'Ulaanbaatar',
    country: 'Mongolia',
    photos: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Ariuka'],
    interests: ['Зураг', 'Аялал', 'Уран бүтээл', 'Кино'],
  },
  {
    id: 'user-2',
    firstName: 'Boldbaatar',
    lastName: 'Ganbold',
    age: 27,
    gender: 'male',
    bio: 'IT engineer, спорт сонирхогч 💻⚽',
    occupation: 'Software Engineer',
    city: 'Ulaanbaatar',
    country: 'Mongolia',
    photos: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Bold'],
    interests: ['Програмчлал', 'Хөл бөмбөг', 'Номын клуб'],
  },
  {
    id: 'user-3',
    firstName: 'Nandin',
    lastName: 'Erdene',
    age: 23,
    gender: 'female',
    bio: 'Хөгжим сонсох, найз нөхөдтэй явах дуртай 🎵👯',
    occupation: 'Marketing Specialist',
    city: 'Seoul',
    country: 'South Korea',
    photos: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Nandin'],
    interests: ['Хөгжим', 'K-pop', 'Зочид хүлээх', 'Хоол хийх'],
  },
  {
    id: 'user-4',
    firstName: 'Enkhjin',
    lastName: 'Munkhbat',
    age: 26,
    gender: 'male',
    bio: 'Уулын аялал, гэрэл зураг авах сонирхолтой 🏔️📸',
    occupation: 'Photographer',
    city: 'Ulaanbaatar',
    country: 'Mongolia',
    photos: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Enkh'],
    interests: ['Гэрэл зураг', 'Уулын аялал', 'Байгаль'],
  },
  {
    id: 'user-5',
    firstName: 'Sarangerel',
    lastName: 'Dorj',
    age: 25,
    gender: 'female',
    bio: 'Бүжиг, фитнесс, эрүүл амьдралын хэв маяг 💃🏋️',
    occupation: 'Fitness Trainer',
    city: 'Tokyo',
    country: 'Japan',
    photos: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Sara'],
    interests: ['Бүжиг', 'Фитнесс', 'Йога', 'Эрүүл хоол'],
  },
  {
    id: 'user-6',
    firstName: 'Ganbat',
    lastName: 'Tseren',
    age: 29,
    gender: 'male',
    bio: 'Бизнес эрхлэгч, хөрөнгө оруулалт сонирхдог 📈💼',
    occupation: 'Entrepreneur',
    city: 'New York',
    country: 'USA',
    photos: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Ganbat'],
    interests: ['Бизнес', 'Хөрөнгө оруулалт', 'Гольф'],
  },
  {
    id: 'user-7',
    firstName: 'Oyunaa',
    lastName: 'Bold',
    age: 22,
    gender: 'female',
    bio: 'Оюутан, хичээл сурах, найз олох хүсэлтэй 📚🌸',
    occupation: 'Student',
    city: 'London',
    country: 'UK',
    photos: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Oyunaa'],
    interests: ['Ном унших', 'Хичээл', 'Coffee', 'Кафе явах'],
  },
  {
    id: 'user-8',
    firstName: 'Munkhbold',
    lastName: 'Bat',
    age: 28,
    gender: 'male',
    bio: 'Хөгжимчин, гитар тоглох сонирхолтой 🎸🎤',
    occupation: 'Musician',
    city: 'Ulaanbaatar',
    country: 'Mongolia',
    photos: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Munkh'],
    interests: ['Хөгжим', 'Гитар', 'Rock', 'Тоглолт'],
  },
];

// In-memory storage for likes and matches
export const userLikes = new Map<string, Set<string>>(); // userId -> Set of liked userIds
export const userMatches = new Map<string, Set<string>>(); // userId -> Set of matched userIds

export function handleSwipe(currentUserId: string, targetUserId: string, action: 'like' | 'pass'): { isMatch: boolean } {
  if (action === 'pass') {
    return { isMatch: false };
  }

  // Add like
  if (!userLikes.has(currentUserId)) {
    userLikes.set(currentUserId, new Set());
  }
  userLikes.get(currentUserId)!.add(targetUserId);

  // Check if target user also liked current user
  const targetLikes = userLikes.get(targetUserId);
  const isMatch = targetLikes?.has(currentUserId) || false;

  if (isMatch) {
    // Add to matches
    if (!userMatches.has(currentUserId)) {
      userMatches.set(currentUserId, new Set());
    }
    if (!userMatches.has(targetUserId)) {
      userMatches.set(targetUserId, new Set());
    }
    userMatches.get(currentUserId)!.add(targetUserId);
    userMatches.get(targetUserId)!.add(currentUserId);
  }

  return { isMatch };
}

export function getMatches(userId: string) {
  const matchIds = userMatches.get(userId) || new Set();
  return sampleUsers.filter(user => matchIds.has(user.id));
}
