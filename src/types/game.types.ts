export interface Category {
  id: string;
  name: string;
  answers: Answer[];
}

interface Answer {
  text: string;
  obscurityScore: 1 | 2 | 3;
}