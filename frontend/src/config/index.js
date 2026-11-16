import { validateDeployment } from './validate.js';

// Raw import also lets malformed JSON produce a useful page instead of a build error.
const files = import.meta.glob('./deployment.local.json', {
  query: '?raw', import: 'default', eager: true,
});
export const deployment = validateDeployment(files['./deployment.local.json']);
