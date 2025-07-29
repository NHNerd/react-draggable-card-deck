import type { CardType } from '../types/types';

// Spades: (пики) / Hearts: (червы) / Diamonds: (бубны) / Clubs: (трефы)
// Ace (Туз) / Jack (Валет) / Queen (Дама) / King (Король)

const gameDeck = (): CardType[] => {
  const suit: ['S', 'H', 'D', 'C'] = ['S', 'H', 'D', 'C'];
  const ranks: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K'] = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
    'J',
    'Q',
    'K',
  ];

  const link = 'https://deckofcardsapi.com/static/img/';
  const extension = '.png';

  const deck: CardType[] = [];
  for (let i = 0; i < 4; i++) {
    const rank = ranks.map((rank, j) => {
      const card = {
        id: ranks.length * i + j,
        img: link + rank + suit[i] + extension,
        random: Math.random() - 0.5,
      };
      return card;
    });
    deck.push(...rank);
  }

  return deck;
};

export default gameDeck;
