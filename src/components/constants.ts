export const weeklyMenu: { [day: string]: { breakfast: any[]; lunch: any[] } } = {
  monday: {
    breakfast: [
      { name: { en: 'Moong chaat (moong, tomato, onion etc.)', gu: 'મગ ચાટ (મગ, ટામેટા, ડુંગળી વગેરે)' }, quantity: '38', emoji: '🥗' },
    ],
    lunch: [
      { name: { en: 'Tuver dal khichdi', gu: 'તુવેર દાળ ખિચડી' }, quantity: '80', emoji: '🍛' },
      { name: { en: 'Gol vadi fada lapsi', gu: 'ગોળવાડિ ફાડા લાપસી' }, quantity: '35', emoji: '🍚' },
      { name: { en: 'Shaak (seasonal vegetables)', gu: 'શાક (ઋતુ પ્રમાણે વિવિધ શાકભાજી)' }, quantity: '50', emoji: '🥬' },
    ],
  },

  tuesday: {
    breakfast: [
      { name: { en: 'Vegetable poha (peanuts, potato, onion, tomato, beet etc.)', gu: 'વેજીટેબલ પૌવા (સિંગદાણા, બટાટા, ડુંગળી, ટામેટા, બીટ વગેરે)' }, quantity: '51', emoji: '🥣' },
    ],
    lunch: [
      {
        name: {
          en: 'Mix-veg tuver dal khichdi (seasonal vegetables)',
          gu: 'મિક્ષ વેજ તુવેર દાળ ખિચડી(ઋતુ પ્રમાણે વિવિધ શાકભાજી)',
        },
        quantity: '200',
        emoji: '🍲',
      },
    ],
  },

  wednesday: {
    breakfast: [
      { name: { en: 'Mixed pulses chaat (chana, moong, math, chola, peanuts, onion, tomato)', gu: 'મિક્સ કઠોળ ચાટ (ચણા, મગ, મઠ, ચોળા, સિંગદાણા, ડુંગળી, ટામેટા)' }, quantity: '46', emoji: '🥗' },
    ],
    lunch: [
      { name: { en: 'Mix-veg shaak (seasonal vegetables)', gu: 'મિક્ષ વેજ શાક (ઋતુ પ્રમાણે વિવિધ શાકભાજી)' }, quantity: '100', emoji: '🥘' },
      { name: { en: 'Chana', gu: 'ચણા' }, quantity: '20', emoji: '🥣' },
      { name: { en: 'Rice', gu: 'ભાત' }, quantity: '20', emoji: '🍚' },
    ],
  },

  thursday: {
    breakfast: [
      { name: { en: 'Shri ann (millet) sukhdi (millet flour, peanuts, jaggery etc.)', gu: 'શ્રી અન્ન (મિલેટ) સુખડી (શ્રી અન્ન લોટ ,સિંગદાણા ગોળ વગેરે)' }, quantity: '82', emoji: '🍬' },
    ],
    lunch: [
      { name: { en: 'Mix-veg dal dhokdi', gu: 'મિક્ષ વેજ દાળ ઢોકળી' }, quantity: '80', emoji: '🍛' },
      { name: { en: 'Rice', gu: 'ભાત' }, quantity: '20', emoji: '🍚' },
    ],
  },

  friday: {
    breakfast: [
      { name: { en: 'Vegetable upma (peanuts, potato, onion, tomato, peas, carrot etc.)', gu: 'વેજીટેબલ ઉપમા (સિંગદાણા, બટાટા, ડુંગળી, ટામેટા, વટાણા, ગાજર વગેરે)' }, quantity: '53', emoji: '🥣' },
    ],
    lunch: [
      { name: { en: 'Dal', gu: 'દાળ' }, quantity: '80', emoji: '🍛' },
      { name: { en: 'Rice', gu: 'ભાત' }, quantity: '5', emoji: '🍚' },
      { name: { en: 'Shaak (seasonal vegetables)', gu: 'શાક (ઋતુ પ્રમાણે વિવિધ શાકભાજી)' }, quantity: '50', emoji: '🥬' },
    ],
  },

  saturday: {
    breakfast: [
      { name: { en: 'Vegetable poha (peanuts, potato, onion, tomato, beet etc.)', gu: 'વેજીટેબલ પૌવા (સિંગદાણા, બટાટા, ડુંગળી, ટામેટા, બીટ વગેરે)' }, quantity: '51', emoji: '🥣' },
    ],
    lunch: [
      { name: { en: 'Mix-veg chana nu shaak', gu: 'મિક્ષ વેજ ચણા નું શાક' }, quantity: '100', emoji: '🥙' },
      { name: { en: 'thepla / mix-veg muthiya', gu: ' થેપલા / મિક્ષ વેજ મુઠીયા' }, quantity: '20', emoji: '🫓' },
    ],
  },
};

export const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
