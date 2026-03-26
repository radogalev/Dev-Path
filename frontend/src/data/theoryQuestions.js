export const buildFallbackTheoryQuestions = (lectureData) => {
  const templates = [
    `Which statement best describes ${lectureData.title}?`,
    `Why is ${lectureData.title} important when building applications?`,
    `Which option is the most accurate understanding of ${lectureData.title}?`,
  ];

  return templates.map((question, index) => ({
    id: `fallback-theory-${lectureData.id}-${index + 1}`,
    title: `Theory Test ${index + 1}: ${lectureData.title}`,
    difficulty: 'Easy',
    language: 'Theory',
    kind: 'theoretical',
    prompt: `Choose the best explanation for the lesson concept: ${lectureData.title}.`,
    question,
    options: [
      { id: 'A', text: `A correct explanation of ${lectureData.title} and its practical use.` },
      { id: 'B', text: 'A statement that is partially true but misses the core idea.' },
      { id: 'C', text: 'An explanation for a different concept.' },
      { id: 'D', text: 'A claim this concept has no practical purpose.' },
    ],
    correctOption: 'A',
    inputDescription: 'Select one option: A, B, C, or D.',
    outputDescription: 'Selected option id.',
    constraints: ['Only one option can be selected'],
    exampleInput: 'A',
    exampleOutput: 'A',
    starterCode: '',
  }));
};
