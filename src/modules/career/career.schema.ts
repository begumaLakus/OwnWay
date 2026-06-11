export interface SubmitCareerTestInput {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export const submitCareerTestSchema = {
  body: {
    type: 'object',
    required: ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'],
    properties: {
      realistic: { type: 'number', minimum: 8, maximum: 40 },
      investigative: { type: 'number', minimum: 8, maximum: 40 },
      artistic: { type: 'number', minimum: 8, maximum: 40 },
      social: { type: 'number', minimum: 8, maximum: 40 },
      enterprising: { type: 'number', minimum: 8, maximum: 40 },
      conventional: { type: 'number', minimum: 8, maximum: 40 },
    },
  },
};