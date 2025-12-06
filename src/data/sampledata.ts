import type { Category } from '../types/game.types';

export const categories: Category[] = [
  {
    id: 'sports',
    name: 'Sports',
    answers: [
      { text: 'football', obscurityScore: 1 },
      { text: 'basketball', obscurityScore: 1 },
      { text: 'soccer', obscurityScore: 1 },
      { text: 'tennis', obscurityScore: 1 },
      { text: 'curling', obscurityScore: 2 },
      { text: 'lacrosse', obscurityScore: 2 },
      { text: 'bobsledding', obscurityScore: 3 },
      { text: 'skeleton', obscurityScore: 3 },
      { text: 'biathlon', obscurityScore: 3 },
    ]
  },
  {
    id: 'fruits',
    name: 'Fruits',
    answers: [
      { text: 'apple', obscurityScore: 1 },
      { text: 'banana', obscurityScore: 1 },
      { text: 'orange', obscurityScore: 1 },
      { text: 'mango', obscurityScore: 2 },
      { text: 'papaya', obscurityScore: 2 },
      { text: 'dragonfruit', obscurityScore: 3 },
      { text: 'rambutan', obscurityScore: 3 },
    ]
  }
];