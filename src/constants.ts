/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface ExpressionTemplate {
  id: string;
  label: string; 
  latex: string; 
  variables: ('x' | 'y')[];
  difficulty: Difficulty;
  formula: (v: Record<string, number>) => number;
}

export const EXPRESSIONS: ExpressionTemplate[] = [
  // ONE VARIABLE - EASY (15)
  { id: '1v-e-1', label: 'x + 1', latex: 'x + 1', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => v.x + 1 },
  { id: '1v-e-2', label: 'x + 5', latex: 'x + 5', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => v.x + 5 },
  { id: '1v-e-3', label: 'x + 10', latex: 'x + 10', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => v.x + 10 },
  { id: '1v-e-4', label: '2x', latex: '2x', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => 2 * v.x },
  { id: '1v-e-5', label: '3x', latex: '3x', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => 3 * v.x },
  { id: '1v-e-6', label: 'x - 1', latex: 'x - 1', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => v.x - 1 },
  { id: '1v-e-7', label: 'x - 5', latex: 'x - 5', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => v.x - 5 },
  { id: '1v-e-8', label: '5x', latex: '5x', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => 5 * v.x },
  { id: '1v-e-9', label: '10x', latex: '10x', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => 10 * v.x },
  { id: '1v-e-10', label: 'x + x', latex: 'x + x', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => 2 * v.x },
  { id: '1v-e-11', label: 'x - x', latex: 'x - x', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => 0 },
  { id: '1v-e-12', label: '0x', latex: '0x', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => 0 },
  { id: '1v-e-13', label: 'x + 20', latex: 'x + 20', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => v.x + 20 },
  { id: '1v-e-14', label: 'x - 10', latex: 'x - 10', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => v.x - 10 },
  { id: '1v-e-15', label: '4x', latex: '4x', variables: ['x'], difficulty: Difficulty.EASY, formula: (v) => 4 * v.x },

  // ONE VARIABLE - MEDIUM (15)
  { id: '1v-m-1', label: '2x + 1', latex: '2x + 1', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => 2 * v.x + 1 },
  { id: '1v-m-2', label: '2x - 3', latex: '2x - 3', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => 2 * v.x - 3 },
  { id: '1v-m-3', label: '3x + 5', latex: '3x + 5', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => 3 * v.x + 5 },
  { id: '1v-m-4', label: 'x / 2', latex: '\\frac{x}{2}', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => v.x / 2 },
  { id: '1v-m-5', label: '10 - x/2', latex: '10 - \\frac{x}{2}', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => 10 - v.x / 2 },
  { id: '1v-m-6', label: '2(x + 5)', latex: '2(x + 5)', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => 2 * (v.x + 5) },
  { id: '1v-m-7', label: '3(x - 2)', latex: '3(x - 2)', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => 3 * (v.x - 2) },
  { id: '1v-m-8', label: 'x² + 1', latex: 'x^2 + 1', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => v.x * v.x + 1 },
  { id: '1v-m-9', label: 'x² - 1', latex: 'x^2 - 1', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => v.x * v.x - 1 },
  { id: '1v-m-10', label: '10 - 2x', latex: '10 - 2x', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => 10 - 2 * v.x },
  { id: '1v-m-11', label: '3x - 10', latex: '3x - 10', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => 3 * v.x - 10 },
  { id: '1v-m-12', label: 'x + 15', latex: 'x + 15', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => v.x + 15 },
  { id: '1v-m-13', label: '2x + 10', latex: '2x + 10', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => 2 * v.x + 10 },
  { id: '1v-m-14', label: '5(x - 1)', latex: '5(x - 1)', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => 5 * (v.x - 1) },
  { id: '1v-m-15', label: 'x/2 + 5', latex: '\\frac{x}{2} + 5', variables: ['x'], difficulty: Difficulty.MEDIUM, formula: (v) => v.x / 2 + 5 },

  // ONE VARIABLE - HARD (15)
  { id: '1v-h-1', label: '2x² + x', latex: '2x^2 + x', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => 2 * v.x * v.x + v.x },
  { id: '1v-h-2', label: 'x² / 2', latex: '\\frac{x^2}{2}', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => (v.x * v.x) / 2 },
  { id: '1v-h-3', label: '3x² - 5', latex: '3x^2 - 5', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => 3 * v.x * v.x - 5 },
  { id: '1v-h-4', label: '5(2x + 1)', latex: '5(2x + 1)', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => 5 * (2 * v.x + 1) },
  { id: '1v-h-5', label: '(x + 1)²', latex: '(x + 1)^2', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => Math.pow(v.x + 1, 2) },
  { id: '1v-h-6', label: '(x - 2)²', latex: '(x - 2)^2', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => Math.pow(v.x - 2, 2) },
  { id: '1v-h-7', label: 'x³ - x', latex: 'x^3 - x', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => Math.pow(v.x, 3) - v.x },
  { id: '1v-h-8', label: '10x / 2', latex: '\\frac{10x}{2}', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => 5 * v.x },
  { id: '1v-h-9', label: '(x + 10) / 2', latex: '\\frac{x + 10}{2}', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => (v.x + 10) / 2 },
  { id: '1v-h-10', label: 'x² + 2x + 1', latex: 'x^2 + 2x + 1', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => v.x * v.x + 2 * v.x + 1 },
  { id: '1v-h-11', label: '3x³ + 4', latex: '3x^3 + 4', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => 3 * Math.pow(v.x, 3) + 4 },
  { id: '1v-h-12', label: 'x² - 4x + 4', latex: 'x^2 - 4x + 4', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => v.x * v.x - 4 * v.x + 4 },
  { id: '1v-h-13', label: 'x / 0.5', latex: '\\frac{x}{0.5}', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => v.x / 0.5 },
  { id: '1v-h-14', label: 'x² + x + 1', latex: 'x^2 + x + 1', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => v.x * v.x + v.x + 1 },
  { id: '1v-h-15', label: '2(3x - 4)', latex: '2(3x - 4)', variables: ['x'], difficulty: Difficulty.HARD, formula: (v) => 2 * (3 * v.x - 4) },

  // TWO VARIABLES - EASY (15)
  { id: '2v-e-1', label: 'x + y', latex: 'x + y', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => v.x + v.y },
  { id: '2v-e-2', label: 'x - y', latex: 'x - y', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => v.x - v.y },
  { id: '2v-e-3', label: 'y - x', latex: 'y - x', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => v.y - v.x },
  { id: '2v-e-4', label: '2x + y', latex: '2x + y', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => 2 * v.x + v.y },
  { id: '2v-e-5', label: 'x + 2y', latex: 'x + 2y', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => v.x + 2 * v.y },
  { id: '2v-e-6', label: 'x + y + 1', latex: 'x + y + 1', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => v.x + v.y + 1 },
  { id: '2v-e-7', label: 'x + y - 1', latex: 'x + y - 1', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => v.x + v.y - 1 },
  { id: '2v-e-8', label: '2x + 2y', latex: '2x + 2y', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => 2 * v.x + 2 * v.y },
  { id: '2v-e-9', label: '3x + y', latex: '3x + y', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => 3 * v.x + v.y },
  { id: '2v-e-10', label: 'x + 3y', latex: 'x + 3y', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => v.x + 3 * v.y },
  { id: '2v-e-11', label: 'x * y', latex: 'x \\cdot y', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => v.x * v.y },
  { id: '2v-e-12', label: '2xy', latex: '2xy', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => 2 * v.x * v.y },
  { id: '2v-e-13', label: 'x - y + 10', latex: 'x - y + 10', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => v.x - v.y + 10 },
  { id: '2v-e-14', label: 'y - x + 5', latex: 'y - x + 5', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => v.y - v.x + 5 },
  { id: '2v-e-15', label: 'x + y + 5', latex: 'x + y + 5', variables: ['x', 'y'], difficulty: Difficulty.EASY, formula: (v) => v.x + v.y + 5 },

  // TWO VARIABLES - MEDIUM (15)
  { id: '2v-m-1', label: '2x + 2y + 5', latex: '2x + 2y + 5', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => 2 * v.x + 2 * v.y + 5 },
  { id: '2v-m-2', label: '3x - y + 2', latex: '3x - y + 2', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => 3 * v.x - v.y + 2 },
  { id: '2v-m-3', label: '2(x + y)', latex: '2(x + y)', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => 2 * (v.x + v.y) },
  { id: '2v-m-4', label: 'x² + y', latex: 'x^2 + y', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => v.x * v.x + v.y },
  { id: '2v-m-5', label: 'y² + x', latex: 'y^2 + x', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => v.y * v.y + v.x },
  { id: '2v-m-6', label: 'x/2 + y', latex: '\\frac{x}{2} + y', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => v.x / 2 + v.y },
  { id: '2v-m-7', label: 'y/2 + x', latex: '\\frac{y}{2} + x', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => v.y / 2 + v.x },
  { id: '2v-m-8', label: '2xy + 1', latex: '2xy + 1', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => 2 * v.x * v.y + 1 },
  { id: '2v-m-9', label: 'xy - 5', latex: 'xy - 5', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => v.x * v.y - 5 },
  { id: '2v-m-10', label: '3x + y²', latex: '3x + y^2', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => 3 * v.x + v.y * v.y },
  { id: '2v-m-11', label: '2y - x²', latex: '2y - x^2', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => 2 * v.y - v.x * v.x },
  { id: '2v-m-12', label: 'x + y - 10', latex: 'x + y - 10', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => v.x + v.y - 10 },
  { id: '2v-m-13', label: '5x + 2y', latex: '5x + 2y', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => 5 * v.x + 2 * v.y },
  { id: '2v-m-14', label: '2x - 5y', latex: '2x - 5y', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => 2 * v.x - 5 * v.y },
  { id: '2v-m-15', label: 'xy / 5', latex: '\\frac{xy}{5}', variables: ['x', 'y'], difficulty: Difficulty.MEDIUM, formula: (v) => (v.x * v.y) / 5 },

  // TWO VARIABLES - HARD (15)
  { id: '2v-h-1', label: 'x² + y²', latex: 'x^2 + y^2', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => v.x * v.x + v.y * v.y },
  { id: '2v-h-2', label: '(x + y)²', latex: '(x + y)^2', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => Math.pow(v.x + v.y, 2) },
  { id: '2v-h-3', label: '(x - y)²', latex: '(x - y)^2', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => Math.pow(v.x - v.y, 2) },
  { id: '2v-h-4', label: '2x² - y', latex: '2x^2 - y', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => 2 * v.x * v.x - v.y },
  { id: '2v-h-5', label: '3y² - x', latex: '3y^2 - x', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => 3 * v.y * v.y - v.x },
  { id: '2v-h-6', label: 'xy / 2', latex: '\\frac{xy}{2}', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => (v.x * v.y) / 2 },
  { id: '2v-h-7', label: '2(x² + y)', latex: '2(x^2 + y)', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => 2 * (v.x * v.x + v.y) },
  { id: '2v-h-8', label: '(2x + y)²', latex: '(2x + y)^2', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => Math.pow(2 * v.x + v.y, 2) },
  { id: '2v-h-9', label: 'x² - y²', latex: 'x^2 - y^2', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => v.x * v.x - v.y * v.y },
  { id: '2v-h-10', label: '3xy² + x', latex: '3xy^2 + x', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => 3 * v.x * v.y * v.y + v.x },
  { id: '2v-h-11', label: '2yx² - y', latex: '2yx^2 - y', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => 2 * v.y * v.x * v.x - v.y },
  { id: '2v-h-12', label: '(x + 1)(y + 1)', latex: '(x + 1)(y + 1)', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => (v.x + 1) * (v.y + 1) },
  { id: '2v-h-13', label: 'x² + 2xy + y²', latex: 'x^2 + 2xy + y^2', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => v.x * v.x + 2 * v.x * v.y + v.y * v.y },
  { id: '2v-h-14', label: 'x³ + y³', latex: 'x^3 + y^3', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => Math.pow(v.x, 3) + Math.pow(v.y, 3) },
  { id: '2v-h-15', label: '100 / (x+y)', latex: '\\frac{100}{x + y}', variables: ['x', 'y'], difficulty: Difficulty.HARD, formula: (v) => Math.round(100 / (v.x + v.y)) },
];

export enum GameState {
  LOBBY = 'LOBBY',
  PREVIEW_EXPRESSIONS = 'PREVIEW_EXPRESSIONS',
  PLAYING = 'PLAYING',
  SCORING = 'SCORING',
  PARTIAL_RESULTS = 'PARTIAL_RESULTS',
  RESULTS = 'RESULTS'
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  totalScore: number;
}
