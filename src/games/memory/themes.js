/**
 * Temas do jogo original. Nomes, imagens e verso batem com o seed da MST API
 * (card_theme / card_template), então o modo local e o online mostram as mesmas cartas.
 */
const DIR = 'img/Jogo_da_Memoria'

export const themes = [
  {
    key: 'RM',
    name: 'Rick and Morty',
    label: 'Rick And Morty',
    backImagePath: `${DIR}/back_RM.png`,
    cards: [
      { id: 'beth', label: 'Beth', imagePath: `${DIR}/beth.png` },
      { id: 'jerry', label: 'Jerry', imagePath: `${DIR}/jerry.png` },
      { id: 'jessica', label: 'Jessica', imagePath: `${DIR}/jessica.png` },
      { id: 'morty', label: 'Morty', imagePath: `${DIR}/morty.png` },
      { id: 'pessoa-passaro', label: 'Pessoa-Pássaro', imagePath: `${DIR}/pessoa-passaro.png` },
      { id: 'pickle-rick', label: 'Pickle Rick', imagePath: `${DIR}/pickle-rick.png` },
      { id: 'rick', label: 'Rick', imagePath: `${DIR}/rick.png` },
      { id: 'summer', label: 'Summer', imagePath: `${DIR}/summer.png` },
      { id: 'meeseeks', label: 'Mr. Meeseeks', imagePath: `${DIR}/meeseeks.png` },
    ],
  },
  {
    key: 'HA',
    name: 'Cartoon',
    label: 'Cartoon',
    backImagePath: `${DIR}/back_HA.png`,
    cards: Array.from({ length: 9 }, (_, i) => ({
      id: `CN${i + 1}`,
      label: `Personagem ${i + 1}`,
      imagePath: `${DIR}/CN${i + 1}.png`,
    })),
  },
  {
    key: 'ET',
    name: 'Escudos de Time',
    label: 'Escudo de Time',
    backImagePath: `${DIR}/back_ET.png`,
    cards: Array.from({ length: 9 }, (_, i) => ({
      id: `ET${i + 1}`,
      label: `Escudo ${i + 1}`,
      imagePath: `${DIR}/ET${i + 1}.png`,
    })),
  },
]
